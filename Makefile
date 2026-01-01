# Chrome Web Store Publishing Makefile
# Usage: make <target>
# See 'make help' for available targets

# Load environment variables from .env if it exists
ifneq (,$(wildcard .env))
	include .env
	export
endif

# Validation
.PHONY: check-env
check-env:
ifndef EXTENSION_ID
	$(error EXTENSION_ID is not set. Copy .env.example to .env and configure credentials)
endif
ifndef CLIENT_ID
	$(error CLIENT_ID is not set. See docs/PUBLISHING.md for setup instructions)
endif
ifndef CLIENT_SECRET
	$(error CLIENT_SECRET is not set. See docs/PUBLISHING.md for setup instructions)
endif
ifndef REFRESH_TOKEN
	$(error REFRESH_TOKEN is not set. Run 'make cws-init' to generate one)
endif

# Build targets
.PHONY: build
build: ## Build the extension
	npm run build

.PHONY: package
package: build ## Build and create dist.zip
	cd dist && zip -r ../dist.zip . && cd ..
	@echo "Created dist.zip ($$(du -h dist.zip | cut -f1))"

# Chrome Web Store targets
.PHONY: cws-init
cws-init: ## Initialize Chrome Web Store credentials (interactive)
	npx chrome-webstore-upload-cli init

.PHONY: cws-upload
cws-upload: check-env package ## Upload extension to Chrome Web Store (draft)
	npx chrome-webstore-upload upload \
		--source dist.zip \
		--extension-id $(EXTENSION_ID) \
		--client-id $(CLIENT_ID) \
		--client-secret $(CLIENT_SECRET) \
		--refresh-token $(REFRESH_TOKEN)

.PHONY: cws-publish
cws-publish: check-env ## Publish the uploaded draft to Chrome Web Store
	npx chrome-webstore-upload publish \
		--extension-id $(EXTENSION_ID) \
		--client-id $(CLIENT_ID) \
		--client-secret $(CLIENT_SECRET) \
		--refresh-token $(REFRESH_TOKEN)

.PHONY: cws-deploy
cws-deploy: cws-upload cws-publish ## Upload and publish in one step
	@echo "Extension deployed successfully!"

# Convenience aliases
.PHONY: release
release: cws-deploy ## Alias for cws-deploy

.PHONY: upload
upload: cws-upload ## Alias for cws-upload

.PHONY: publish
publish: cws-publish ## Alias for cws-publish

# Development targets
.PHONY: dev
dev: ## Start development server
	npm run dev

.PHONY: test
test: ## Run unit tests
	npm run test:run

.PHONY: test-e2e
test-e2e: ## Run end-to-end tests
	npm run test:e2e

.PHONY: lint
lint: ## Run linter (placeholder)
	@echo "No linter configured yet"

# Utility targets
.PHONY: clean
clean: ## Clean build artifacts
	rm -rf dist dist.zip

.PHONY: version
version: ## Show current version
	@node -p "require('./package.json').version"

.PHONY: bump-patch
bump-patch: ## Bump patch version (1.0.x)
	npm version patch --no-git-tag-version
	@echo "Version bumped to $$(make version)"

.PHONY: bump-minor
bump-minor: ## Bump minor version (1.x.0)
	npm version minor --no-git-tag-version
	@echo "Version bumped to $$(make version)"

.PHONY: bump-major
bump-major: ## Bump major version (x.0.0)
	npm version major --no-git-tag-version
	@echo "Version bumped to $$(make version)"

# Help target
.PHONY: help
help: ## Show this help message
	@echo "Usage: make <target>"
	@echo ""
	@echo "Targets:"
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "  %-15s %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

# Default target
.DEFAULT_GOAL := help
