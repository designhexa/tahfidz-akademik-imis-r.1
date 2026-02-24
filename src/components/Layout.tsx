import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { BottomNav } from "./BottomNav";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  const showBottomNav = isMobile;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {!isMobile && <AppSidebar />}

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-14 md:h-16 border-b border-border bg-card px-3 md:px-4 flex items-center justify-between sticky top-0 z-10">
            {!isMobile && <SidebarTrigger />}

            {isMobile && (
              <h1 className="text-lg font-bold text-primary">
                Mantaf IMIS
              </h1>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </header>

          {/* Main Content */}
          <main className={`flex-1 p-4 md:p-6 ${showBottomNav ? "pb-20" : ""}`}>
            {children}
          </main>
        </div>
      </div>

      {showBottomNav && <BottomNav />}
    </SidebarProvider>
  );
}