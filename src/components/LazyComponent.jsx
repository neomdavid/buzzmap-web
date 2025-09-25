import React, { Suspense, useState, useEffect } from "react";

const LazyComponent = ({
  importFunc,
  fallback = <div className="loading loading-spinner loading-lg"></div>,
  maxRetries = 3,
  retryDelay = 1000,
}) => {
  const [Component, setComponent] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const loadComponent = async (retries = 0) => {
      try {
        const module = await importFunc();
        setComponent(() => module.default);
        setError(null);
      } catch (err) {
        console.error(
          `Failed to load component (attempt ${retries + 1}):`,
          err
        );

        if (retries < maxRetries) {
          setTimeout(() => {
            setRetryCount(retries + 1);
            loadComponent(retries + 1);
          }, retryDelay * (retries + 1)); // Exponential backoff
        } else {
          setError(err);
        }
      }
    };

    loadComponent();
  }, [importFunc, maxRetries, retryDelay]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-error mb-4">
            Failed to Load Component
          </h2>
          <p className="text-gray-600 mb-4">
            Unable to load the component after {maxRetries} attempts.
          </p>
          <button
            onClick={() => {
              setError(null);
              setRetryCount(0);
              setComponent(null);
            }}
            className="btn btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!Component) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="loading loading-spinner loading-lg mb-4"></div>
        {retryCount > 0 && (
          <p className="text-sm text-gray-500">
            Retrying... ({retryCount}/{maxRetries})
          </p>
        )}
      </div>
    );
  }

  return (
    <Suspense fallback={fallback}>
      <Component />
    </Suspense>
  );
};

export default LazyComponent;
