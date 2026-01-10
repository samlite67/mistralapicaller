import { ApiException, fromHono } from "chanfana";
import { Hono } from "hono";
import { tasksRouter } from "./endpoints/tasks/router";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { DummyEndpoint } from "./endpoints/dummyEndpoint";
import { cors } from 'hono/cors';

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

app.use('/api/*', cors());

app.onError((err, c) => {
	if (err instanceof ApiException) {
		// If it's a Chanfana ApiException, let Chanfana handle the response
		return c.json(
			{ success: false, errors: err.buildResponse() },
			err.status as ContentfulStatusCode,
		);
	}

	console.error("Global error handler caught:", err); // Log the error if it's not known

	// For other errors, return a generic 500 response
	return c.json(
		{
			success: false,
			errors: [{ code: 7000, message: "Internal Server Error" }],
		},
		500,
	);
});

// Setup OpenAPI registry
const openapi = fromHono(app, {
	docs_url: "/",
	schema: {
		info: {
			title: "My Awesome API",
			version: "2.0.0",
			description: "This is the documentation for my awesome API.",
		},
	},
});

// Register Tasks Sub router
openapi.route("/api/tasks", tasksRouter);

// Register other endpoints
openapi.post("/api/dummy/:slug", DummyEndpoint);

// Memory API routes for state persistence
app.get('/api/state', async (c) => {
	const result = await c.env.DB.prepare('SELECT state FROM memory WHERE id = ?').bind('latest').first();
	return c.json({ state: result ? JSON.parse(result.state as string) : null });
});

app.post('/api/state', async (c) => {
	const { state } = await c.req.json();
	await c.env.DB.prepare('INSERT OR REPLACE INTO memory (id, state, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)').bind('latest', JSON.stringify(state)).run();
	return c.json({ success: true });
});

app.post('/api/chat', async (c) => {
	const { messages } = await c.req.json();
	const apiKey = c.env.MISTRAL_API_KEY;

	const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			model: 'mistral-tiny',
			messages,
		}),
	});

	const data = await response.json();
	return c.json(data);
});

// Export the Hono app
export default app;
