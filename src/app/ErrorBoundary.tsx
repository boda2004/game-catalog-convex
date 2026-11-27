import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || "An unexpected error occurred.",
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled UI error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
          <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface p-8 text-center shadow-xl">
            <div className="mx-auto mb-4 flex size-13 items-center justify-center rounded-2xl bg-danger-soft text-danger ring-1 ring-inset ring-danger/30">
              <AlertTriangle className="size-6" />
            </div>
            <h1 className="font-display text-xl font-bold text-ink">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-ink-secondary">
              {this.state.message}
            </p>
            <Button
              variant="primary"
              className="mt-6 w-full"
              onClick={() => window.location.reload()}
            >
              <RotateCcw className="size-4" />
              Reload app
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
