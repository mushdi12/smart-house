package main

import (
	"context"
	"errors"
	"flag"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"smart-house/backend/internal/adapters/rest"
	"smart-house/backend/internal/adapters/rest/middleware"
	"smart-house/backend/internal/adapters/uart"
	"smart-house/backend/internal/closers"
	"smart-house/backend/internal/config"
)

// todo: добавить хранение в БД
// todo: добавить рисовку графиков
// todo: добавить фронтенд
func main() {
	var configPath string
	flag.StringVar(&configPath, "config", "config.yaml", "server configuration file")
	flag.Parse()

	cfg := config.MustLoad(configPath)

	log := setupLogger(cfg.LogLevel)

	log.Info("starting server")

	log.Info("starting server")
	log.Debug("debug messages are enabled")

	espClient, err := uart.NewClient(cfg.PortName, log)
	if err != nil {
		log.Error("cannot init ESP client", "error", err)
		os.Exit(1)
	}
	defer closers.CloseOrLog(log, espClient)

	// для тестирования
	// if err != nil {
	// 	log.Warn("cannot init ESP client, running in stub mode", "error", err)
	// 	espClient = nil
	// } else {
	// 	defer closers.CloseOrLog(log, espClient)
	// }

	// service := core.NewService(espClient, log) ????
	server := mustSetupHTTPServer(log, cfg, espClient)

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()

	go func() {
		<-ctx.Done()
		log.Debug("shutting down server")
		if err := server.Shutdown(context.Background()); err != nil {
			log.Error("erroneous shutdown", "error", err)
		}
	}()

	log.Info("Running HTTP server", "address", server.Addr)
	if err := server.ListenAndServe(); err != nil {
		if !errors.Is(err, http.ErrServerClosed) {
			log.Error("server closed unexpectedly", "error", err)
			return
		}
	}

}

func mustSetupHTTPServer(log *slog.Logger, cfg config.Config, espClient *uart.Client) *http.Server {
	mux := http.NewServeMux()
	//restServer := rest.NewServer(service, log)

	// fan endpoints
	mux.Handle("/api/fan/on", middleware.Logger(rest.NewTurnOnFan(log, espClient), log))
	mux.Handle("/api/fan/off", middleware.Logger(rest.NewTurnOffFan(log, espClient), log))

	// Lamp endpoints
	mux.Handle("/api/lamp/on", middleware.Logger(rest.NewTurnOnLight(log, espClient), log))
	mux.Handle("/api/lamp/off", middleware.Logger(rest.NewTurnOffLight(log, espClient), log))

	// Temperature endpoints
	mux.HandleFunc("/api/temperature/increase", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"success":true,"message":"Температура успешно повышена на 2.5°C","current_temperature":25.5,"previous_temperature":23.0,"timestamp":"2024-01-01T00:00:00Z"}`))
	})
	mux.HandleFunc("/api/temperature/decrease", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"success":true,"message":"Температура успешно понижена на 2.5°C","current_temperature":20.5,"previous_temperature":23.0,"timestamp":"2024-01-01T00:00:00Z"}`))
	})
	mux.HandleFunc("/api/temperature/current", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"temperature":23.5,"unit":"celsius","target_temperature":22.0,"status":"stable","timestamp":"2024-01-01T00:00:00Z"}`))
	})

	// Humidity endpoints
	mux.HandleFunc("/api/humidity/increase", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"success":true,"current_humidity":55.0,"timestamp":"2024-01-01T00:00:00Z"}`))
	})
	mux.HandleFunc("/api/humidity/decrease", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"success":true,"current_humidity":50.0,"timestamp":"2024-01-01T00:00:00Z"}`))
	})
	mux.HandleFunc("/api/humidity/current", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"humidity":52.0,"unit":"percent","status":"stable","timestamp":"2024-01-01T00:00:00Z"}`))
	})

	// Gate endpoints
	mux.HandleFunc("/api/gate/raise", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"success":true,"action":"raise","status":"raising","timestamp":"2024-01-01T00:00:00Z"}`))
	})
	mux.HandleFunc("/api/gate/lower", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"success":true,"action":"lower","status":"lowering","timestamp":"2024-01-01T00:00:00Z"}`))
	})
	mux.HandleFunc("/api/gate/status", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"raised","position":100,"timestamp":"2024-01-01T00:00:00Z"}`))
	})

	// Voltage endpoints
	mux.HandleFunc("/api/voltage/current", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"voltage":220.5,"timestamp":"2024-01-01T00:00:00Z"}`))
	})
	mux.HandleFunc("/api/voltage/history", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"data":[{"timestamp":"2024-01-01T00:00:00Z","voltage":220.5}],"total":1}`))
	})
	mux.HandleFunc("/api/voltage/stats", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"min":215.0,"max":225.0,"avg":220.0,"count":100}`))
	})

	// Auth endpoints
	mux.HandleFunc("/api/auth/login", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"access_token":"stub","refresh_token":"stub","expires_in":3600,"token_type":"Bearer"}`))
	})
	mux.HandleFunc("/api/auth/logout", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"message":"OK"}`))
	})

	// RGB endpoints
	mux.HandleFunc("/api/rgb/on", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"success":true,"status":"on","power":60,"timestamp":"2024-01-01T00:00:00Z"}`))
	})
	mux.HandleFunc("/api/rgb/off", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"success":true,"status":"off","timestamp":"2024-01-01T00:00:00Z"}`))
	})
	mux.HandleFunc("/api/rgb/power", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"success":true,"status":"on","power":80,"timestamp":"2024-01-01T00:00:00Z"}`))
	})

	// Fan endpoints (дополнительные)
	mux.HandleFunc("/api/fan/power", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"success":true,"status":"on","power":50,"timestamp":"2024-01-01T00:00:00Z"}`))
	})
	mux.HandleFunc("/api/fan/status", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"on","power":50,"timestamp":"2024-01-01T00:00:00Z"}`))
	})

	// Motion endpoints
	mux.HandleFunc("/api/motion/enable", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"success":true,"message":"Датчик движения включен","timestamp":"2024-01-01T00:00:00Z"}`))
	})
	mux.HandleFunc("/api/motion/disable", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"success":true,"message":"Датчик движения выключен","timestamp":"2024-01-01T00:00:00Z"}`))
	})
	mux.HandleFunc("/api/motion/notifications", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"success":true,"message":"Настройки сохранены","timestamp":"2024-01-01T00:00:00Z"}`))
	})
	mux.HandleFunc("/api/motion/status", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"enabled":true,"notify_phone":false,"trigger_rgb":false,"timestamp":"2024-01-01T00:00:00Z"}`))
	})

	// Health endpoint
	mux.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"healthy","timestamp":"2024-01-01T00:00:00Z"}`))
	})

	return &http.Server{
		Addr:        cfg.HTTPConfig.Address,
		ReadTimeout: cfg.HTTPConfig.Timeout,
		Handler:     mux,
	}
}

func setupLogger(logLevel string) *slog.Logger {
	var level slog.Level
	switch logLevel {
	case "DEBUG":
		level = slog.LevelDebug
	case "INFO":
		level = slog.LevelInfo
	case "ERROR":
		level = slog.LevelError
	default:
		panic("unknown log level: " + logLevel)
	}
	handler := slog.NewTextHandler(os.Stderr, &slog.HandlerOptions{Level: level})
	return slog.New(handler)
}
