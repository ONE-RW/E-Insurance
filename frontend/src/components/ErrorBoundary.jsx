import { Component } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Kept as a console log (not swallowed) so real render errors are still visible to
    // developers, while the user only ever sees the friendly screen below.
    console.error("ErrorBoundary caught a render error:", error, info);
  }

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-navy-900 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-navy-900">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-navy-900">Something went wrong</h1>
            <p className="mt-2 text-sm text-gray-500">
              Please refresh the page. If the problem continues, contact your system administrator.
            </p>
            <button
              type="button"
              onClick={this.handleRefresh}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-navy-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
