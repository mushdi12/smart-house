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
	// restServer := rest.NewServer(service, log)

	// fan endpoints
	mux.Handle("/api/fan/on", middleware.Logger(rest.NewTurnOnFan(log, espClient), log))
	mux.Handle("/api/fan/off", middleware.Logger(rest.NewTurnOffFan(log, espClient), log))

	// Temperature endpoints
	// mux.Handle("/api/temperature/increase", rest.NewHandleIncreaseTemperature())
	// mux.Handle("/api/temperature/decrease", rest.NewHandleDecreaseTemperature())
	// mux.Handle("/api/temperature/current", rest.NewHandleGetCurrentTemperature())

	// Humidity endpoints
	// mux.Handle("/api/humidity/increase", rest.handleIncreaseHumidity())
	// mux.Handle("/api/humidity/decrease", rest.handleDecreaseHumidity())
	// mux.Handle("/api/humidity/current", rest.handleGetCurrentHumidity())

	// Gate endpoints
	// mux.Handle("/api/gate/raise", rest.handleRaiseGate())
	// mux.Handle("/api/gate/lower", rest.handleLowerGate())
	// mux.Handle("/api/gate/status", rest.handleGetGateStatus())

	// Voltage endpoints
	// mux.Handle("/api/voltage/current", rest.handleGetCurrentVoltage())
	// mux.Handle("/api/voltage/history", rest.handleGetVoltageHistory())
	// mux.Handle("/api/voltage/stats", rest.handleGetVoltageStats())

	// Lamp endpoints
	// mux.Handle("/api/lamp/on", rest.handleTurnOnLamp())
	// mux.Handle("/api/lamp/off", rest.handleTurnOffLamp())

	// Health endpoint
	// mux.Handle("/api/health", rest.handleHealth())

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
