// Utility for retrying dynamic imports with exponential backoff
export const retryImport = (importFn, maxRetries = 3, baseDelay = 1000) => {
  return new Promise((resolve, reject) => {
    let retries = 0;
    
    const attemptImport = async () => {
      try {
        const module = await importFn();
        resolve(module);
      } catch (error) {
        retries++;
        
        if (retries <= maxRetries) {
          const delay = baseDelay * Math.pow(2, retries - 1); // Exponential backoff
          console.warn(`Import attempt ${retries} failed, retrying in ${delay}ms...`, error);
          
          setTimeout(attemptImport, delay);
        } else {
          console.error(`Import failed after ${maxRetries} retries:`, error);
          reject(error);
        }
      }
    };
    
    attemptImport();
  });
};

// Enhanced lazy loading with retry logic
export const createRetryLazy = (importFn, maxRetries = 3) => {
  return () => retryImport(importFn, maxRetries);
};

// Fallback component for failed imports
export const ImportErrorFallback = ({ error, retry }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
      <h2 className="text-xl font-semibold text-red-800 mb-2">
        Failed to Load Component
      </h2>
      <p className="text-red-600 mb-4">
        There was a problem loading this page. This might be due to a network issue.
      </p>
      <div className="space-y-2">
        <button
          onClick={retry}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.reload()}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors ml-2"
        >
          Refresh Page
        </button>
      </div>
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-sm text-red-500">
            Technical Details
          </summary>
          <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
            {error?.toString()}
          </pre>
        </details>
      )}
    </div>
  </div>
);
