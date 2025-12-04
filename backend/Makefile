# Компиляция для Raspberry Pi 4/5 (64-bit)
build-arm64:
	@GOOS=linux GOARCH=arm64 go build -o bin/goServer cmd/go-server/main.go

build-arm64-reflash:
	@GOOS=linux GOARCH=arm64 go build -o bin/resetEsp cmd/reset-esp/main.go

clean:
	@rm -f bin/go-server bin/resetEsp
	@rm -f bin/go-server bin/goServer


