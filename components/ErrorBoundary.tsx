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
    // Full technical detail stays in the console/dev tools only — never shown to the visitor.
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleRecover = () => {
    // Context-aware recovery: send admins back to the admin login, and
    // everyone else back to the public homepage. Never wipe the whole
    // localStorage (that would silently drop the visitor's cart/wishlist/
    // session) — just reload to the safe landing page.
    const onAdminRoute = window.location.pathname.startsWith('/admin');
    window.location.href = onAdminRoute ? '/admin-login' : '/';
  };

  public render() {
    if (this.state.hasError) {
      const onAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-2xl border border-red-100 text-center">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-igo-dark uppercase tracking-tighter mb-2">Something Went Wrong</h1>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              We hit an unexpected error loading this page. It has been logged — please try again, and contact us if it keeps happening.
            </p>
            <button
              onClick={this.handleRecover}
              className="w-full py-4 bg-igo-dark text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-igo-lime hover:text-igo-dark transition-all"
            >
              {onAdminRoute ? 'Return to Admin Login' : 'Return to Homepage'}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
