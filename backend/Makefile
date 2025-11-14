container_runtime := $(shell which docker)

$(info using ${container_runtime})

up: down
	$(container_runtime) compose up --build -d


down:
	$(container_runtime) compose down


run-test:
	$(container_runtime) run --rm --network=host tests:latest

test:
	make down
	make up
	make run-tests
	make down
	@echo "test finished"

lint:
	golangci-lint run -E gocritic -v ./...

logs:
	$(container_runtime) compose logs -f api-gateway

status:
	$(container_runtime) compose ps


