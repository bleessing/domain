# Этап 1: Сборка приложения
FROM node:20-alpine AS builder

WORKDIR /app

RUN npm config set registry https://registry.npmmirror.com

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm ci


# Копируем исходный код
COPY . .

# Собираем production build
RUN npm run build

FROM nginx:alpine

# Удаляем дефолтный конфиг
RUN rm /etc/nginx/conf.d/default.conf

# SPA-конфиг
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Копируем сборку
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
