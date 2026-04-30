PNPM ?= pnpm
HOST ?= 127.0.0.1
PORT ?= 5175

.PHONY: install dev run check lint test build

install:
	$(PNPM) install

dev:
	$(PNPM) run dev --host $(HOST) --port $(PORT) --strictPort

run: dev

check:
	$(PNPM) run check

lint:
	$(PNPM) run lint

test:
	$(PNPM) run test

build:
	$(PNPM) run build
