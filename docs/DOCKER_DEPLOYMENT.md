# Docker Deployment Guide

## 🚀 Быстрый старт

### 1. Сборка и запуск через Docker Compose

```bash
# Сборка и запуск
docker-compose up -d --build

# Проверка логов
docker-compose logs -f balance-app

# Остановка
docker-compose down
```

Приложение будет доступно по адресу: http://localhost:3000

### 2. Сборка Docker образа вручную

```bash
# Сборка с передачей API URL
docker build \
  --build-arg VITE_API_BASE_URL=https://your-api.com/api/v1 \
  -t balance-app:latest .

# Запуск контейнера
docker run -d \
  -p 3000:80 \
  --name balance-app \
  balance-app:latest
```

## 🔧 Конфигурация

### Переменные окружения

#### Обязательные:
- `VITE_API_BASE_URL` - URL вашего API (например: `https://api.example.com/api/v1`)

#### Опциональные:
- `VITE_APP_TITLE` - Название приложения
- `VITE_APP_VERSION` - Версия приложения

### Способы передачи переменных:

#### 1. Через docker-compose.yml
```yaml
services:
  balance-app:
    build:
      args:
        VITE_API_BASE_URL: https://your-api.com/api/v1
```

#### 2. Через .env файл
```bash
# Создайте .env.production
echo "VITE_API_BASE_URL=https://your-api.com/api/v1" > .env.production

# Используйте при сборке
docker-compose --env-file .env.production up --build
```

#### 3. Через build-arg
```bash
docker build --build-arg VITE_API_BASE_URL=https://your-api.com/api/v1 -t balance-app .
```

## 📦 Оптимизация

### Multi-stage build
Финальный образ содержит только nginx + статические файлы (~50MB)

### Кэширование npm зависимостей
Копирование `package*.json` отдельно для кэширования слоев Docker

### Gzip сжатие
Nginx автоматически сжимает JS/CSS файлы

### Кэширование статики
Статические ресурсы кэшируются на 1 год

## 🔍 Healthcheck

Контейнер имеет встроенный healthcheck:
```bash
# Проверка здоровья контейнера
docker inspect --format='{{json .State.Health}}' balance-app
```

## 🐳 Production Deployment

### Docker Hub

```bash
# Tag
docker tag balance-app:latest your-username/balance-app:1.0.0

# Push
docker push your-username/balance-app:1.0.0
```

### На сервере

```bash
# Pull
docker pull your-username/balance-app:1.0.0

# Run
docker run -d \
  -p 80:80 \
  --restart unless-stopped \
  --name balance-app \
  your-username/balance-app:1.0.0
```

## 🔒 Security Best Practices

1. **Не коммитьте .env файлы с production данными**
2. **Используйте secrets для передачи API ключей**
3. **Регулярно обновляйте базовые образы**
4. **Сканируйте образы на уязвимости:**
   ```bash
   docker scan balance-app:latest
   ```

## 📊 Мониторинг

### Логи
```bash
# Просмотр логов
docker logs -f balance-app

# Последние 100 строк
docker logs --tail 100 balance-app
```

### Ресурсы
```bash
# Использование ресурсов
docker stats balance-app
```

## 🛠 Troubleshooting

### Контейнер не запускается
```bash
# Проверьте логи
docker logs balance-app

# Проверьте healthcheck
docker inspect --format='{{json .State.Health}}' balance-app
```

### API не доступен
1. Проверьте, что `VITE_API_BASE_URL` правильно передан при сборке
2. Проверьте логи nginx в контейнере
3. Убедитесь, что API сервер доступен из Docker сети

### Пересборка без кэша
```bash
docker-compose build --no-cache
```

## 🚢 CI/CD Example

### GitHub Actions
```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: |
          docker build \
            --build-arg VITE_API_BASE_URL=${{ secrets.API_URL }} \
            -t balance-app:${{ github.sha }} .

      - name: Push to registry
        run: docker push balance-app:${{ github.sha }}
```

## 📝 Размеры образов

- **Builder stage**: ~1.2 GB (Node.js + dependencies)
- **Production stage**: ~50 MB (nginx:alpine + статика)
- **Финальный образ**: ~50 MB ✨
