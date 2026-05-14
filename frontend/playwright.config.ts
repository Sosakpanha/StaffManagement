import { defineConfig, devices } from '@playwright/test'

// Most CI hosts have Docker (for the API's SQL Server) and a configured
// API_BASE_URL. Local runs can use the same defaults as `npm run dev`.
const baseURL = process.env.PW_BASE_URL ?? 'http://localhost:5173'

export default defineConfig({
	testDir: './e2e',
	timeout: 30_000,
	fullyParallel: false, // tests share a single DB; run serially
	retries: 0,
	reporter: process.env.CI ? [['github'], ['list']] : 'list',
	use: {
		baseURL,
		trace: 'retain-on-failure',
	},
	projects: [
		{ name: 'chromium', use: { ...devices['Desktop Chrome'] } },
	],
	webServer: process.env.PW_NO_WEBSERVER
		? undefined
		: {
			command: 'npm run dev',
			url: baseURL,
			reuseExistingServer: true,
			timeout: 30_000,
		},
})
