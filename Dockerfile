# Multi-stage build для оптимизации размера образа

# Этап 1: Сборка приложения
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm ci --only=production=false

# Копируем исходный код
COPY . .

# Собираем production build
RUN npm run build


