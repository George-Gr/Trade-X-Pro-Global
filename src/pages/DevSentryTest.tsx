import React from 'react';
import { logger } from '@/lib/logger';
import * as Sentry from '@sentry/react';

const DevSentryTest: React.FC = () => {
  const throwError = () => {
    // This will be caught by ErrorBoundary and also reported to Sentry in production
    throw new Error('Sentry test error (throw) - DevSentryTest');
  };

  const logError = () => {
    const err = new Error('Sentry test error (logger) - DevSentryTest');
    logger.error('Manual error capture from DevSentryTest', err, { action: 'dev_sentry_test', component: 'DevSentryTest' });
    alert('logger.error called. Check console (dev) or Sentry (prod)');
  };

  const sendMessage = () => {
    logger.info('Sending test message to Sentry via logger', { action: 'dev_sentry_test', component: 'DevSentryTest' });
    if ((import.meta as any).env.PROD && (import.meta as any).env.VITE_SENTRY_DSN) {
      Sentry.captureMessage('Test message from DevSentryTest');
      alert('Sentry.captureMessage called (production mode)');
    } else {
      alert('Sentry not active (ensure VITE_SENTRY_DSN and production mode)');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Sentry / Logger Test (Dev)</h1>
      <p className="mb-4">Use these buttons to test logging and Sentry integration.</p>
      <div className="space-x-4">
        <button onClick={throwError} className="px-4 py-2 bg-red-500 text-white rounded">Throw Error</button>
        <button onClick={logError} className="px-4 py-2 bg-yellow-500 text-black rounded">Log Error via logger</button>
        <button onClick={sendMessage} className="px-4 py-2 bg-blue-500 text-white rounded">Send Sentry Message</button>
      </div>
    </div>
  );
};

export default DevSentryTest;
