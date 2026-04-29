import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { GameCatalog } from "./components/GameCatalog";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fbf8ff] text-[#1b1b21]">
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#dbd9e1] bg-white/95 px-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="grid size-8 place-items-center rounded-lg border border-[#c6c5d3] bg-[#f5f2fa] text-sm font-bold text-primary">
            GC
          </div>
          <h2 className="text-base font-semibold tracking-normal text-[#1b1b21]">Game Catalog</h2>
        </div>
        <Authenticated>
          <SignOutButton />
        </Authenticated>
      </header>
      <main className="flex-1">
        <Content />
      </main>
      <footer className="border-t border-[#dbd9e1] bg-white/80 px-4 py-3 text-xs text-[#454651]">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between">
        <span>© {new Date().getFullYear()} Game Catalog</span>
        <span>v{__APP_VERSION__}</span>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <Authenticated>
        <GameCatalog />
      </Authenticated>

      <Unauthenticated>
        <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-5xl flex-col items-center justify-center gap-8 px-4">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold text-[#1b1b21]">Game Catalog</h1>
            <p className="mb-8 text-xl text-[#454651]">
              Track and organize your personal game collection
            </p>
          </div>
          <div className="w-full max-w-md">
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>
    </div>
  );
}
