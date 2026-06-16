.DEFAULT_GOAL := help

.PHONY: help up down build rebuild restart logs ps migrate shell-api shell-db setup

help: ## Показать список команд
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

setup: ## Создать .env файлы из примеров (первый запуск)
	@test -f .env || cp .env.example .env
	@test -f frontend/.env || cp frontend/.env.example frontend/.env
	@echo "Готово. Проверьте .env и frontend/.env"

up: ## Запустить всё (база + бэкенд + фронтенд)
	docker compose up -d

build: ## Запустить всё с пересборкой образов
	docker compose up -d --build

down: ## Остановить всё
	docker compose down

rebuild: ## Полная пересборка с нуля
	docker compose down
	docker compose up -d --build

restart: ## Перезапустить все контейнеры
	docker compose restart

logs: ## Логи всех сервисов (Ctrl+C для выхода)
	docker compose logs -f

ps: ## Статус контейнеров
	docker compose ps

migrate: ## Накатить миграции базы данных
	docker compose exec api alembic upgrade head

shell-api: ## Зайти внутрь контейнера бэкенда
	docker compose exec api bash

shell-db: ## Открыть psql в базе данных
	docker compose exec db psql -U taxi -d taxi_db
