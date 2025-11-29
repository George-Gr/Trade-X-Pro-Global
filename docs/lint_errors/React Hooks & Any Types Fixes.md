/**
 * REACT HOOKS DEPENDENCY FIXES
 */

// ============================================
// PwaUpdateNotification.tsx - Line 86
// Issue: Missing 'handleUpdate' dependency
// ============================================

// ❌ BEFORE:
useEffect(() => {
  if (needsUpdate) {
    handleUpdate();
  }
}, [`needsUpdate`]); // Missing handleUpdate dependency

// ✅ FIX 1: Add to dependencies (if handleUpdate is stable)
useEffect(() => {
  if (needsUpdate) {
    handleUpdate();
  }
}, [`needsUpdate`, `handleUpdate`]); // All dependencies listed

// ✅ FIX 2: Wrap handleUpdate in useCallback (preferred)
const handleUpdate = useCallback(() => {
  // implementation
}, [/* `handleUpdate`'s dependencies */]);

useEffect(() => {
  if (needsUpdate) {
    handleUpdate();
  }
}, [`needsUpdate`, `handleUpdate`]);

// ============================================
// PwaUpdateNotification.tsx - Line 133
// Issue: Missing 'toast' dependency
// ============================================

// ❌ BEFORE:
const handleNotification = useCallback(() => {
  toast({
    title: "Update available",
    description: "Click to reload"
  });
}, []); // Missing `toast`

// ✅ FIX 1: Add toast to dependencies
const handleNotification = useCallback(() => {
  toast({
    title: "Update available",
    description: "Click to reload"
  });
}, [toast]);

// ✅ FIX 2: If toast is from a context/hook that's stable, disable the rule
const handleNotification = useCallback(() => {
  toast({
    title: "Update available",
    description: "Click to reload"
  });
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // toast is stable from useToast()

// ============================================
// TradingViewWatchlist.tsx - Line 181
// Issue: containerRef.current in cleanup function
// ============================================

// ❌ BEFORE:
useEffect(() => {
  const observer = new IntersectionObserver(callback);
  if (containerRef.current) {
    observer.observe(containerRef.current);
  }
  
  return () => {
    if (containerRef.current) { // ⚠️ May be stale
      observer.unobserve(containerRef.current);
    }
  };
}, []);

// ✅ FIX: Capture ref value in effect
useEffect(() => {
  const container = containerRef.current; // Capture current value
  const observer = new IntersectionObserver(callback);
  
  if (container) {
    observer.observe(container);
  }
  
  return () => {
    if (container) { // Use captured value
      observer.unobserve(container);
    }
  };
}, []);

/**
 * COMMON ANY TYPE REPLACEMENTS
 */

// ============================================
// 1. EVENT HANDLERS
// ============================================

// ❌ BEFORE:
const handleClick = (e: any) => { };
const handleChange = (e: any) => { };
const handleSubmit = (e: any) => { };

// ✅ AFTER:
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => { };
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { };
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => { };

// ============================================
// 2. API RESPONSES
// ============================================

// ❌ BEFORE:
const fetchData = async (): Promise<any> => {
  const response = await fetch('/api/data');
  return response.json();
};

// ✅ AFTER:
interface ApiResponse {
  id: string;
  name: string;
  value: number;
}

const fetchData = async (): Promise<ApiResponse> => {
  const response = await fetch('/api/data');
  return response.json();
};

// For unknown API shapes:
const fetchData = async (): Promise<unknown> => {
  const response = await fetch('/api/data');
  const data: unknown = await response.json();
  
  // Type guard
  if (isValidApiResponse(data)) {
    return data;
  }
  throw new Error('Invalid response');
};

function isValidApiResponse(data: unknown): data is ApiResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    typeof (data as any).id === 'string'
  );
}

// ============================================
// 3. GENERIC FUNCTIONS
// ============================================

// ❌ BEFORE:
function debounce(fn: any, delay: number): any {
  let timeout: any;
  return function (...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

// ✅ AFTER:
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  return function (...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

// ============================================
// 4. COMPONENT PROPS
// ============================================

// ❌ BEFORE:
interface ComponentProps {
  data: any;
  onChange: (value: any) => void;
  children: any;
}

// ✅ AFTER:
interface DataItem {
  id: string;
  value: number;
}

interface ComponentProps {
  data: DataItem[];
  onChange: (value: DataItem) => void;
  children: React.ReactNode;
}

// ============================================
// 5. REFS
// ============================================

// ❌ BEFORE:
const ref = useRef<any>(null);
const intervalRef = useRef<any>();

// ✅ AFTER:
const ref = useRef<HTMLDivElement>(null);
const intervalRef = useRef<ReturnType<typeof setInterval>>();

// ============================================
// 6. ERROR HANDLING
// ============================================

// ❌ BEFORE:
try {
  // code
} catch (error: any) {
  console.error(error.message);
}

// ✅ AFTER:
try {
  // code
} catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error('Unknown error:', error);
  }
}

// Or with type guard:
function isError(error: unknown): error is Error {
  return error instanceof Error;
}

try {
  // code
} catch (error: unknown) {
  if (isError(error)) {
    console.error(error.message);
  }
}

// ============================================
// 7. WORKER MESSAGES
// ============================================

// ❌ BEFORE:
self.onmessage = (e: any) => {
  const { type, payload } = e.data;
};

// ✅ AFTER:
interface WorkerMessage {
  type: 'calculate' | 'update' | 'stop';
  payload: {
    data: number[];
    config: ChartConfig;
  };
}

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { type, payload } = e.data;
  // Now type-safe!
};

// ============================================
// 8. TEST MOCKS
// ============================================

// ❌ BEFORE:
const mockFunction = vi.fn() as any;
const mockData: any = { id: 1 };

// ✅ AFTER:
const mockFunction = vi.fn<[`string`, `number`], boolean>();
// or
const mockFunction = vi.fn() as jest.MockedFunction<typeof realFunction>;

interface MockData {
  id: number;
  name?: string;
}
const mockData: MockData = { id: 1 };

// ============================================
// 9. RECORD/MAP TYPES
// ============================================

// ❌ BEFORE:
const cache: any = {};
const handlers: any = {
  click: () => {},
  hover: () => {}
};

// ✅ AFTER:
const cache: Record<string, CachedItem> = {};
const handlers: Record<'click' | 'hover', () => void> = {
  click: () => {},
  hover: () => {}
};

// ============================================
// 10. SUPABASE QUERIES
// ============================================

// ❌ BEFORE:
const { data, error }: any = await supabase
  .from('positions')
  .select('*');

// ✅ AFTER:
import { Database } from '@/types/supabase';

type Position = Database['public'][`Tables`]['positions']['Row'];

const { data, error } = await supabase
  .from('positions')
  .select('*')
  .returns<Position[]>();

// or with proper typing:
const { data, error }: {
  data: Position[] | null;
  error: PostgrestError | null;
} = await supabase
  .from('positions')
  .select('*');

// ============================================
// BATCH REPLACEMENT SCRIPT
// ============================================

/**
 * Use this Node script to automate some replacements:
 * WARNING: Review changes carefully before committing!
 */

/*
const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, patterns) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  patterns.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

const patterns = [
  // Simple event handlers
  {
    pattern: /\(e: any\) => \{/g,
    replacement: '(e: React.MouseEvent) => {'
  },
  // Catch blocks
  {
    pattern: /catch \(error: any\)/g,
    replacement: 'catch (error: unknown)'
  }
];

// Apply to all .tsx files
// Use with caution and review all changes!
*/

/**
 * PRIORITY ORDER FOR FIXING:
 * 
 * 1. Test files (lowest risk): src/**/__tests__/**
 * 2. Utility functions: src/lib/**, src/hooks/**
 * 3. Components: src/components/**
 * 4. Edge functions: supabase/functions/**
 * 5. Workers: src/workers/**
 */