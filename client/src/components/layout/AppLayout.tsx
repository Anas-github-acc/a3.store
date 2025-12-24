import { Sidebar } from "./Sidebar";
import { GridBackground } from "../ui/GridBackground";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex w-full">
      <Sidebar />
      <GridBackground className="flex-1">
        <main className="h-screen px-4 py-6 lg:px-8 lg:py-8 overflow-auto">
          <div className="mx-auto max-w-6xl pt-12 lg:pt-0">
            {children}
          </div>
        </main>
      </GridBackground>
    </div>
  );
}
