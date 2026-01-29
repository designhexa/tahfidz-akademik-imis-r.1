import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import SetoranHafalan from "./pages/SetoranHafalan";
import LaporanHafalan from "./pages/LaporanHafalan";
import UjianTasmi from "./pages/UjianTasmi";
import UjianTahfidz from "./pages/UjianTahfidz";
import RaporSemester from "./pages/RaporSemester";
import DataSantri from "./pages/DataSantri";
import DataHalaqoh from "./pages/DataHalaqoh";
import DataKelas from "./pages/DataKelas";
import DataUstadz from "./pages/DataUstadz";
import DataUsers from "./pages/DataUsers";
import PengumumanPage from "./pages/Pengumuman";
import NotFound from "./pages/NotFound";
// Tilawah pages
import TilawahDashboard from "./pages/TilawahDashboard";
import TilawahAbsensi from "./pages/TilawahAbsensi";
import TilawahLaporan from "./pages/TilawahLaporan";
import TilawahUjian from "./pages/TilawahUjian";
import TilawahRapor from "./pages/TilawahRapor";
// Akademik pages
import AkademikDashboard from "./pages/AkademikDashboard";
import AkademikImpor from "./pages/AkademikImpor";
import AkademikRapor from "./pages/AkademikRapor";
// Profil & Pengaturan
import Profil from "./pages/Profil";
import Pengaturan from "./pages/Pengaturan";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/setoran" element={<SetoranHafalan />} />
            <Route path="/laporan" element={<LaporanHafalan />} />
            <Route path="/ujian-tasmi" element={<UjianTasmi />} />
            <Route path="/ujian-tahfidz" element={<UjianTahfidz />} />
            <Route path="/rapor" element={<RaporSemester />} />
            <Route path="/santri" element={<DataSantri />} />
            <Route path="/halaqoh" element={<DataHalaqoh />} />
            <Route path="/kelas" element={<DataKelas />} />
            <Route path="/ustadz" element={<DataUstadz />} />
            <Route path="/users" element={<DataUsers />} />
            <Route path="/pengumuman" element={<PengumumanPage />} />
            {/* Tilawah Routes */}
            <Route path="/tilawah/dashboard" element={<TilawahDashboard />} />
            <Route path="/tilawah/absensi" element={<TilawahAbsensi />} />
            <Route path="/tilawah/laporan" element={<TilawahLaporan />} />
            <Route path="/tilawah/ujian" element={<TilawahUjian />} />
            <Route path="/tilawah/rapor" element={<TilawahRapor />} />
            {/* Akademik Routes */}
            <Route path="/akademik/dashboard" element={<AkademikDashboard />} />
            <Route path="/akademik/impor" element={<AkademikImpor />} />
            <Route path="/akademik/rapor" element={<AkademikRapor />} />
            {/* Profil & Pengaturan */}
            <Route path="/profil" element={<Profil />} />
            <Route path="/pengaturan" element={<Pengaturan />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
