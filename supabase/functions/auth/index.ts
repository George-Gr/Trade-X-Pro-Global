/**
 * Authentication API Endpoints for HttpOnly Cookies
 *
 * These endpoints handle authentication operations when using HttpOnly cookies
 * for secure token storage in production environments.
 */

import { createClient } from '@supabase/supabase-js';

// Deno global declarations for TypeScript
declare global {
  const Deno: {
    serve: (handler: (req: Request) => Response | Promise<Response>) => void;
    env: {
      get: (key: string) => string | undefined;
    };
  };
}

/**
 * Get CORS headers based on request origin validation
 */
function getCorsHeaders(req: Request) {
  const allowedOriginsEnv = Deno.env.get('ALLOWED_ORIGINS');
  const allowedOrigins = allowedOriginsEnv
    ? allowedOriginsEnv.split(',').map((s) => s.trim())
    : [];
  const defaultOrigin = allowedOrigins[0] || null;
  const origin = req.headers.get('origin');
  let allowOrigin = defaultOrigin;
  if (origin && allowedOrigins.includes(origin)) {
    allowOrigin = origin;
  }
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
  };
  if (allowOrigin) {
    headers['Access-Control-Allow-Origin'] = allowOrigin;
  }
  return headers;
}

/**
 * Authentication Response Interface
 */
interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    userId?: string;
    email?: string;
    expiresAt?: number;
  };
  error?: string;
}

/**
 * Token Response Interface
 */
interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  userId?: string;
}

/**
 * User Info Interface
 */
interface UserInfo {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Method not allowed',
      }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Server configuration error',
          error: 'Authentication service misconfigured',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const body = await req.json();
    const { email, password, code, codeVerifier, redirectUri } = body;

    // Validate request - require either (email && password) OR (code && codeVerifier && redirectUri)
    const hasCredentials = email && password;
    const hasAuthCode = code && codeVerifier && redirectUri;

    if (!hasCredentials && !hasAuthCode) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Missing required parameters',
          error:
            'Provide either email and password, or authorization code with codeVerifier and redirectUri',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle PKCE authentication
    if (hasAuthCode) {
      const result = await handlePKCEAuthentication(
        supabaseAdmin,
        code,
        codeVerifier,
        redirectUri
      );
      if (!result.success || !result.tokens) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Authentication failed',
            error: result.error,
          }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Set HttpOnly cookies
      const response = new Response(
        JSON.stringify({
          success: true,
          message: 'Authentication successful',
          data: {
            userId: result.tokens.userId,
            expiresAt: result.tokens.expiresAt,
          },
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );

      setAuthCookies(response, result.tokens);
      return response;
    }

    // Handle traditional login
    if (hasCredentials) {
      const result = await handleTraditionalLogin(
        supabaseAdmin,
        email,
        password
      );
      if (!result.success || !result.tokens) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Authentication failed',
            error: result.error,
          }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Set HttpOnly cookies
      const response = new Response(
        JSON.stringify({
          success: true,
          message: 'Authentication successful',
          data: {
            userId: result.tokens.userId,
            expiresAt: result.tokens.expiresAt,
          },
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );

      setAuthCookies(response, result.tokens);
      return response;
    }

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Invalid request parameters',
        error: 'Provide either email/password or authorization code',
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Authentication error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: 'Authentication service unavailable',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

/**
 * Handle PKCE authentication
 */
async function handlePKCEAuthentication(
  supabaseAdmin: any,
  code: string,
  codeVerifier: string,
  redirectUri: string
): Promise<{ success: boolean; tokens?: TokenResponse; error?: string }> {
  try {
    // Exchange authorization code for session
    const { data, error } = await supabaseAdmin.auth.exchangeCodeForSession(
      code
    );

    if (error || !data.session) {
      console.error('PKCE authentication error:', error);
      return { success: false, error: 'Invalid authorization code' };
    }

    const tokens: TokenResponse = {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: new Date(data.session.expires_at!).getTime(),
      userId: data.session.user.id,
    };

    return { success: true, tokens };
  } catch (error) {
    console.error('PKCE authentication error:', error);
    return { success: false, error: 'PKCE authentication failed' };
  }
}

/**
 * Handle traditional login
 */
async function handleTraditionalLogin(
  supabaseAdmin: any,
  email: string,
  password: string
): Promise<{ success: boolean; tokens?: TokenResponse; error?: string }> {
  try {
    // Authenticate with Supabase
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      console.error('Traditional login error:', error);
      return { success: false, error: 'Authentication failed' };
    }

    const tokens: TokenResponse = {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: new Date(data.session.expires_at!).getTime(),
      userId: data.session.user.id,
    };

    return { success: true, tokens };
  } catch (error) {
    console.error('Traditional login error:', error);
    return { success: false, error: 'Authentication failed' };
  }
}

/**
 * Set authentication cookies
 */
function setAuthCookies(response: Response, tokens: TokenResponse): void {
  const secure = Deno.env.get('NODE_ENV') === 'production';
  const cookieOptions = `HttpOnly; ${
    secure ? 'Secure;' : ''
  } SameSite=Strict; Path=/`;

  // Set access token cookie (short-lived)
  const accessTokenCookie = `access_token=${
    tokens.accessToken
  }; ${cookieOptions}; Max-Age=${Math.max(
    0,
    Math.floor((tokens.expiresAt - Date.now()) / 1000)
  )}`;
  const refreshTokenCookie = `refresh_token=${
    tokens.refreshToken
  }; ${cookieOptions}; Max-Age=${7 * 24 * 60 * 60}`; // 7 days
  const expiresAtCookie = `expires_at=${
    tokens.expiresAt
  }; ${cookieOptions}; Max-Age=${Math.max(
    0,
    Math.floor((tokens.expiresAt - Date.now()) / 1000)
  )}`;
  const userIdCookie = `user_id=${
    tokens.userId || ''
  }; ${cookieOptions}; Max-Age=${Math.max(
    0,
    Math.floor((tokens.expiresAt - Date.now()) / 1000)
  )}`;

  const existingHeaders = response.headers.get('Set-Cookie') || '';
  const allCookies = [
    accessTokenCookie,
    refreshTokenCookie,
    expiresAtCookie,
    userIdCookie,
  ];
  if (existingHeaders) {
    allCookies.unshift(existingHeaders);
  }

  response.headers.set('Set-Cookie', allCookies.join(', '));
}

/**
 * Logout endpoint - Clear HttpOnly cookies
 */
export async function logoutHandler(req: Request) {
  const corsHeaders = getCorsHeaders(req);
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Method not allowed',
      }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const response = new Response(
      JSON.stringify({
        success: true,
        message: 'Logout successful',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

    clearAuthCookies(response);
    return response;
  } catch (error) {
    console.error('Logout error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: 'Logout failed',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Clear authentication cookies
 */
function clearAuthCookies(response: Response): void {
  const secure = Deno.env.get('NODE_ENV') === 'production';
  const cookieOptions = `HttpOnly; ${
    secure ? 'Secure;' : ''
  } SameSite=Strict; Path=/; Max-Age=0`;

  const cookies = [
    `access_token=; ${cookieOptions}`,
    `refresh_token=; ${cookieOptions}`,
    `expires_at=; ${cookieOptions}`,
    `user_id=; ${cookieOptions}`,
  ];

  response.headers.set('Set-Cookie', cookies.join(', '));
}

/**
 * Refresh token endpoint
 */
export async function refreshHandler(req: Request) {
  const corsHeaders = getCorsHeaders(req);
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Method not allowed',
      }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get refresh token from cookies
    const cookies = req.headers.get('cookie') || '';
    const cookieMap = new Map<string, string>();
    cookies.split(';').forEach((cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) cookieMap.set(key, value);
    });

    const refreshToken = cookieMap.get('refresh_token');

    if (!refreshToken) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'No refresh token available',
          error: 'Authentication required',
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Refresh tokens using Supabase
    const result = await refreshTokens(supabaseAdmin, refreshToken);

    if (!result.success || !result.tokens) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Token refresh failed',
          error: result.error,
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Set new cookies
    const response = new Response(
      JSON.stringify({
        success: true,
        message: 'Tokens refreshed successfully',
        data: {
          expiresAt: result.tokens.expiresAt,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

    setAuthCookies(response, result.tokens);
    return response;
  } catch (error) {
    console.error('Token refresh error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: 'Token refresh failed',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Refresh tokens using Supabase
 */
async function refreshTokens(
  supabaseAdmin: any,
  refreshToken: string
): Promise<{ success: boolean; tokens?: TokenResponse; error?: string }> {
  try {
    // Use Supabase to refresh the token
    const { data, error } = await supabaseAdmin.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      console.error('Token refresh error:', error);
      return { success: false, error: 'Token refresh failed' };
    }

    const tokens: TokenResponse = {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: new Date(data.session.expires_at!).getTime(),
      userId: data.session.user.id,
    };

    return { success: true, tokens };
  } catch (error) {
    console.error('Token refresh error:', error);
    return { success: false, error: 'Token refresh failed' };
  }
}

/**
 * Get current user endpoint
 */
export async function userHandler(req: Request) {
  const corsHeaders = getCorsHeaders(req);
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Method not allowed',
      }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get user ID from cookies
    const cookies = req.headers.get('cookie') || '';
    const cookieMap = new Map<string, string>();
    cookies.split(';').forEach((cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) cookieMap.set(key, value);
    });

    const userId = cookieMap.get('user_id');
    const accessToken = cookieMap.get('access_token');

    if (!userId || !accessToken) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Authentication required',
          error: 'No valid session found',
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate token and get user info
    const userData = await getUserInfo(supabaseAdmin, userId, accessToken);

    if (!userData || !isUserInfo(userData)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Invalid session',
          error: 'User not found',
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: userData,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Get user error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: 'Failed to get user information',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Get user information
 */
async function getUserInfo(
  supabaseAdmin: any,
  userId: string,
  accessToken: string
): Promise<unknown> {
  try {
    // Get user from Supabase
    const { data: user, error } = await supabaseAdmin.auth.admin.getUserById(
      userId
    );

    if (error || !user) {
      console.error('Get user info error:', error);
      return null;
    }

    // Validate required fields and construct user info object
    if (
      typeof user.id === 'string' &&
      typeof user.email === 'string' &&
      typeof user.created_at === 'string'
    ) {
      const userInfo = {
        id: user.id,
        email: user.email,
        name:
          typeof user.user_metadata?.full_name === 'string'
            ? user.user_metadata.full_name
            : typeof user.user_metadata?.name === 'string'
            ? user.user_metadata.name
            : 'Unknown',
        createdAt: user.created_at,
      };
      return userInfo;
    }

    console.error('User info validation failed: invalid field types');
    return null;
  } catch (error) {
    console.error('Get user info error:', String(error));
    return null;
  }
}

/**
 * Type guard function to validate UserInfo
 */
function isUserInfo(obj: unknown): obj is UserInfo {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as any).id === 'string' &&
    typeof (obj as any).email === 'string' &&
    typeof (obj as any).name === 'string' &&
    typeof (obj as any).createdAt === 'string'
  );
}
