package middleware

import (
	"log/slog"
	"net/http"
	"time"
)



func Logger(next http.HandlerFunc, logger *slog.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		next(w, r)

		duration := time.Since(start)
		logger.Info("HTTP request",
			"method", r.Method,
			"path", r.URL.Path,
			"remote_addr", r.RemoteAddr,
			"duration_ms", duration.Milliseconds(),
		)
	}
}
