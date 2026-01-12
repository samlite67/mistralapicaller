import { Router } from 'itty-router';

const router = Router();

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// Handle CORS preflight
router.options('*', () => {
  return new Response(null, { headers: corsHeaders });
});

// Proxy all requests to Mistral API
router.all('*', async (request, env) => {
  try {
    const url = new URL(request.url);
    const mistralUrl = `https://api.mistral.ai${url.pathname}${url.search}`;

    const proxyRequest = new Request(mistralUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
    });

    const response = await fetch(proxyRequest);
    const newResponse = new Response(response.body, response);

    // Add CORS headers to response
    Object.entries(corsHeaders).forEach(([key, value]) => {
      newResponse.headers.set(key, value);
    });

    return newResponse;

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Proxy Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

export default router;
