package rest

import (
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"smart-house/backend/internal/core"
)

func NewTurnOnFan(log *slog.Logger, fanner core.Fanner) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		response, err := fanner.TurnOnFan()
		if err != nil {
			log.Error("failed to turn on fan", "error", err)
			http.Error(w, "failed to turn on fan", http.StatusInternalServerError)
			return
		}
		encodeReply(w, response)
	}
}

func NewTurnOffFan(log *slog.Logger, fanner core.Fanner) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		response, err := fanner.TurnOffFan()
		if err != nil {
			log.Error("failed to turn off fan", "error", err)
			http.Error(w, "failed to turn off fan", http.StatusInternalServerError)
			return
		}
		encodeReply(w, response)
	}
}


func NewTurnOnLight(log *slog.Logger, lightner core.Lightner) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		response, err := lightner.TurnOnLamp()
		if err != nil {
			log.Error("failed to turn on light", "error", err)
			http.Error(w, "failed to turn on light", http.StatusInternalServerError)
			return
		}
		encodeReply(w, response)
	}
}

func NewTurnOffLight(log *slog.Logger, lightner core.Lightner) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		response, err := lightner.TurnOffLamp()
		if err != nil {
			log.Error("failed to turn off light", "error", err)
			http.Error(w, "failed to turn off light", http.StatusInternalServerError)
			return
		}
		encodeReply(w, response)
	}
}
func encodeReply(w io.Writer, reply any) error {
	encoder := json.NewEncoder(w)
	encoder.SetIndent("", "  ")
	if err := encoder.Encode(reply); err != nil {
		return fmt.Errorf("could not encode comics: %v", err)
	}
	return nil
}
