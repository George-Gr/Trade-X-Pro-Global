/**
 * Token Retrieval API Endpoint
 *
 * This endpoint validates authentication cookies and returns token data
 * for client-side use in production environments.
 */


/**
 * Token Response Interface
 */
interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  userId: string;
}

Deno.serve(async (req: Request) => {
  // Only accept GET requests
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Get tokens from cookies
    const cookies = req.headers.get('cookie') || '';
    const cookieMap = new Map<string, string>();
    cookies.split(';').forEach(cookie => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) cookieMap.set(key, value);
    });

    const accessToken = cookieMap.get('access_token');
    const refreshToken = cookieMap.get('refresh_token');
    const expiresAtStr = cookieMap.get('expires_at');
    const userId = cookieMap.get('user_id');

    // Validate tokens
    if (!accessToken || !refreshToken || !expiresAtStr) {
      return new Response(JSON.stringify({ error: 'No valid authentication tokens found' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const expiresAt = parseInt(expiresAtStr, 10);

    // Check if tokens are expired
    if (Date.now() >= expiresAt) {
      return new Response(JSON.stringify({ error: 'Authentication tokens have expired' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }



    // Return token data
    return new Response(JSON.stringify({ accessToken, refreshToken, expiresAt, userId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Tokens endpoint error:', error);

    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
