import React, { Component, ErrorInfo, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Home, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  children: ReactNode;
  locationKey?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundaryClass extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught runtime error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public componentDidUpdate(prevProps: Props) {
    // Automatically reset error state when user navigates to a new page or goes back
    if (this.state.hasError && prevProps.locationKey !== this.props.locationKey) {
      this.resetError();
    }
  }

  public resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorFallbackContent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

// React Router location-aware wrapper component
export default function ErrorBoundary({ children }: { children: ReactNode }) {
  const location = useLocation();
  return (
    <ErrorBoundaryClass locationKey={location.key || location.pathname}>
      {children}
    </ErrorBoundaryClass>
  );
}

interface FallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
}

function ErrorFallbackContent({ error, errorInfo, onReset }: FallbackProps) {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = React.useState(false);

  const handleGoBack = () => {
    onReset();
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleGoHome = () => {
    onReset();
    navigate("/");
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4 sm:p-8 text-left">
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-10 max-w-lg w-full shadow-2xl space-y-6 text-center">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-md">
          <AlertTriangle size={32} />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 px-3 py-1 rounded-full">
            Page Issue Encountered
          </span>
          <h2 className="text-2xl font-heading font-extrabold text-dark">
            Something Went Wrong On This Page
          </h2>
          <p className="text-gray-500 text-xs leading-relaxed max-w-sm mx-auto">
            Don't worry! You can go back to your previous page without losing your data or needing to refresh your browser.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={handleGoBack}
            className="w-full bg-primary hover:bg-[#0b327b] text-white font-bold py-3.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          >
            <ArrowLeft size={16} />
            <span>Go Back to Previous Page</span>
          </button>

          <button
            type="button"
            onClick={handleGoHome}
            className="w-full bg-gray-100 hover:bg-gray-200 text-dark font-bold py-3.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Home size={16} />
            <span>Return to Home</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="text-xs font-bold text-gray-500 hover:text-dark flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer pt-1"
        >
          <RefreshCw size={14} />
          <span>Try Reloading This Component</span>
        </button>

        {/* Technical Error Details (Expandable for debugging) */}
        {error && (
          <div className="pt-4 border-t border-gray-100 text-left">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="text-[11px] font-bold text-gray-400 hover:text-gray-600 flex items-center justify-between w-full cursor-pointer"
            >
              <span>Technical Diagnostics</span>
              {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showDetails && (
              <div className="mt-2 bg-gray-900 text-rose-300 p-3.5 rounded-2xl text-[10px] font-mono overflow-x-auto max-h-40 border border-gray-800 space-y-1">
                <p className="font-bold text-white">{error.toString()}</p>
                {errorInfo?.componentStack && (
                  <pre className="text-gray-400 text-[9px] leading-tight overflow-x-auto">
                    {errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
