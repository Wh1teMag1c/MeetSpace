# MeetSpace – Сервис бронирования переговорных комнат

Современное веб-приложение для автоматизации управления офисными пространствами и удобного бронирования переговорных комнат.

## Стек технологий

| Компонент | Технология |
|-----------|------------|
| Язык | Python, JavaScript |
| Фреймворк бэкенда | Django + Django REST Framework |
| СУБД | PostgreSQL |
| Аутентификация | Djoser (JWT) |
| Фронтенд | React (Vite) + Bootstrap 5 |
| Контейнеризация | Docker, Docker Compose |
| Веб-сервер | Nginx, Gunicorn |

## Структура проекта

```text
.
├── backend/               # Серверная часть (Django)
│   ├── api/               # Бизнес-логика, модели и API
│   ├── config/            # Настройки проекта
│   ├── management/        # Команды управления (seed_data)
│   ├── Dockerfile
│   ├── requirements.txt
│   └── manage.py
├── frontend/              # Клиентская часть (React)
│   ├── src/               # Исходный код
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.js
├── nginx/                 # Конфигурация Reverse Proxy
│   └── nginx.conf
├── docker-compose.yml     # Оркестрация контейнеров
└── README.md
```

## Быстрый старт (Docker)

Проект запускается одной командой. Весь процесс сборки и настройки сети автоматизирован.

### 1. Настройка окружения
Создайте файл `.env` в корне проекта (рядом с `docker-compose.yml`) и добавьте переменные для базы данных и безопасности (без дублирования):

```env
POSTGRES_DB=meetspace_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=db
POSTGRES_PORT=5432
SECRET_KEY="django-insecure-your-secret-key-here"
```

### 2. Запуск приложения
Выполните сборку и запуск контейнеров в фоновом режиме:

```bash
docker-compose up -d --build
```

### 3. Заполнение базы данных (Seed Data)
Чтобы быстро протестировать интерфейс, запустите скрипт генерации данных. Он создаст тестовых пользователей, комнаты с реальными фото и расписание бронирований:

```bash
docker-compose exec backend python manage.py seed_data
```

## Доступ к сервису
- **Frontend:** [http://localhost](http://localhost)
- **Django Admin:** [http://localhost/admin/](http://localhost/admin/)
- **API Root:** [http://localhost/api/](http://localhost/api/)

## Демо-пользователи (после seed_data)
Для входа в систему можно использовать следующих пользователей (пароль у всех `password123`):
- `ivan_dev`
- `anna_qa`
- `alex_pm`

## Тестирование
Проект включает в себя интеграционные тесты для проверки логики бронирования и прав доступа. Запуск тестов внутри контейнера:

```bash
docker-compose exec backend python manage.py test api
```
