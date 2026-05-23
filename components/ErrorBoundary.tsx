import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-2xl border border-red-100 text-center">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-igo-dark uppercase tracking-tighter mb-2">System Interrupted</h1>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              We encountered a technical error while rendering the dashboard. 
              <br/>
              <span className="text-red-500 font-mono text-[10px] mt-2 block bg-red-50 p-2 rounded-lg">
                {this.state.error?.message}
              </span>
            </p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = '/admin';
              }}
              className="w-full py-4 bg-igo-dark text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-igo-lime hover:text-igo-dark transition-all"
            >
              Reset Session & Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
