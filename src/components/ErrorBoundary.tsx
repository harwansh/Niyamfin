"use client";

import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    // Intentionally not logged externally — privacy-first design
    void error;
    void info;
  }

  override render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            role="alert"
            className="rounded-2xl border border-clay/40 bg-[#f7e4df]/60 px-6 py-8 text-center"
          >
            <div className="text-2xl">⚠</div>
            <h3 className="mt-2 font-display text-lg font-600 text-clay">Something went wrong</h3>
            <p className="mt-1 text-sm text-sage-700">
              A calculation error occurred. Please check your inputs and try again.
            </p>
            {this.state.message && (
              <p className="mt-2 rounded bg-white/60 px-3 py-1.5 text-xs font-mono text-sage-600">
                {this.state.message}
              </p>
            )}
            <button
              onClick={() => this.setState({ hasError: false, message: "" })}
              className="mt-4 rounded-xl bg-sage-900 px-5 py-2 text-sm font-semibold text-paper transition hover:bg-sage-700"
            >
              Try again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
