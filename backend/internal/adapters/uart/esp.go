package uart

import (
	"bufio"
	"fmt"
	"log/slog"
	"sync"
	"time"

	"go.bug.st/serial"
	"periph.io/x/conn/v3/gpio"
	"periph.io/x/conn/v3/gpio/gpioreg"
	"periph.io/x/host/v3"
)

type Client struct {
	port serial.Port
	mu   sync.Mutex // Mutex для предотвращения одновременной записи в порт
	log  *slog.Logger
}

func NewClient(portName string, log *slog.Logger) (*Client, error) {
	log.Info("Initializing connection to device...")

	// Сначала выполняем сброс ESP через GPIO
	if err := resetESP(log); err != nil {
		return nil, err
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
		return nil, err
	}

	log.Info("Device ready: " + line)

	return &Client{
		port: port,
		log:  log,
	}, nil
}

// SendCommand отправляет команду на ESP8266 через UART
func (c *Client) SendCommand(method string, params string) (string, error) {
	return c.sendCommand(method, params)
}

// TurnOnFan включает вентилятор
func (c *Client) TurnOnFan() (string, error) {
	return c.sendCommand("turnOnFan", "{}")
}

// TurnOffFan выключает вентилятор
func (c *Client) TurnOffFan() (string, error) {
	return c.sendCommand("turnOffFan", "{}")
}

// IncreaseTemperature повышает температуру на указанное значение
func (c *Client) IncreaseTemperature(value float64) (string, error) {
	params := fmt.Sprintf(`{"value":%.1f}`, value)
	return c.sendCommand("increaseTemperature", params)
}

// DecreaseTemperature понижает температуру на указанное значение
func (c *Client) DecreaseTemperature(value float64) (string, error) {
	params := fmt.Sprintf(`{"value":%.1f}`, value)
	return c.sendCommand("decreaseTemperature", params)
}

// GetCurrentTemperature получает текущую температуру
func (c *Client) GetCurrentTemperature() (string, error) {
	return c.sendCommand("getCurrentTemperature", "{}")
}

// IncreaseHumidity повышает влажность на указанное значение
func (c *Client) IncreaseHumidity(value float64) (string, error) {
	params := fmt.Sprintf(`{"value":%.1f}`, value)
	return c.sendCommand("increaseHumidity", params)
}

// DecreaseHumidity понижает влажность на указанное значение
func (c *Client) DecreaseHumidity(value float64) (string, error) {
	params := fmt.Sprintf(`{"value":%.1f}`, value)
	return c.sendCommand("decreaseHumidity", params)
}

// GetCurrentHumidity получает текущую влажность
func (c *Client) GetCurrentHumidity() (string, error) {
	return c.sendCommand("getCurrentHumidity", "{}")
}

// RaiseGate поднимает ворота с указанной скоростью
func (c *Client) RaiseGate(speed int) (string, error) {
	params := fmt.Sprintf(`{"speed":%d}`, speed)
	return c.sendCommand("raiseGate", params)
}

// LowerGate опускает ворота с указанной скоростью
func (c *Client) LowerGate(speed int) (string, error) {
	params := fmt.Sprintf(`{"speed":%d}`, speed)
	return c.sendCommand("lowerGate", params)
}

// GetGateStatus получает текущий статус ворот
func (c *Client) GetGateStatus() (string, error) {
	return c.sendCommand("getGateStatus", "{}")
}

// GetCurrentVoltage получает текущее напряжение
func (c *Client) GetCurrentVoltage() (string, error) {
	return c.sendCommand("getCurrentVoltage", "{}")
}

// GetVoltageHistory получает историю изменения напряжения
func (c *Client) GetVoltageHistory(from, to time.Time, interval string, limit int) (string, error) {
	params := fmt.Sprintf(`{"from":"%s","to":"%s","interval":"%s","limit":%d}`,
		from.Format(time.RFC3339),
		to.Format(time.RFC3339),
		interval,
		limit)
	return c.sendCommand("getVoltageHistory", params)
}

// GetVoltageStats получает статистику по напряжению
func (c *Client) GetVoltageStats(from, to time.Time) (string, error) {
	params := fmt.Sprintf(`{"from":"%s","to":"%s"}`,
		from.Format(time.RFC3339),
		to.Format(time.RFC3339))
	return c.sendCommand("getVoltageStats", params)
}

// TurnOnLamp включает лампу
func (c *Client) TurnOnLamp() (string, error) {
	params := `{"state":true}`
	return c.sendCommand("setLedState", params)
}

// TurnOffLamp выключает лампу
func (c *Client) TurnOffLamp() (string, error) {
	params := `{"state":false}`
	return c.sendCommand("setLedState", params)
}

// resetESP выполняет сброс ESP8266 через GPIO пин
func resetESP(log *slog.Logger) error {
	// Инициализация драйверов хоста (Raspberry Pi)
	if _, err := host.Init(); err != nil {
		return fmt.Errorf("error initializing host: %w", err)
	}

	// Выбор пина GPIO17
	pin := gpioreg.ByName("GPIO17")
	if pin == nil {
		return fmt.Errorf("cannot find GPIO17")
	}

	log.Info("Performing ESP8266 reset through GPIO17...")

	// Нажимаем Reset (Подаем Low / Землю)
	// Важно: RST активен при низком уровне
	if err := pin.Out(gpio.Low); err != nil {
		return fmt.Errorf("error setting GPIO17 to LOW: %w", err)
	}

	// Держим Reset нажатым короткое время
	time.Sleep(200 * time.Millisecond)

	// Отпускаем Reset (Подаем High / 3.3V)
	// Теперь ESP8266 начнет загружаться
	if err := pin.Out(gpio.High); err != nil {
		return fmt.Errorf("error setting GPIO17 to HIGH: %w", err)
	}

	log.Info("Reset completed. ESP8266 is restarting.")
	return nil
}

// SendCommand использует уже открытое соединение для отправки команды
func (c *Client) sendCommand(method string, params string) (string, error) {
	c.mu.Lock()
	defer c.mu.Unlock()

	command := fmt.Sprintf(`{"method":"%s", "params":%s, "id":1}`+"\n", method, params)

	_, err := c.port.Write([]byte(command))
	if err != nil {
		return "", err
	}

	reader := bufio.NewReader(c.port)
	response, err := reader.ReadString('\n')
	if err != nil {
		return "", err
	}
	return response, nil
}

// Close закрывает порт при завершении работы сервера
func (c *Client) Close() error {
	if c.port != nil {
		c.log.Info("Closing connection to device...")
		if err := c.port.Close(); err != nil {
			return err
		}
	}
	return nil
}
