import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  UserCheck,
  FileText,
  ClipboardCheck,
  Users,
  BookMarked,
  GraduationCap,
  UserCog,
  Megaphone,
  Settings,
  LogOut,
  Award,
  FileSpreadsheet,
  School,
  BookOpenCheck,
  Import,
  User,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const tahfidzItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Setoran Hafalan", url: "/setoran", icon: BookOpen },
  { title: "Laporan Hafalan", url: "/laporan", icon: FileText },
  { title: "Ujian Tasmi'", url: "/ujian-tasmi", icon: Award },
  { title: "Ujian Tahfidz", url: "/ujian-tahfidz", icon: GraduationCap },
  { title: "Rapor Tahfidz", url: "/rapor", icon: FileSpreadsheet },
];

const tilawahItems = [
  { title: "Dashboard", url: "/tilawah/dashboard", icon: LayoutDashboard },
  { title: "Absensi/Setoran Tilawah", url: "/tilawah/absensi", icon: BookOpenCheck },
  { title: "Laporan Tilawah", url: "/tilawah/laporan", icon: FileText },
  { title: "Ujian Tilawah Semester", url: "/tilawah/ujian", icon: Award },
  { title: "Rapor Tilawah", url: "/tilawah/rapor", icon: FileSpreadsheet },
];

const raporAkademikItems = [
  { title: "Dashboard", url: "/akademik/dashboard", icon: LayoutDashboard },
  { title: "Impor Data Nilai", url: "/akademik/impor", icon: Import },
  { title: "Rapor Akademik", url: "/akademik/rapor", icon: FileSpreadsheet },
];

const masterDataItems = [
  { title: "Data Santri", url: "/santri", icon: Users },
  { title: "Data Halaqoh", url: "/halaqoh", icon: BookMarked },
  { title: "Data Kelas", url: "/kelas", icon: School },
  { title: "Data Ustadz", url: "/ustadz", icon: GraduationCap },
  { title: "Akun Pengguna", url: "/users", icon: UserCog },
  { title: "Pengumuman", url: "/pengumuman", icon: Megaphone },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Gagal logout");
    } else {
      toast.success("Berhasil logout");
      navigate("/auth");
    }
  };

    const SidebarDropdown = ({
      label,
      icon: Icon,
      items,
    }: {
      label: string;
      icon: any;
      items: any[];
    }) => {
      const location = useLocation();
      const [open, setOpen] = useState(
        items.some((i) => location.pathname.startsWith(i.url))
      );

      return (
        <SidebarMenu>
          {/* Parent */}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => setOpen(!open)}>
              <Icon className="w-4 h-4" />
              <span className="flex-1">{label}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Children */}
          {open &&
            items.map((item) => (
              <SidebarMenuItem key={item.url} className="ml-6">
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.url}
                >
                  <NavLink to={item.url}>
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
        </SidebarMenu>
      );
    };

  return (
    <Sidebar className="border-r border-border bg-card">
      <SidebarContent>
        {/* Header */}
         <div className="p-4 bg-[#015504] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            {open && (
              <div>
                <h2 className="font-bold text-lg text-white">Mantaf IMIS</h2>
                <p className="text-xs text-white/80">Manajemen Tahfidz</p>
              </div>
            )}
          </div>
        </div>

        {/* Tahfidz Menu */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarDropdown
              label="Tahfidz"
              icon={BookOpen}
              items={tahfidzItems}
            />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tilawah Menu */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarDropdown
              label="Tilawah"
              icon={BookOpenCheck}
              items={tilawahItems}
            />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Rapor Akademik Menu */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarDropdown
              label="Akademik"
              icon={GraduationCap}
              items={raporAkademikItems}
            />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Master Data */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarDropdown
              label="Master Data"
              icon={Users}
              items={masterDataItems}
            />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Profil & Pengaturan */}
        <SidebarGroup>
          <SidebarGroupLabel>Profil & Pengaturan</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/profil")}>
                  <NavLink to="/profil">
                    <User className="w-4 h-4" />
                    <span>Profil Saya</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/pengaturan")}>
                  <NavLink to="/pengaturan">
                    <Settings className="w-4 h-4" />
                    <span>Pengaturan</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                  <span>Keluar</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
