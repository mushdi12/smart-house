package main

import (
	"errors"
	"fmt"
	"log"
	"os"
	"os/exec"
	"time"

	"periph.io/x/conn/v3/gpio"
	"periph.io/x/conn/v3/gpio/gpioreg"
	"periph.io/x/host/v3"
)

func main() {

	if err := reflashESP(); err != nil {
		log.Fatalf("Firmware writing error: %v", err)
	}

	fmt.Println("Success!")
}

func reflashESP() error {
	if _, err := host.Init(); err != nil {
		log.Fatal(err)
	}

	// Настраиваем пины
	rstPin := gpioreg.ByName("GPIO17")   // Пин резета
	flashPin := gpioreg.ByName("GPIO27") // Пин D3 (GPIO0 на ESP)

	if rstPin == nil || flashPin == nil {
		return errors.New("cannot find pins")
	}

	fmt.Println("1. Transition ESP8266 to bootloader mode...")

	// ШАГ А: Зажимаем GPIO0 (D3) в ноль. Это сигнал для ESP ждать прошивку.
	if err := flashPin.Out(gpio.Low); err != nil {
		log.Fatal(err)
	}

	// ШАГ Б: Дергаем Reset (Low -> High), пока GPIO0 зажат.
	rstPin.Out(gpio.Low)
	time.Sleep(100 * time.Millisecond)
	rstPin.Out(gpio.High) // ESP просыпается, видит GPIO0 Low и входит в режим загрузки

	// ШАГ В: Ждем чуть-чуть и отпускаем GPIO0 (не обязательно держать всё время)
	time.Sleep(200 * time.Millisecond)
	flashPin.Out(gpio.High)

	fmt.Println("2. Start esptool for firmware writing...")

	// ШАГ Г: Вызываем esptool из Go
	// Замените "firmware.bin" на путь к вашему файлу
	cmd := exec.Command("esptool",
		"--chip", "esp8266",
		"-p", "/dev/serial0",
		"-b", "115200",
		"--before", "no_reset",
		"--after", "no_reset",
		"write_flash",
		"-fm", "dout",
		"0x00000",
		"home/admin/esp8266_binarniki/firmware",
	)

	// Перенаправляем вывод esptool в консоль, чтобы видеть прогресс
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		return fmt.Errorf("ошибка прошивки через esptool: %w", err)
	}

	fmt.Println("4. Firmware writing completed. Restarting in normal mode...")

	// ШАГ Д: Обычный сброс, чтобы запустить новую программу
	// GPIO0 (flashPin) уже High (мы отпустили его в шаге В), так что ESP загрузится нормально.
	rstPin.Out(gpio.Low)
	time.Sleep(100 * time.Millisecond)
	rstPin.Out(gpio.High)

	fmt.Println("Success!")
	return nil
}
