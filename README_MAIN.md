# Balance App - Руководство по запуску

## Описание

Balance App — это React-приложение для работы с балансовыми данными. Построено с использованием Vite, TypeScript, React 19, Redux Toolkit и Ant Design.

---

## Содержание

1. [Требования](#требования)
2. [Структура проекта](#структура-проекта)
3. [Переменные окружения](#переменные-окружения)
4. [Способы запуска](#способы-запуска)
   - [Локальный запуск (без Docker)](#локальный-запуск-без-docker)
   - [Docker Development](#docker-development)
   - [Docker Production](#docker-production)
5. [Makefile команды](#makefile-команды)
6. [Конфигурация](#конфигурация)
7. [Устранение неполадок](#устранение-неполадок)

---

## Требования

### Для локального запуска
- Node.js 20+
- npm 9+

### Для Docker
- Docker 20+
- Docker Compose 2+
- Make (опционально, для удобства)

---

## Структура проекта

```
balance/
├── src/                    # Исходный код приложения
│   ├── app/               # Конфигурация приложения, store, роутинг
│   ├── assets/            # Статические ресурсы (изображения, шрифты)
│   ├── entities/          # Бизнес-сущности
│   ├── features/          # Функциональные модули
│   ├── pages/             # Страницы приложения
│   ├── shared/            # Общие компоненты и утилиты
│   ├── widgets/           # Составные виджеты
│   ├── main.tsx           # Точка входа
│   └── index.css          # Глобальные стили
├── public/                 # Публичные статические файлы
├── .env                    # Переменные окружения (не коммитить!)
├── .env.example            # Пример переменных окружения
├── .env.production         # Переменные для production
├── docker-compose.yml      # Docker Compose для production
├── docker-compose.dev.yml  # Docker Compose для development
├── Dockerfile              # Production Docker образ
├── Dockerfile.dev          # Development Docker образ
├── Makefile                # Команды для упрощения работы
├── nginx.conf              # Конфигурация Nginx для production
├── vite.config.ts          # Конфигурация Vite
├── package.json            # Зависимости проекта
└── tsconfig.json           # Конфигурация TypeScript
```

---

## Переменные окружения

### Основные переменные

| Переменная | Описание | Пример | Обязательная |
|------------|----------|--------|--------------|
| `VITE_API_BASE_URL` | Базовый URL API сервера | `http://10.241.108.72:8000/api/v1` | Да |
| `VITE_APP_TITLE` | Название приложения | `Balance App` | Нет |
| `VITE_APP_VERSION` | Версия приложения | `1.0.0` | Нет |
| `NODE_ENV` | Окружение (development/production) | `production` | Да |
| `DEV_PORT` | Порт для dev сервера (Docker) | `5173` | Нет |

### Создание .env файла

1. Скопируйте пример конфигурации:
   ```bash
   cp .env.example .env
   ```

2. Отредактируйте `.env` и укажите правильный `VITE_API_BASE_URL`:
   ```env
   # API Configuration
   VITE_API_BASE_URL=http://your-api-server:8000/api/v1

   # Application
   VITE_APP_TITLE=Balance App
   VITE_APP_VERSION=1.0.0

   # Environment
   NODE_ENV=development
   ```

> **Важно:** Переменные с префиксом `VITE_` доступны в клиентском коде через `import.meta.env.VITE_*`

---

## Способы запуска

### Локальный запуск (без Docker)

#### 1. Установка зависимостей

```bash
npm install
```

#### 2. Запуск в режиме разработки

```bash
npm run dev
```

Приложение будет доступно по адресу: `http://localhost:7000`

#### 3. Сборка для production

```bash
npm run build
```

Собранные файлы появятся в папке `dist/`

#### 4. Предпросмотр production сборки

```bash
npm run preview
```

#### 5. Проверка кода (линтинг)

```bash
npm run lint
```

---

### Docker Development

Development режим включает **hot reload** — изменения в коде автоматически применяются без перезапуска.

#### Запуск

```bash
# Используя Make
make dev

# Или напрямую через Docker Compose
docker-compose -f docker-compose.dev.yml up
```

#### Пересборка и запуск

```bash
# Используя Make
make dev-build

# Или напрямую
docker-compose -f docker-compose.dev.yml up --build
```

#### Остановка

```bash
# Используя Make
make dev-down

# Или напрямую
docker-compose -f docker-compose.dev.yml down
```

**Доступ:** `http://localhost:5173` (или порт указанный в `DEV_PORT`)

**Особенности dev режима:**
- Hot Module Replacement (HMR)
- Монтирование локальных файлов (`src/`, `public/`, и др.)
- Автоматическая перезагрузка при изменениях
- node_modules используются из контейнера

---

### Docker Production

Production режим собирает оптимизированную версию и запускает через Nginx.

#### Предварительная настройка

Создайте Docker сеть (один раз):

```bash
docker network create balance-network
```

#### Запуск

```bash
# Используя Make
make prod

# Или напрямую
docker-compose up -d
```

#### Пересборка и запуск

```bash
# Используя Make
make prod-build

# Или напрямую
docker-compose up -d --build
```

#### Остановка

```bash
# Используя Make
make prod-down

# Или напрямую
docker-compose down
```

**Доступ:** `http://localhost:3000`

**Особенности production режима:**
- Многоэтапная сборка (multi-stage build)
- Nginx с gzip сжатием
- Кэширование статических ресурсов (1 год)
- Security headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)
- Health check endpoint: `/health`
- SPA fallback для React Router

---

## Makefile команды

Все доступные команды можно посмотреть:

```bash
make help
```

### Development команды

| Команда | Описание |
|---------|----------|
| `make dev` | Запустить development окружение с hot reload |
| `make dev-build` | Пересобрать и запустить dev окружение |
| `make dev-down` | Остановить dev окружение |
| `make dev-logs` | Показать логи dev окружения |
| `make restart-dev` | Перезапустить dev окружение |
| `make exec-dev` | Войти в dev контейнер (shell) |

### Production команды

| Команда | Описание |
|---------|----------|
| `make prod` | Запустить production окружение |
| `make prod-build` | Пересобрать и запустить prod окружение |
| `make prod-down` | Остановить prod окружение |
| `make prod-logs` | Показать логи prod окружения |
| `make restart` | Перезапустить prod окружение |
| `make exec` | Войти в prod контейнер (shell) |

### Утилиты

| Команда | Описание |
|---------|----------|
| `make build` | Собрать production образ |
| `make build-no-cache` | Собрать образ без кэша |
| `make logs` | Показать логи (prod) |
| `make ps` | Показать запущенные контейнеры |
| `make clean` | Очистить все (контейнеры, образы, volumes) |
| `make health` | Проверить health контейнера |
| `make stats` | Показать статистику ресурсов |
| `make setup` | Первоначальная настройка (создание .env) |

---

## Конфигурация

### Vite (vite.config.ts)

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),  // Алиас для импортов
    },
  },
  server: {
    port: 7000,  // Порт dev сервера (локально)
    cors: {
      origin: 'https://...',  // Разрешенные CORS origins
    },
  }
})
```

### Nginx (nginx.conf)

Production конфигурация включает:
- **Gzip сжатие** для text/html, CSS, JS, JSON
- **Кэширование** статики на 1 год
- **SPA fallback** — все маршруты ведут на index.html
- **Security headers** — защита от XSS, clickjacking
- **Health endpoint** — `/health` для мониторинга

### Порты

| Режим | Порт | Описание |
|-------|------|----------|
| Local dev | 7000 | Vite dev server (npm run dev) |
| Docker dev | 5173 | Vite dev server в контейнере |
| Docker prod | 3000 | Nginx (проксируется на 80 внутри) |

---

## Устранение неполадок

### Проблема: Приложение не видит API

1. Проверьте переменную `VITE_API_BASE_URL` в `.env`
2. Убедитесь, что API сервер доступен
3. Проверьте CORS настройки на API сервере
4. Пересоберите контейнер после изменения `.env`:
   ```bash
   make dev-build  # или make prod-build
   ```

### Проблема: Hot reload не работает (Docker dev)

1. Проверьте, что volumes правильно монтируются
2. Перезапустите контейнер:
   ```bash
   make restart-dev
   ```
3. Проверьте логи:
   ```bash
   make dev-logs
   ```

### Проблема: Ошибка "network balance-network not found"

Создайте сеть перед запуском production:

```bash
docker network create balance-network
```

### Проблема: Порт уже занят

1. Найдите процесс:
   ```bash
   # Windows
   netstat -ano | findstr :3000

   # Linux/Mac
   lsof -i :3000
   ```
2. Остановите процесс или измените порт в `docker-compose.yml`

### Проблема: Ошибки сборки npm

1. Удалите node_modules и переустановите:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
2. Для Docker — пересоберите без кэша:
   ```bash
   make build-no-cache
   ```

### Проблема: Недостаточно памяти при сборке

Увеличьте память для Node.js:

```bash
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

---

## Полезные команды

```bash
# Просмотр логов в реальном времени
docker logs -f balance-app-dev

# Проверка состояния контейнеров
docker ps

# Вход в контейнер
docker exec -it balance-app-dev sh

# Очистка неиспользуемых образов
docker image prune -a

# Полная очистка Docker
docker system prune -a --volumes
```

---

## Контакты и поддержка

При возникновении проблем обратитесь к команде разработки.
