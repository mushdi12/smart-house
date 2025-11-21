.PHONY: build build-arm64 clean build-led

# Компиляция для Raspberry Pi 4/5 (64-bit)
build-arm64:
	@GOOS=linux GOARCH=arm64 go build -o esp-ping main.go

build-arm64-2:
	@GOOS=linux GOARCH=arm64 go build -o esp-ping-2 main.go
# Компиляция по умолчанию (ARM64) с предварительной очисткой

build: clean build-arm64

# Очистка скомпилированных файлов
clean:
	@rm -f esp-ping led-controller libled_blink.so
