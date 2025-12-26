# Multi-stage build для оптимизации размера образа

# ==========================================
# Этап 1: Сборка приложения
# ==========================================
FROM node:20-alpine AS builder

# Установка аргументов сборки для Vite
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем все зависимости (включая devDependencies для сборки)
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем production build
# TypeScript компиляция + Vite build
RUN npm run build

# ==========================================
# Этап 2: Production образ с nginx
# ==========================================



