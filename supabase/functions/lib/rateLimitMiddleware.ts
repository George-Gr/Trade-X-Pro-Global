// Deno-specific rate limiting middleware - TS ignores for Node context
// Deploy with: supabase functions deploy

declare const Deno: any;

export async function checkRateLimit(supabase: any, userId: string, endpoint: string, maxRequests: number = 100, windowSeconds: number = 60): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_user_id: userId,
      p_endpoint: endpoint,
      p_max_requests: maxRequests,
      p_window_seconds: windowSeconds
    });
    return data === true && !error;
  } catch {
    return false;
  }
}
