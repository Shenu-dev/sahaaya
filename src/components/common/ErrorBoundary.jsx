import React from 'react';
import { AlertCircle, RefreshCw, RotateCcw } from 'lucide-react';

/**
 * Top-Level React Error Boundary
 * Prevents application crashes from causing a blank screen ("white screen of death").
 * Displays an accessible, senior-friendly recovery card with 1-click reload and reset options.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('Sahaaya Unhandled Component Error Caught:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // Ignore storage errors
    }
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F5F5F9] flex items-center justify-center p-4 font-sans text-slate-900">
          <div className="max-w-lg w-full bg-white rounded-[32px] p-8 sm:p-10 border border-slate-200/90 shadow-card text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-red-100 border border-red-200 flex items-center justify-center text-red-600 mx-auto shadow-subtle">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3.5 py-1 rounded-full bg-red-50 text-red-800 text-xs font-black uppercase tracking-wider border border-red-200">
                Application Recovery
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                Something interrupted Sahaaya
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                We've safely isolated your Care Circle session. Your medical records and doses remain securely protected.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-slate-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-all shadow-sm active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>
              <button
                onClick={this.handleResetStorage}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-wider border border-slate-300 transition-all shadow-2xs active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Session</span>
              </button>
            </div>

            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <details className="mt-4 text-left p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-red-700 overflow-x-auto">
                <summary className="cursor-pointer font-bold select-none text-slate-600 mb-1">Technical Diagnostics</summary>
                <p>{this.state.error.toString()}</p>
                {this.state.errorInfo?.componentStack && (
                  <pre className="mt-2 text-[10px] text-slate-500 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
