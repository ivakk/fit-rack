.PHONY: setup env up down logs test test-gateway test-acceptance restart clean frontend frontend-install

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

load-test:
	chmod +x scripts/load-test.sh
	./scripts/load-test.sh full-flow

load-test-smoke:
	chmod +x scripts/load-test.sh
	K6_VUS=3 K6_DURATION=30s K6_SETUP_USERS=1 K6_SETUP_DELAY=0 ./scripts/load-test.sh smoke

test:
	./scripts/test-all.sh

test-gateway:
	./scripts/test-gateway.sh

test-acceptance:
	chmod +x scripts/test-acceptance.sh
	./scripts/test-acceptance.sh

restart: down up

clean:
	docker compose down -v

frontend-install:
	cd frontends/main-frontend && npm install

frontend:
	@test -f frontends/main-frontend/.env.local || cp frontends/main-frontend/.env.local.example frontends/main-frontend/.env.local
	cd frontends/main-frontend && npm run dev
