/**
 * Bundle Analysis Service
 *
 * Provides real-time bundle size data for the performance dashboard.
 * Falls back to baseline values if actual build data is unavailable.
 */

export interface BundleSize {
  name: string;
  size: number; // Size in KB
  limit: number; // Budget limit in KB
  status: 'good' | 'warning' | 'critical';
  percentage: number;
}

export interface BundleAnalysisData {
  bundles: BundleSize[];
  totalSize: number;
  totalLimit: number;
  timestamp: string;
  isRealData: boolean;
}

// Interface for raw bundle data from JSON
interface RawBundleData {
  name?: string;
  size: number | string;
  limit: number | string;
}

// Baseline/target values (fallback when real data unavailable)
const BASELINE_BUNDLES: BundleSize[] = [
  {
    name: 'React Core',
    size: 145,
    limit: 150,
    status: 'good',
    percentage: 96.7,
  },
  {
    name: 'Charts',
    size: 480,
    limit: 500,
    status: 'warning',
    percentage: 96.0,
  },
  {
    name: 'TanStack Query',
    size: 85,
    limit: 100,
    status: 'good',
    percentage: 85.0,
  },
  {
    name: 'UI Libs',
    size: 180,
    limit: 200,
    status: 'good',
    percentage: 90.0,
  },
  {
    name: 'Main Entry',
    size: 250,
    limit: 300,
    status: 'good',
    percentage: 83.3,
  },
];

class BundleAnalysisService {
  private cachedData: BundleAnalysisData | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get bundle analysis data - tries to fetch real data first, falls back to baseline
   */
  async getBundleAnalysis(): Promise<BundleAnalysisData> {
    // Return cached data if still valid
    if (
      this.cachedData &&
      Date.now() - this.cacheTimestamp < this.CACHE_DURATION
    ) {
      return this.cachedData;
    }

    try {
      // Try to fetch real bundle data from API
      const realData = await this.fetchRealBundleData();
      if (realData) {
        this.cachedData = realData;
        this.cacheTimestamp = Date.now();
        return realData;
      }
    } catch (error) {
      console.warn('Failed to fetch real bundle data, using baseline:', error);
    }

    // Fallback to baseline data
    const baselineData = this.createBaselineData();
    this.cachedData = baselineData;
    this.cacheTimestamp = Date.now();
    return baselineData;
  }

  /**
   * Try to fetch real bundle data from the generated JSON file
   */
  private async fetchRealBundleData(): Promise<BundleAnalysisData | null> {
    try {
      const response = await fetch('/bundle-sizes.json', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Validate the response structure
      if (!data.bundles || !Array.isArray(data.bundles)) {
        throw new Error('Invalid bundle data structure');
      }

      // Process and validate each bundle
      const processedBundles = data.bundles.map((bundle: RawBundleData) =>
        this.processBundleData(bundle)
      );

      return {
        bundles: processedBundles,
        totalSize: processedBundles.reduce(
          (sum: number, bundle: BundleSize) => sum + bundle.size,
          0
        ),
        totalLimit: processedBundles.reduce(
          (sum: number, bundle: BundleSize) => sum + bundle.limit,
          0
        ),
        timestamp: data.metadata?.timestamp || new Date().toISOString(),
        isRealData: true,
      };
    } catch (error) {
      console.warn('Bundle sizes JSON file unavailable:', error);
      return null;
    }
  }

  /**
   * Process raw bundle data into standardized format
   */
  private processBundleData(bundle: RawBundleData): BundleSize {
    const size =
      typeof bundle.size === 'number'
        ? bundle.size
        : parseFloat(bundle.size) || 0;
    const limit =
      typeof bundle.limit === 'number'
        ? bundle.limit
        : parseFloat(bundle.limit) || 0;

    const percentage = limit > 0 ? (size / limit) * 100 : 0;

    let status: 'good' | 'warning' | 'critical' = 'good';
    if (percentage > 100) {
      status = 'critical';
    } else if (percentage > 80) {
      status = 'warning';
    }

    return {
      name: bundle.name || 'Unknown',
      size,
      limit,
      status,
      percentage: Math.min(percentage, 100),
    };
  }

  /**
   * Create baseline data with current timestamp
   */
  private createBaselineData(): BundleAnalysisData {
    const processedBundles = BASELINE_BUNDLES.map((bundle) => ({
      ...bundle,
      percentage: Math.min((bundle.size / bundle.limit) * 100, 100),
    }));

    return {
      bundles: processedBundles,
      totalSize: processedBundles.reduce((sum, bundle) => sum + bundle.size, 0),
      totalLimit: processedBundles.reduce(
        (sum, bundle) => sum + bundle.limit,
        0
      ),
      timestamp: new Date().toISOString(),
      isRealData: false,
    };
  }

  /**
   * Force refresh of bundle data (bypass cache)
   */
  async refreshBundleData(): Promise<BundleAnalysisData> {
    this.cachedData = null;
    this.cacheTimestamp = 0;
    return this.getBundleAnalysis();
  }

  /**
   * Check if using real data or baseline
   */
  isUsingRealData(): boolean {
    return this.cachedData?.isRealData || false;
  }

  /**
   * Get cache status
   */
  getCacheStatus(): { cached: boolean; age: number; maxAge: number } {
    return {
      cached: !!this.cachedData,
      age: this.cachedData ? Date.now() - this.cacheTimestamp : 0,
      maxAge: this.CACHE_DURATION,
    };
  }
}

// Export singleton instance
export const bundleAnalysisService = new BundleAnalysisService();

// Export helper function for easy access
export const getBundleAnalysis = () =>
  bundleAnalysisService.getBundleAnalysis();
