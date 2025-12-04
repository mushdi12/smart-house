# Docker Setup

Инструкции по запуску проекта через Docker.

## Предварительные требования

- Docker
- Docker Compose

## Быстрый старт

1. Создайте конфигурационный файл для бэкенда:
```bash
cp backend/config.yaml.example backend/config.yaml
```

2. При необходимости отредактируйте `backend/config.yaml`

3. Запустите контейнеры:
```bash
make docker-up
# или
docker-compose up -d
```

4. Откройте в браузере:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080/api

## Команды

### Сборка образов
```bash
make docker-build
# или
docker-compose build
```

### Запуск контейнеров
```bash
make docker-up
# или
docker-compose up -d
```

### Остановка контейнеров
```bash
make docker-down
# или
docker-compose down
```

### Просмотр логов
```bash
make docker-logs
# или
docker-compose logs -f
```

### Перезапуск контейнеров
```bash
make docker-restart
# или
docker-compose restart
```

## Архитектура

- **Backend** (порт 8080): Go сервер с API
- **Frontend** (порт 3000): React приложение на Nginx
- **Network**: `smart-house-network` - внутренняя сеть для связи между контейнерами

## Доступ к API из фронтенда

Фронтенд обращается к бэкенду через Nginx proxy:
- Запросы к `/api/*` проксируются на `http://backend:8080`
- Внутри Docker сети контейнеры общаются по именам сервисов

## Переменные окружения

### Backend
- `LOG_LEVEL` - уровень логирования (INFO, DEBUG, ERROR)
- `PORT_NAME` - путь к UART устройству (например, /dev/ttyUSB0)

## Volumes

- `./backend/config.yaml` - конфигурационный файл бэкенда (read-only)
- `/dev` - доступ к USB устройствам (опционально, для UART)

## Troubleshooting

### Проблемы с доступом к USB устройствам

Если нужно работать с реальным UART устройством, добавьте в `docker-compose.yml`:
```yaml
devices:
  - /dev/ttyUSB0:/dev/ttyUSB0
```

И запустите с правами:
```bash
sudo docker-compose up -d
```

### Проверка работы сервисов

```bash
# Проверить статус контейнеров
docker-compose ps

# Проверить логи бэкенда
docker-compose logs backend

# Проверить логи фронтенда
docker-compose logs frontend

# Проверить healthcheck
docker-compose ps
```

