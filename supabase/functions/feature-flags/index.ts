import { serve } from 'http/server';\nimport { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

interface FeatureFlag {
  key: string;
  enabled: boolean;
  rolloutPercentage: number;
  environments: string[];
  dependencies?: string[];
  description?: string;
}

interface ServerFeatureFlags {
  flags: FeatureFlag[];
  timestamp: string;
  version: string;
  checksum: string;
}

// Feature flag configuration
const FEATURE_FLAGS: FeatureFlag[] = [
  {
    key: 'advanced_charts',
    enabled: true,
    rolloutPercentage: 100,
    environments: ['development', 'staging', 'production'],
    description: 'Enable advanced charting features'
  },
  {
    key: 'copy_trading',
    enabled: false,
    rolloutPercentage: 0,
    environments: ['development'],
    dependencies: ['advanced_charts'],
    description: 'Enable copy trading functionality'
  },
  {
    key: 'api_access',
    enabled: false,
    rolloutPercentage: 0,
    environments: ['development'],
    description: 'Enable API access for users'
  },
  {
    key: 'real_time_data',
    enabled: true,
    rolloutPercentage: 100,
    environments: ['development', 'staging', 'production'],
    description: 'Enable real-time market data'
  },
  {
    key: 'advanced_analytics',
    enabled: false,
    rolloutPercentage: 10,
    environments: ['development', 'staging'],
    dependencies: ['advanced_charts'],
    description: 'Enable advanced analytics tools'
  },
  {
    key: 'risk_management_tools',
    enabled: true,
    rolloutPercentage: 100,
    environments: ['development', 'staging', 'production'],
    description: 'Enable risk management tools'
  },
  {
    key: 'portfolio_optimization',
    enabled: false,
    rolloutPercentage: 5,
    environments: ['development', 'staging'],
    dependencies: ['advanced_analytics'],
    description: 'Enable portfolio optimization features'
  },
  {
    key: 'algorithmic_trading',
    enabled: false,
    rolloutPercentage: 0,
    environments: ['development'],
    dependencies: ['api_access', 'advanced_analytics'],
    description: 'Enable algorithmic trading'
  }
];

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      try {
        // Verify JWT token
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          userId = user.id;
        }
      } catch (error) {
        console.warn('Invalid token:', error);
      }
    }

    // Get current environment
    const currentEnv = Deno.env.get('ENVIRONMENT') || 'development';

    // Filter flags based on environment and user
    const filteredFlags = FEATURE_FLAGS.filter(flag => {
      // Check if environment is allowed
      if (!flag.environments.includes(currentEnv)) {
        return false;
      }

      // Check dependencies
      if (flag.dependencies) {
        for (const dep of flag.dependencies) {
          const dependencyFlag = FEATURE_FLAGS.find(f => f.key === dep);
          if (!dependencyFlag || !dependencyFlag.enabled) {
            return false;
          }
        }
      }

      // Check rollout percentage
      if (flag.rolloutPercentage < 100) {
        const hash = hashString((userId || 'anonymous') + flag.key);
        const percentage = (hash % 100) + 1;
        if (percentage > flag.rolloutPercentage) {
          return false;
        }
      }

      return flag.enabled;
    });

    // Create response data
    const responseData: ServerFeatureFlags = {
      flags: filteredFlags,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      checksum: '' // Will be calculated below
    };

    // Calculate checksum for data integrity
    const dataString = JSON.stringify({
      flags: responseData.flags,
      timestamp: responseData.timestamp,
      version: responseData.version,
    });

    responseData.checksum = await calculateChecksum(dataString);

    return new Response(JSON.stringify(responseData), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200,
    });
  } catch (error) {
    console.error('Error fetching feature flags:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch feature flags',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500,
      }
    );
  }
});

/**
 * Calculate SHA-256 checksum
 */
async function calculateChecksum(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Simple hash function for deterministic rollout
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// To invoke:
// curl -i --location --request GET 'http://localhost:54321/functions/v1/feature-flags' \
//   --header 'Authorization: Bearer YOUR_ACCESS_TOKEN'