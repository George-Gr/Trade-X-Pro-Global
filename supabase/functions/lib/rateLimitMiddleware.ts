// Deno-specific rate limiting middleware - TS ignores for Node context
// Deploy with: supabase functions deploy

declare const Deno: Record<string, unknown>;

export async function checkRateLimit(
  supabase: unknown,
  userId: string,
  endpoint: string,
  maxRequests: number = 100,
  windowSeconds: number = 60,
): Promise<boolean> {
  try {
    const { data, error } = await (
      supabase as {
        rpc: (
          name: string,
          params: Record<string, unknown>,
        ) => Promise<{ data: unknown; error: unknown }>;
      }
    ).rpc("check_rate_limit", {
      p_user_id: userId,
      p_endpoint: endpoint,
      p_max_requests: maxRequests,
      p_window_seconds: windowSeconds,
    });
    return data === true && !error;
  } catch {
    return false;
  }
}
