# Docker Инструкция

## 🐳 Быстрый старт

### Вариант 1: Docker Compose (рекомендуется)

```bash
# Сборка и запуск
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

Приложение будет доступно на: **http://localhost:3000**

### Вариант 2: Docker напрямую

```bash
# Сборка образа
docker build -t balance-app .

# Запуск контейнера
docker run -d -p 3000:80 --name balance balance-app

# Просмотр логов
docker logs -f balance

# Остановка
docker stop balance
docker rm balance
```

## 📦 Структура Docker файлов

- **Dockerfile** - Multi-stage build для оптимизации размера
  - Stage 1: Node.js для сборки React приложения
  - Stage 2: Nginx для раздачи статики

- **nginx.conf** - Конфигурация nginx
  - SPA routing (все запросы на index.html)
  - Gzip сжатие
  - Кэширование статических файлов
  - Заголовки безопасности

- **.dockerignore** - Исключение ненужных файлов из образа

- **docker-compose.yml** - Оркестрация контейнеров

## 🛠️ Полезные команды

```bash
# Пересборка образа
docker-compose build --no-cache

# Просмотр запущенных контейнеров
docker ps

# Проверка здоровья контейнера
docker inspect --format='{{.State.Health.Status}}' balance

# Подключение к контейнеру
docker exec -it balance sh

# Очистка неиспользуемых образов
docker system prune -a
```

## 🔧 Настройка портов

По умолчанию приложение запускается на порту **3000**.

Чтобы изменить порт, отредактируйте `docker-compose.yml`:

```yaml
ports:
  - "8080:80"  # Приложение будет на порту 8080
```

## 📊 Размер образа

- **Builder stage**: ~1.2 GB (используется только для сборки)
- **Final image**: ~45 MB (nginx:alpine + собранное приложение)

## 🚀 Production деплой

### Docker Hub

```bash
# Логин
docker login

# Тегирование
docker tag balance-app yourusername/balance-app:latest

# Push
docker push yourusername/balance-app:latest
```

### На сервере

```bash
# Pull образа
docker pull yourusername/balance-app:latest

# Запуск
docker run -d -p 80:80 --restart=unless-stopped yourusername/balance-app:latest
```

## 🔍 Отладка

### Проверка логов nginx
```bash
docker exec balance cat /var/log/nginx/access.log
docker exec balance cat /var/log/nginx/error.log
```

### Проверка файлов в контейнере
```bash
docker exec balance ls -la /usr/share/nginx/html
```

### Тестирование сборки локально
```bash
# Сборка
npm run build

# Просмотр собранных файлов
ls -la dist/
```

## ⚠️ Важные заметки

1. **API URL**: Если используете относительные пути к API - они будут работать.
   Если абсолютные (как в коде: `https://1b772d47ef2f.ngrok-free.app`) - убедитесь, что API доступен.

2. **CORS**: Если API на другом домене, настройте CORS на бэкенде.

3. **Environment Variables**: Vite встраивает переменные окружения на этапе сборки.
   Для изменения API URL пересоберите образ.

4. **Nginx кэширование**: Статические файлы кэшируются на 1 год.
   При деплое новой версии используйте новый тег образа.

## 📝 Решение проблем

### Контейнер не запускается
```bash
# Проверьте логи
docker logs balance

# Проверьте статус
docker ps -a
```

### Порт уже занят
```bash
# Найдите процесс
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Linux/Mac

# Измените порт в docker-compose.yml
```

### Проблемы с routing
- Убедитесь, что nginx.conf корректно настроен
- Проверьте, что все запросы идут на index.html

## 🎯 Best Practices

1. **Регулярно обновляйте базовые образы**:
   ```bash
   docker pull node:20-alpine
   docker pull nginx:1.25-alpine
   ```

2. **Используйте .dockerignore** для ускорения сборки

3. **Добавьте CI/CD** для автоматической сборки и деплоя

4. **Мониторинг**: Настройте healthcheck и логирование

5. **Безопасность**: Регулярно обновляйте зависимости и базовые образы
