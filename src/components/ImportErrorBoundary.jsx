import React from 'react';
import { ImportErrorFallback } from '../utils/retryImport';

class ImportErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error) {
    // Check if it's a dynamic import error
    if (error?.message?.includes('Failed to fetch dynamically imported module')) {
      return { hasError: true, error, isImportError: true };
    }
    return { hasError: true, error, isImportError: false };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ImportErrorBoundary caught an error:', error, errorInfo);
    
    // Log to error reporting service if available
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      });
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      retryCount: prevState.retryCount + 1
    }));
    
    // Force a page refresh if retry count is too high
    if (this.state.retryCount >= 2) {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.state.isImportError) {
        return (
          <ImportErrorFallback 
            error={this.state.error} 
            retry={this.handleRetry}
          />
        );
      }
      
      // Generic error fallback
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Something went wrong
            </h2>
            <p className="text-red-600 mb-4">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ImportErrorBoundary;
