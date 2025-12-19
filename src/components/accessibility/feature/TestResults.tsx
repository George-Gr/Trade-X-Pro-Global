import type { TestResult } from '../types';

export interface TestResultsProps {
  testResults: TestResult[];
  onClearResults: () => void;
}

/**
 * TestResults Component
 *
 * Displays test results from accessibility tests.
 */
export function TestResults({ testResults, onClearResults }: TestResultsProps) {
  const renderData = (d: unknown) => {
    try {
      if (d === null || d === undefined) return String(d);
      if (typeof d === 'string') return d;
      return JSON.stringify(d, null, 2);
    } catch {
      return String(d);
    }
  };

  return (
    <div className="bg-card rounded-lg p-6 border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Test Results</h3>
        <button
          onClick={onClearResults}
          className="px-3 py-2 bg-gray-500 text-white rounded-lg text-sm"
        >
          Clear Results
        </button>
      </div>

      <div className="space-y-3">
        {testResults.length === 0 ? (
          <p className="text-muted-foreground">
            No test results yet. Run tests to see results here.
          </p>
        ) : (
          testResults.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                result.type === 'aria_label'
                  ? result.passed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">
                    {result.type.replace('_', ' ').toUpperCase()}
                  </h4>
                  {result.type === 'aria_label' ? (
                    <div className="text-sm text-muted-foreground mt-1">
                      <p>Element: {result.element}</p>
                      <p>Expected: "{result.expected}"</p>
                      <p>Actual: "{result.actual}"</p>
                      <p>{result.passed ? '✓ PASSED' : '✗ FAILED'}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">
                      {result.message}
                    </p>
                  )}
                  {result.data ? (
                    <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                      {renderData(result.data)}
                    </pre>
                  ) : null}
                </div>
                <span className="text-xs text-muted-foreground">
                  {result.timestamp}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TestResults;
