// package main

// import (
//   "bufio"
//   "fmt"
//   "log"
//   "time"

//   "go.bug.st/serial"
// )

// // LedController - структура для управления нашим устройством
// type LedController struct {
//   port serial.Port
// }

// // NewLedController открывает соединение с портом и возвращает контроллер
// func NewLedController(portName string, baudRate int) (*LedController, error) {
//   mode := &serial.Mode{
//     BaudRate: baudRate,
//   }
//   port, err := serial.Open(portName, mode)
//   if err != nil {
//     return nil, fmt.Errorf("не удалось открыть порт %s: %w", portName, err)
//   }

//   // Даем ESP время на перезагрузку после открытия порта
//   time.Sleep(2 * time.Second)

//   return &LedController{port: port}, nil
// }

// // sendCommand отправляет команду и читает ответ
// func (c *LedController) sendCommand(command string) (string, error) {
//   // Обязательно добавляем символ новой строки, которого ждет ESP
//   _, err := c.port.Write([]byte(command + "\n"))
//   if err != nil {
//     return "", fmt.Errorf("ошибка при отправке команды: %w", err)
//   }

//   // Читаем ответ от ESP
//   reader := bufio.NewReader(c.port)
//   reply, err := reader.ReadString('\n')
//   if err != nil {
//     return "", fmt.Errorf("ошибка при чтении ответа: %w", err)
//   }

//   return reply, nil
// }

// // TurnLedOn вызывает метод включения светодиода на ESP
// func (c *LedController) TurnLedOn() {
//   log.Println("Отправка команды: ON")
//   reply, err := c.sendCommand("ON")
//   if err != nil {
//     log.Printf("Ошибка: %v\n", err)
//     return
//   }
//   log.Printf("Ответ от ESP: %s", reply)
// }

// // TurnLedOff вызывает метод выключения светодиода на ESP
// func (c *LedController) TurnLedOff() {
//   log.Println("Отправка команды: OFF")
//   reply, err := c.sendCommand("OFF")
//   if err != nil {
//     log.Printf("Ошибка: %v\n", err)
//     return
//   }
//   log.Printf("Ответ от ESP: %s", reply)
// }

// // Close закрывает соединение с портом
// func (c *LedController) Close() {
//   if c.port != nil {
//     c.port.Close()
//   }
// }

// func main() {
//   // Имя порта на Raspberry Pi и скорость, как в прошивке
//   portName := "/dev/serial0"
//   baudRate := 9600

//   log.Println("Запуск контроллера светодиода...")
//   controller, err := NewLedController(portName, baudRate)
//   if err != nil {
//     log.Fatalf("Критическая ошибка: %v", err)
//   }
//   defer controller.Close()

//   // Ждем приветственного сообщения от ESP, чтобы убедиться, что он готов
//   reader := bufio.NewReader(controller.port)
//   helloMsg, err := reader.ReadString('\n')
//   if err != nil {
//     log.Fatalf("ESP не ответил на приветствие: %v", err)
//   }
//   log.Printf("ESP готов к работе: %s", helloMsg)

//   // --- Демонстрация работы ---
//   log.Println("\n--- Начинаем демонстрацию ---")
  

//   //TODO: Сделать цикл для включения и выключения светодиода
//   for i := 0; i < 10; i++ {
//     controller.TurnLedOn()
//     time.Sleep(10 * time.Second)
//     controller.TurnLedOff()
//     time.Sleep(10 * time.Second)
//   }

//   log.Println("--- Демонстрация завершена ---")
// }