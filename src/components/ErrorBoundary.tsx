import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f5f5f0] flex flex-col items-center justify-center p-4 font-sans">
          <div className="bg-white p-10 rounded-3xl border border-editorial max-w-md w-full text-center">
            <h2 className="text-3xl font-serif text-[#1c1c1a] mb-4">Algo deu errado</h2>
            <p className="text-[#1c1c1a]/60 font-light mb-8">
              Ocorreu um erro inesperado. Por favor, tente recarregar a página.
            </p>
            <pre className="bg-[#f5f5f0] p-4 rounded-xl text-xs text-[#1c1c1a]/60 overflow-auto max-h-40 mb-8 text-left font-mono border border-editorial">
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[#1c1c1a] text-[#f5f5f0] py-3 rounded-full font-sans text-xs uppercase tracking-widest hover:bg-[#1c1c1a]/90 transition-colors"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
