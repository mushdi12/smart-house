.PHONY: help up down run-test test lint logs status build build-arm64 clean frontend-install frontend-dev frontend-build frontend-preview docker-build docker-up docker-down docker-logs docker-restart build-backend-arm64 build-frontend-prod build-raspberry

container_runtime := $(shell which docker)

$(info using ${container_runtime})

# Команда по умолчанию
.DEFAULT_GOAL := help

up: down
	$(container_runtime) compose up --build -d


down:
	$(container_runtime) compose down


run-test:
	$(container_runtime) run --rm --network=host tests:latest

test:
	make down
	make up
	make run-tests
	make down
	@echo "test finished"

lint:
	@cd backend && golangci-lint run -E gocritic -v ./...

logs:
	$(container_runtime) compose logs -f api-gateway

status:
	$(container_runtime) compose ps

#  Работа с ESP и Raspberry

# Компиляция для Raspberry Pi 4/5 (64-bit)
build-arm64:
	@GOOS=linux GOARCH=arm64 go build -o bin/esp-ping main.go

build: clean build-arm64

# Очистка скомпилированных файлов
clean:
	@rm -f bin/esp-ping led-controller libled_blink.so

# Компиляция для Raspberry Pi

# Компиляция бэкенда для Raspberry Pi (ARM64)
build-backend-arm64:
	@echo "Компиляция бэкенда для Raspberry Pi (ARM64)..."
	@cd backend && GOOS=linux GOARCH=arm64 CGO_ENABLED=0 go build -o ../bin/go-server-arm64 ./cmd/go-server/main.go
	@echo "✅ Бэкенд скомпилирован: bin/go-server-arm64"

# Сборка фронтенда для Raspberry Pi
build-frontend-prod:
	@echo "Сборка фронтенда для продакшена..."
	@cd frontend && npm run build
	@echo "✅ Фронтенд собран в: frontend/dist"

# Компиляция обоих компонентов для Raspberry Pi
build-raspberry: build-backend-arm64 build-frontend-prod
	@echo ""
	@echo "✅ Компиляция завершена!"
	@echo "📦 Бэкенд: bin/go-server-arm64"
	@echo "📦 Фронтенд: frontend/dist"
	@echo ""
	@echo "Для запуска на Raspberry Pi:"
	@echo "  1. Скопируйте bin/go-server-arm64 на Raspberry Pi"
	@echo "  2. Скопируйте frontend/dist на Raspberry Pi"
	@echo "  3. Настройте nginx для раздачи фронтенда и проксирования API"

# Frontend команды

# Установка зависимостей фронтенда
frontend-install:
	@cd frontend && npm install

# Запуск фронтенда в режиме разработки
frontend-dev:
	@cd frontend && npm run dev

# Сборка фронтенда для продакшена
frontend-build:
	@cd frontend && npm run build

# Просмотр собранного фронтенда
frontend-preview:
	@cd frontend && npm run preview

# Docker команды для полного стека
docker-build:
	$(container_runtime) compose build

docker-up:
	$(container_runtime) compose up -d

docker-down:
	$(container_runtime) compose down

docker-logs:
	$(container_runtime) compose logs -f

docker-restart:
	$(container_runtime) compose restart

# Help - вывод всех доступных команд
help:
	@echo "Доступные команды:"
	@echo ""
	@echo "Docker Compose команды (старые):"
	@echo "  make up              - Запустить контейнеры"
	@echo "  make down            - Остановить контейнеры"
	@echo "  make status          - Показать статус контейнеров"
	@echo "  make logs             - Показать логи контейнеров"
	@echo "  make test             - Запустить тесты"
	@echo "  make run-test         - Запустить тестовый контейнер"
	@echo ""
	@echo "Docker команды (полный стек):"
	@echo "  make docker-build     - Собрать образы бэкенда и фронтенда"
	@echo "  make docker-up        - Запустить контейнеры (бэкенд + фронтенд)"
	@echo "  make docker-down      - Остановить контейнеры"
	@echo "  make docker-logs      - Показать логи всех контейнеров"
	@echo "  make docker-restart   - Перезапустить контейнеры"
	@echo ""
	@echo "Backend команды:"
	@echo "  make lint             - Запустить линтер Go"
	@echo ""
	@echo "ESP/Raspberry команды:"
	@echo "  make build            - Собрать для ARM64 (очистка + сборка)"
	@echo "  make build-arm64      - Собрать для Raspberry Pi 4/5 (64-bit)"
	@echo "  make clean            - Очистить скомпилированные файлы"
	@echo ""
	@echo "Компиляция для Raspberry Pi:"
	@echo "  make build-backend-arm64  - Скомпилировать бэкенд для Raspberry Pi (ARM64)"
	@echo "  make build-frontend-prod   - Собрать фронтенд для продакшена"
	@echo "  make build-raspberry       - Скомпилировать оба компонента для Raspberry Pi"
	@echo ""
	@echo "Frontend команды:"
	@echo "  make frontend-install - Установить зависимости фронтенда"
	@echo "  make frontend-dev     - Запустить фронтенд в режиме разработки"
	@echo "  make frontend-build   - Собрать фронтенд для продакшена"
	@echo "  make frontend-preview - Просмотреть собранный фронтенд"
	@echo ""
	@echo "  make help             - Показать эту справку"



