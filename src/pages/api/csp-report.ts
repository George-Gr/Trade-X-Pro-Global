/**
 * CSP Violation Reporting Endpoint
 *
 * This endpoint receives Content Security Policy violation reports
 * from browsers and logs them for security monitoring and analysis.
 *
 * Reports are sent via POST requests with JSON payload containing
 * violation details including blocked URI, violated directive, etc.
 */

import { logger } from '@/lib/logger';

/**
 * CSP Violation Report Interface
 * Matches the standard CSP violation report format
 */
interface CSPViolationReport {
  'csp-report': {
    'document-uri': string;
    referrer: string;
    'violated-directive': string;
    'effective-directive': string;
    'original-policy': string;
    'blocked-uri': string;
    'source-file': string;
    'line-number': number;
    'column-number': number;
    'status-code': number;
    'script-sample': string;
  };
}

/**
 * CSP Violation Handler
 *
 * Processes CSP violation reports and logs them for security monitoring.
 * In production, these reports should be sent to a security monitoring service.
 */
export default async function handler(req: Request) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Method not allowed',
        timestamp: new Date().toISOString(),
      }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Parse the CSP violation report
    const report: CSPViolationReport = await req.json();

    if (!report || !report['csp-report']) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Invalid CSP violation report format',
          timestamp: new Date().toISOString(),
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const violation = report['csp-report'];

    // Log the violation with structured data
    const violationData = {
      type: 'CSP_VIOLATION',
      timestamp: new Date().toISOString(),
      documentUri: violation['document-uri'],
      referrer: violation.referrer,
      violatedDirective: violation['violated-directive'],
      effectiveDirective: violation['effective-directive'],
      originalPolicy: violation['original-policy'],
      blockedUri: violation['blocked-uri'],
      sourceFile: violation['source-file'],
      lineNumber: violation['line-number'],
      columnNumber: violation['column-number'],
      statusCode: violation['status-code'],
      scriptSample: violation['script-sample'],
      userAgent: req.headers.get('user-agent'),
      clientIP: req.headers.get('x-forwarded-for') || 'unknown',
    };

    // Log the violation
    logger.warn('CSP Violation Detected', violationData);

    // In production, send to security monitoring service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to security monitoring service (e.g., Datadog, Splunk, custom SIEM)
      // await sendToSecurityMonitoring();
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'CSP violation report received',
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    // Log error
    logger.error(
      'Error processing CSP violation report:',
      error instanceof Error ? error.message : String(error)
    );

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
