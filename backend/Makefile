# Makefile for E-Service Backend

.PHONY: help run build test clean install migrate

help:
	@echo "Available commands:"
	@echo "  make run       - Run the application"
	@echo "  make build     - Build the application"
	@echo "  make test      - Run tests"
	@echo "  make clean     - Clean build artifacts"
	@echo "  make install   - Install dependencies"

run:
	go run cmd/api/main.go

build:
	go build -o bin/eservice-api cmd/api/main.go

test:
	go test -v ./...

clean:
	rm -rf bin/
	go clean

install:
	go mod download
	go mod tidy

dev:
	air
