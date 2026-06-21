.PHONY: setup env up up-scaled down logs test test-gateway test-acceptance restart clean frontend frontend-install
.PHONY: security-scan security-scan-images security-scan-dast
.PHONY: load-test load-test-smoke load-test-stress load-test-scale-compare
.PHONY: k8s-cluster k8s-deploy k8s-teardown monitoring

setup: env
	./scripts/setup.sh

env:
	@test -f .env || cp .env.example .env
	@./scripts/render-traefik.sh

up: env
	docker compose up --build -d

up-scaled: env
	chmod +x scripts/compose-up-scaled.sh
	./scripts/compose-up-scaled.sh

down:
	docker compose down

logs:
	docker compose logs -f

logs-grafana:
	docker compose logs -f grafana prometheus

monitoring:
	docker compose up -d --build iam workout prometheus grafana

load-test load-test-nfr-01:
	chmod +x scripts/load-test.sh
	./scripts/load-test.sh nfr-01-load

load-test-smoke:
	chmod +x scripts/load-test.sh
	K6_VUS=3 K6_DURATION=30s K6_SETUP_USERS=1 K6_SETUP_DELAY=0 ./scripts/load-test.sh smoke

load-test-stress load-test-nfr-03:
	chmod +x scripts/load-test.sh
	./scripts/load-test.sh nfr-03-stress

load-test-scale-compare:
	chmod +x scripts/load-test-scale-compare.sh scripts/compose-up-scaled.sh scripts/wait-for-stack.sh scripts/load-test.sh
	./scripts/load-test-scale-compare.sh

k8s-cluster:
	chmod +x scripts/k3d-cluster.sh
	./scripts/k3d-cluster.sh

k8s-deploy: env
	chmod +x scripts/k8s-deploy.sh
	./scripts/k8s-deploy.sh

k8s-teardown:
	chmod +x scripts/k8s-teardown.sh
	./scripts/k8s-teardown.sh

test:
	./scripts/test-all.sh

test-gateway:
	./scripts/test-gateway.sh

test-acceptance:
	chmod +x scripts/test-acceptance.sh
	./scripts/test-acceptance.sh

security-scan:
	chmod +x scripts/security-scan.sh scripts/wait-for-stack.sh
	./scripts/security-scan.sh all

security-scan-images:
	chmod +x scripts/security-scan.sh
	./scripts/security-scan.sh images

security-scan-dast:
	chmod +x scripts/security-scan.sh scripts/wait-for-stack.sh
	./scripts/security-scan.sh dast

restart: down up

clean:
	docker compose down -v

frontend-install:
	cd frontends/main-frontend && npm install

frontend:
	@test -f frontends/main-frontend/.env.local || cp frontends/main-frontend/.env.local.example frontends/main-frontend/.env.local
	cd frontends/main-frontend && npm run dev
