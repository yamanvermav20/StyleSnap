# Framework commands (doctor, gen, check, run-*, parity) come from geeknative.
include .geeknative/framework.mk

.DEFAULT_GOAL := help

# Add your own targets below.

.PHONY: run-backend seed-backend check-backend android-reverse

run-backend: ## Start the StyleSnap API on http://127.0.0.1:8787 (seeds on first run; DELAY_MS=800 slows responses)
	@npm start --workspace backend

seed-backend: ## Reset the StyleSnap database to the seed data
	@npm run seed --workspace backend

check-backend: ## Test the StyleSnap API against contracts/api.json
	@npm test --workspace backend

android-reverse: ## Let the Android emulator reach the API at 127.0.0.1:8787
	@"$${ANDROID_HOME:-$$HOME/Library/Android/sdk}/platform-tools/adb" reverse tcp:8787 tcp:8787 && echo "adb reverse tcp:8787 -> host:8787"
