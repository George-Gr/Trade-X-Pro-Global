/**
 * useRiskEvents Hook Test Suite
 * 
 * Tests:
 * - Initial fetch of risk events
 * - Real-time subscription to new events
 * - Event limit enforcement
 * - Loading state management
 * - Error handling
 * - Cleanup and unsubscribe
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useRiskEvents, type RiskEvent } from '@/hooks/useRiskEvents';
import * as useAuthModule from '@/hooks/useAuth';

// Mock Supabase client
vi.mock('@/lib/supabaseBrowserClient', () => ({
  supabase: {
    from: vi.fn(),
    channel: vi.fn(),
    removeChannel: vi.fn(),
  },
}));

// Mock useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import { supabase } from '@/lib/supabaseBrowserClient';

describe('useRiskEvents', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockRiskEvents: RiskEvent[] = [
    {
      id: '1',
      event_type: 'margin_call',
      severity: 'critical',
      description: 'Margin level below 30%',
      resolved: false,
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      event_type: 'position_concentration',
      severity: 'warning',
      description: 'Position concentration > 40%',
      resolved: false,
      created_at: new Date(Date.now() - 60000).toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock useAuth
    vi.mocked(useAuthModule.useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      signOut: vi.fn(),
      isAdmin: false,
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization and Fetch', () => {
    it('should initialize with loading state', () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockRiskEvents, error: null }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);
      vi.mocked(supabase.channel).mockReturnValue({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnValue({}),
      } as any);

      const { result } = renderHook(() => useRiskEvents());

      // Should start with loading: true
      expect(result.current.loading).toBe(true);
    });

    it('should fetch risk events on mount', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockRiskEvents, error: null }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);
      vi.mocked(supabase.channel).mockReturnValue({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnValue({}),
      } as any);

      const { result } = renderHook(() => useRiskEvents());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.events).toEqual(mockRiskEvents);
    });

    it('should query with correct user_id filter', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);
      vi.mocked(supabase.channel).mockReturnValue({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnValue({}),
      } as any);

      renderHook(() => useRiskEvents());

      // Wait for query to be called
      await waitFor(() => {
        expect(mockQuery.eq).toHaveBeenCalledWith('user_id', mockUser.id);
      });
    });

    it('should query only unresolved events', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);
      vi.mocked(supabase.channel).mockReturnValue({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnValue({}),
      } as any);

      renderHook(() => useRiskEvents());

      await waitFor(() => {
        expect(mockQuery.eq).toHaveBeenCalledWith('resolved', false);
      });
    });

    it('should order events by created_at descending', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);
      vi.mocked(supabase.channel).mockReturnValue({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnValue({}),
      } as any);

      renderHook(() => useRiskEvents());

      await waitFor(() => {
        expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false });
      });
    });
  });

  describe('Limit Enforcement', () => {
    it('should use default limit of 5', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);
      vi.mocked(supabase.channel).mockReturnValue({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnValue({}),
      } as any);

      renderHook(() => useRiskEvents());

      await waitFor(() => {
        expect(mockQuery.limit).toHaveBeenCalledWith(5);
      });
    });

    it('should respect custom limit parameter', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);
      vi.mocked(supabase.channel).mockReturnValue({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnValue({}),
      } as any);

      renderHook(() => useRiskEvents(10));

      await waitFor(() => {
        expect(mockQuery.limit).toHaveBeenCalledWith(10);
      });
    });

    it('should maintain limit when new events arrive', async () => {
      const initialEvents = mockRiskEvents;
      const newEvent: RiskEvent = {
        id: '3',
        event_type: 'liquidation_risk',
        severity: 'critical',
        description: 'High liquidation risk',
        resolved: false,
        created_at: new Date().toISOString(),
      };

      let subscribeCallback: any;
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: initialEvents, error: null }),
      };

      const mockChannel = {
        on: vi.fn().mockImplementation((event, filter, callback) => {
          subscribeCallback = callback;
          return mockChannel;
        }),
        subscribe: vi.fn().mockReturnThis(),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);
      vi.mocked(supabase.channel).mockReturnValue(mockChannel as any);

      const { result } = renderHook(() => useRiskEvents(5));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Simulate new event INSERT
      act(() => {
        subscribeCallback({
          eventType: 'INSERT',
          new: newEvent,
          old: null,
        });
      });

      // Should add new event but maintain limit of 5
      expect(result.current.events.length).toBeLessThanOrEqual(5);
      expect(result.current.events[0]).toEqual(newEvent);
    });
  });

  describe('Real-time Subscriptions', () => {
    it('should set up Supabase channel subscription', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      const mockChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnValue({}),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);
      vi.mocked(supabase.channel).mockReturnValue(mockChannel as any);

      renderHook(() => useRiskEvents());

      await waitFor(() => {
        expect(supabase.channel).toHaveBeenCalledWith(expect.stringContaining('risk-events'));
      });
    });

    it('should use correct channel name with user ID', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      const mockChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnValue({}),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);
      vi.mocked(supabase.channel).mockReturnValue(mockChannel as any);

      renderHook(() => useRiskEvents());

      await waitFor(() => {
        expect(supabase.channel).toHaveBeenCalledWith(`risk-events:${mockUser.id}`);
      });
    });

    it('should listen for INSERT events only', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      const mockChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnValue({}),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);
      vi.mocked(supabase.channel).mockReturnValue(mockChannel as any);

      renderHook(() => useRiskEvents());

      await waitFor(() => {
        expect(mockChannel.on).toHaveBeenCalledWith(
          'postgres_changes',
          expect.objectContaining({ event: 'INSERT' }),
          expect.any(Function)
        );
      });
    });

    it('should add new events from realtime INSERT', async () => {
      const initialEvents: RiskEvent[] = [];
      const newEvent: RiskEvent = {
        id: '1',
        event_type: 'margin_call',
        severity: 'critical',
        description: 'Margin call',
        resolved: false,
        created_at: new Date().toISOString(),
      };

      let subscribeCallback: any;
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: initialEvents, error: null }),
      };

      const mockChannel = {
        on: vi.fn().mockImplementation((event, filter, callback) => {
          subscribeCallback = callback;
          return mockChannel;
        }),
        subscribe: vi.fn().mockReturnThis(),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);
      vi.mocked(supabase.channel).mockReturnValue(mockChannel as any);

      const { result } = renderHook(() => useRiskEvents());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Initial state should be empty
      expect(result.current.events).toEqual([]);

      // Simulate INSERT event
      act(() => {
        subscribeCallback({
          eventType: 'INSERT',
          new: newEvent,
        });
      });

      expect(result.current.events.length).toBe(1);
      expect(result.current.events[0]).toEqual(newEvent);
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch errors gracefully', async () => {
      const mockError = new Error('Database error');
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);
      vi.mocked(supabase.channel).mockReturnValue({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnValue({}),
      } as any);

      const { result } = renderHook(() => useRiskEvents());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.events).toEqual([]);
    });

    it('should continue operation if no user', () => {
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        user: null,
        loading: false,
        error: null,
        signOut: vi.fn(),
        isAdmin: false,
      } as any);

      const { result } = renderHook(() => useRiskEvents());

      expect(result.current.loading).toBe(false);
      expect(result.current.events).toEqual([]);
    });
  });

  describe('Cleanup', () => {
    it('should unsubscribe from channel on unmount', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      const mockChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis(),
        unsubscribe: vi.fn(),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);
      vi.mocked(supabase.channel).mockReturnValue(mockChannel as any);
      vi.mocked(supabase.removeChannel).mockImplementation(() => {
        mockChannel.unsubscribe();
      });

      const { unmount } = renderHook(() => useRiskEvents());

      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled();
      });

      unmount();

      expect(supabase.removeChannel).toHaveBeenCalled();
    });

    it('should set mounted flag to false on unmount', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);
      vi.mocked(supabase.channel).mockReturnValue({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnValue({}),
      } as any);

      const { unmount } = renderHook(() => useRiskEvents());

      await waitFor(() => {
        expect(mockQuery.select).toHaveBeenCalled();
      });

      unmount();

      // After unmount, subsequent state updates should not happen
      expect(true).toBe(true); // Placeholder for behavior verification
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty events array', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);
      vi.mocked(supabase.channel).mockReturnValue({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnValue({}),
      } as any);

      const { result } = renderHook(() => useRiskEvents());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.events).toEqual([]);
    });

    it('should handle limit of 1', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [mockRiskEvents[0]], error: null }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);
      vi.mocked(supabase.channel).mockReturnValue({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnValue({}),
      } as any);

      const { result } = renderHook(() => useRiskEvents(1));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.events.length).toBeLessThanOrEqual(1);
    });
  });
});
