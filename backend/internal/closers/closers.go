package closers

import (
	"io"
	"log/slog"
)

func CloseOrLog(l *slog.Logger, closers ...io.Closer) {
	for _, closer := range closers {
		if err := closer.Close(); err != nil {
			l.Error("close failed", "error", err)
		}
	}
}

func CloseOrPanic(l *slog.Logger, closers ...io.Closer) {
	for _, closer := range closers {
		if err := closer.Close(); err != nil {
			l.Error("close failed", "error", err)
			panic("close failed: " + err.Error())
		}
	}
}
