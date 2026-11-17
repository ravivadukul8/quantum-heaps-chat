import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Unhandled React Error in Component Tree:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-screen w-full flex items-center justify-center p-6 bg-gray-50 dark:bg-[#0c1317] text-gray-900 dark:text-gray-100"
        >
          <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#182229] border border-gray-200 dark:border-gray-800 shadow-2xl text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertOctagon className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                Something went wrong
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                An unexpected application error occurred. We have captured the incident details.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 rounded-xl bg-gray-100 dark:bg-[#111b21] border border-gray-200 dark:border-gray-800 text-left">
                <p className="text-[11px] font-mono text-rose-600 dark:text-rose-400 break-words line-clamp-3">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-md active:scale-98 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
