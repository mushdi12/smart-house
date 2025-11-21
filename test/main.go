package main

import (
	"bufio"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"go.bug.st/serial"
	"periph.io/x/conn/v3/gpio"
	"periph.io/x/conn/v3/gpio/gpioreg"
	"periph.io/x/host/v3"
)

// DeviceController инкапсулирует работу с портом и делает ее потокобезопасной
type DeviceController struct {
	port serial.Port
	mu   sync.Mutex // Mutex для предотвращения одновременной записи в порт
}

// resetESP выполняет сброс ESP8266 через GPIO пин
func resetESP() error {
	// Инициализация драйверов хоста (Raspberry Pi)
	if _, err := host.Init(); err != nil {
		return fmt.Errorf("ошибка инициализации хоста: %w", err)
	}

	// Выбор пина GPIO17 (BCM нумерация, физический пин 11 на RPi 4)
	pin := gpioreg.ByName("GPIO17")
	if pin == nil {
		return fmt.Errorf("не удалось найти GPIO17")
	}

	log.Println("Выполняется сброс ESP8266 через GPIO17...")

	// Нажимаем Reset (Подаем Low / Землю)
	// Важно: RST активен при низком уровне
	if err := pin.Out(gpio.Low); err != nil {
		return fmt.Errorf("ошибка установки GPIO17 в LOW: %w", err)
	}

	// Держим Reset нажатым короткое время
	time.Sleep(200 * time.Millisecond)

	// Отпускаем Reset (Подаем High / 3.3V)
	// Теперь ESP8266 начнет загружаться
	if err := pin.Out(gpio.High); err != nil {
		return fmt.Errorf("ошибка установки GPIO17 в HIGH: %w", err)
	}

	log.Println("Сброс завершен. ESP8266 перезагружается.")
	return nil
}

// NewDeviceController открывает порт ОДИН РАЗ и возвращает готовый контроллер
func NewDeviceController(portName string) (*DeviceController, error) {
	log.Println("Инициализация соединения с устройством...")

	// Сначала выполняем сброс ESP через GPIO
	if err := resetESP(); err != nil {
		return nil, fmt.Errorf("ошибка сброса ESP: %w", err)
	}

	// Даем ESP время на перезагрузку после GPIO reset
	time.Sleep(500 * time.Millisecond)

	mode := &serial.Mode{BaudRate: 9600}
	port, err := serial.Open(portName, mode)
	if err != nil {
		return nil, err
	}

	// Ждем, пока ESP перезагрузится и будет готов
	time.Sleep(2 * time.Second)

	reader := bufio.NewReader(port)
	line, err := reader.ReadString('\n')
	if err != nil {
		port.Close()
		return nil, fmt.Errorf("ESP не ответил на приветствие: %w", err)
	}
	log.Printf("Устройство готово: %s", line)

	return &DeviceController{port: port}, nil
}

// SendCommand использует уже открытое соединение для отправки команды
func (dc *DeviceController) SendCommand(method string, params string) (string, error) {
	dc.mu.Lock()
	defer dc.mu.Unlock()

	command := fmt.Sprintf(`{"method":"%s", "params":%s, "id":1}`+"\n", method, params)

	_, err := dc.port.Write([]byte(command))
	if err != nil {
		return "", err
	}

	reader := bufio.NewReader(dc.port)
	response, err := reader.ReadString('\n')
	if err != nil {
		return "", err
	}
	return response, nil
}

// Close закрывает порт при завершении работы сервера
func (dc *DeviceController) Close() {
	if dc.port != nil {
		log.Println("Закрытие соединения с устройством...")
		dc.port.Close()
	}
}

func main() {
	log.Println("Запуск веб-сервера...")

	// Открываем порт при старте. Соединение будет жить до конца работы программы.
	controller, err := NewDeviceController("/dev/serial0")
	if err != nil {
		log.Fatalf("Не удалось инициализировать контроллер устройства: %v", err)
	}
	defer controller.Close()

	// Обработчик для включения светодиода
	http.HandleFunc("/led/on", func(w http.ResponseWriter, r *http.Request) {
		log.Println("HTTP-запрос: /led/on")
		// Используем существующее соединение для вызова метода
		resp, err := controller.SendCommand("setLedState", `{"state":true}`)
		if err != nil {
			http.Error(w, "Ошибка связи с устройством", http.StatusInternalServerError)
			return
		}
		fmt.Fprintf(w, "Ответ от ESP: %s", resp)
	})

	// Обработчик для выключения светодиода
	http.HandleFunc("/led/off", func(w http.ResponseWriter, r *http.Request) {
		log.Println("HTTP-запрос: /led/off")
		// Используем существующее соединение для вызова метода
		resp, err := controller.SendCommand("setLedState", `{"state":false}`)
		if err != nil {
			http.Error(w, "Ошибка связи с устройством", http.StatusInternalServerError)
			return
		}
		fmt.Fprintf(w, "Ответ от ESP: %s", resp)
	})

	log.Println("Сервер запущен на http://0.0.0.0:8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatalf("Ошибка при запуске веб-сервера: %v", err)
	}
}
