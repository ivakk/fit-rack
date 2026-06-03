.PHONY: setup env up down logs test test-gateway restart clean frontend frontend-install

setup: env
	./scripts/setup.sh

env:
	@test -f .env || cp .env.example .env
	@./scripts/render-traefik.sh

up: env
	docker compose up --build -d

down:
	docker compose down

logs:
	docker compose logs -f

logs-grafana:
	docker compose logs -f grafana prometheus

monitoring:
	docker compose up -d --build iam workout prometheus grafana

test:
	./scripts/test-all.sh

test-gateway:
	./scripts/test-gateway.sh

restart: down up

clean:
	docker compose down -v

frontend-install:
	cd frontends/main-frontend && npm install

frontend:
	@test -f frontends/main-frontend/.env.local || cp frontends/main-frontend/.env.local.example frontends/main-frontend/.env.local
	cd frontends/main-frontend && npm run dev
