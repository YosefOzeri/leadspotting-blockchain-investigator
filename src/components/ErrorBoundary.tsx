'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  errorMessage: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('Caught by ErrorBoundary:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: null });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center bg-slate-900 text-white p-6 rounded-lg">
          <h2 className="text-xl mb-2">Error Loading Data</h2>
          <p className="text-sm opacity-80 mb-4">{this.state.errorMessage}</p>
          <button onClick={this.handleRetry} className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 transition">
            נסה שוב
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
