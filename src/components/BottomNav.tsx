import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, BookOpen, FileText, User, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

// Menu utama untuk bottom nav (4 item + more)
const mainNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Setoran", url: "/setoran", icon: BookOpen },
  { title: "Laporan", url: "/laporan", icon: FileText },
  { title: "Profil", url: "/profil", icon: User },
];

// Menu tambahan di sheet "More"
const moreNavItems = [
  { title: "Ujian Tasmi'", url: "/ujian-tasmi" },
  { title: "Ujian Tahfidz", url: "/ujian-tahfidz" },
  { title: "Rapor Tahfidz", url: "/rapor" },
  { title: "Tilawah", url: "/tilawah/dashboard" },
  { title: "Pengaturan", url: "/pengaturan" },
];

export function BottomNav() {
  const location = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const isMoreActive = moreNavItems.some((item) => location.pathname.startsWith(item.url));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {mainNavItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            className={cn(
              "flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-lg transition-colors",
              isActive(item.url)
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.title}</span>
          </NavLink>
        ))}

        {/* More Button */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-lg transition-colors",
                isMoreActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <MoreHorizontal className="w-5 h-5" />
              <span className="text-[10px] font-medium">Lainnya</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto max-h-[70vh] rounded-t-2xl">
            <SheetHeader>
              <SheetTitle>Menu Lainnya</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-3 gap-3 py-4">
              {moreNavItems.map((item) => (
                <NavLink
                  key={item.url}
                  to={item.url}
                  onClick={() => setSheetOpen(false)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-colors",
                    location.pathname.startsWith(item.url)
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted"
                  )}
                >
                  <span className="text-sm font-medium text-center">{item.title}</span>
                </NavLink>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
