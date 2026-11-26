import { AlertTriangle } from "lucide-react";
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
        <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-danger-soft text-danger">
            <AlertTriangle className="size-6" />
          </div>
          <h1 className="text-lg font-semibold text-ink">
            Something went wrong
          </h1>
          <p className="mt-1.5 text-sm text-ink-secondary">
            {this.state.message}
          </p>
          <Button
            variant="primary"
            className="mt-5"
            onClick={() => window.location.reload()}
          >
            Reload app
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
