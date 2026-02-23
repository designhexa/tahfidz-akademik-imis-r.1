import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Download, 
  BookOpen, 
  BookMarked,
  Home,
  RefreshCw,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { getSurahsByJuz, Surah } from "@/lib/quran-data";
import { cn } from "@/lib/utils";
import TambahSetoran from "@/pages/TambahSetoran";

// Jenis setoran (without drill)
type FormTab = "setoran_baru" | "murojaah" | "tilawah" | "tilawah_rumah";

const jenisSetoranOptions = [
  { value: "setoran_baru", label: "Setoran Baru", icon: BookOpen, description: "Hafalan ayat/halaman baru" },
  { value: "murojaah", label: "Murojaah", icon: RefreshCw, description: "Mengulang hafalan lama" },
  { value: "tilawah", label: "Tilawah", icon: BookMarked, description: "Membaca Al-Quran di kelas" },
  { value: "tilawah_rumah", label: "Murojaah di Rumah", icon: Home, description: "Membaca Al-Quran di rumah" },
];

// Mock data
const mockSantri = [
  { id: "1", nama: "Muhammad Faiz", nis: "S001", halaqoh: "Halaqoh Al-Azhary" },
  { id: "2", nama: "Fatimah Zahra", nis: "S003", halaqoh: "Halaqoh Al-Furqon" },
  { id: "3", nama: "Aisyah Nur", nis: "S002", halaqoh: "Halaqoh Al-Azhary" },
];

// Mock setoran list (without drill entries)
const mockSetoranList = [
  { id: 1, tanggal: "15/01/2025", santri: "Muhammad Faiz", jenis: "setoran_baru", juz: 3, materi: "Al-Baqarah 101-120", nilai: 95, status: "Lancar" },
  { id: 2, tanggal: "14/01/2025", santri: "Fatimah Zahra", jenis: "murojaah", juz: 4, materi: "An-Nisa 1-30", nilai: 92, status: "Lancar" },
  { id: 3, tanggal: "13/01/2025", santri: "Muhammad Faiz", jenis: "tilawah", juz: 3, materi: "Al-Baqarah 80-100", nilai: 90, status: "Lancar" },
];

const BATAS_LANCAR = 80;

const SetoranHafalan = () => {
  const [search, setSearch] = useState("");
  const [filterJuz, setFilterJuz] = useState("all");
  const [filterJenis, setFilterJenis] = useState("all");
  const [filterHalaqoh, setFilterHalaqoh] = useState("all");
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<FormTab>("setoran_baru");

  const getJenisLabel = (jenis: string) => {
    const option = jenisSetoranOptions.find(o => o.value === jenis);
    return option?.label || jenis;
  };

  const handleExport = () => {
    toast.success("Data setoran berhasil diexport!");
  };

  const filteredSetoran = mockSetoranList.filter((item) => {
    const matchSearch = item.santri.toLowerCase().includes(search.toLowerCase());
    const matchJuz = filterJuz === "all" || item.juz === Number(filterJuz);
    const matchJenis = filterJenis === "all" || item.jenis === filterJenis;
    return matchSearch && matchJuz && matchJenis;
  });

  return (
    <Layout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-foreground">Setoran Harian</h1>
            <p className="text-xs md:text-base text-muted-foreground">
              Kelola setoran hafalan, murojaah, dan tilawah harian
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Export</span>
            </Button>
            
            {/* Tambah Setoran Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 md:mr-2" />
                  <span className="hidden sm:inline">Tambah Setoran</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Tambah Setoran
                  </DialogTitle>
                  <DialogDescription>
                    Pilih santri, jenis setoran dan lengkapi data penilaian
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FormTab)} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="setoran_baru" className="text-xs">Setoran</TabsTrigger>
                    <TabsTrigger value="murojaah" className="text-xs">Murojaah</TabsTrigger>
                    <TabsTrigger value="tilawah" className="text-xs">Tilawah</TabsTrigger>
                    <TabsTrigger value="tilawah_rumah" className="text-xs">Di Rumah</TabsTrigger>
                  </TabsList>

                  <TabsContent value="setoran_baru" className="mt-4">
                    <TambahSetoran />
                  </TabsContent>

                  <TabsContent value="murojaah" className="mt-4">
                    <div className="p-6 text-center text-muted-foreground border rounded-lg">
                      Form murojaah belum tersedia.
                    </div>
                  </TabsContent>

                  <TabsContent value="tilawah" className="mt-4">
                    <div className="p-6 text-center text-muted-foreground border rounded-lg">
                      Form tilawah belum tersedia.
                    </div>
                  </TabsContent>

                  <TabsContent value="tilawah_rumah" className="mt-4">
                    <div className="p-6 text-center text-muted-foreground border rounded-lg">
                      Form murojaah di rumah belum tersedia.
                    </div>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-2 md:gap-4">
          {jenisSetoranOptions.map((option) => (
            <Card key={option.value}>
              <CardContent className="p-2 md:p-4">
                <div className="flex flex-col md:flex-row items-center gap-1 md:gap-3 text-center md:text-left">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <option.icon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg md:text-2xl font-bold">
                      {mockSetoranList.filter(s => s.jenis === option.value).length}
                    </p>
                    <p className="text-[9px] md:text-xs text-muted-foreground truncate">{option.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-3 md:pt-4 md:p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
              <div className="relative col-span-2 md:col-span-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cari santri..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-9 md:h-10 text-sm"
                />
              </div>
              <Select value={filterJenis} onValueChange={setFilterJenis}>
                <SelectTrigger className="h-9 md:h-10 text-sm">
                  <SelectValue placeholder="Jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jenis</SelectItem>
                  {jenisSetoranOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterJuz} onValueChange={setFilterJuz}>
                <SelectTrigger className="h-9 md:h-10 text-sm">
                  <SelectValue placeholder="Juz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Juz</SelectItem>
                  {Array.from({ length: 30 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      Juz {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterHalaqoh} onValueChange={setFilterHalaqoh}>
                <SelectTrigger className="h-9 md:h-10 text-sm">
                  <SelectValue placeholder="Halaqoh" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Halaqoh</SelectItem>
                  <SelectItem value="azhary">Halaqoh Al-Azhary</SelectItem>
                  <SelectItem value="furqon">Halaqoh Al-Furqon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="text-base md:text-lg">Riwayat Setoran</CardTitle>
            <CardDescription className="text-xs md:text-sm">Daftar semua setoran hafalan santri</CardDescription>
          </CardHeader>
          <CardContent className="p-2 md:p-6">
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs md:text-sm whitespace-nowrap">Tanggal</TableHead>
                    <TableHead className="text-xs md:text-sm whitespace-nowrap">Santri</TableHead>
                    <TableHead className="text-xs md:text-sm whitespace-nowrap">Jenis</TableHead>
                    <TableHead className="text-xs md:text-sm whitespace-nowrap">Juz</TableHead>
                    <TableHead className="text-xs md:text-sm whitespace-nowrap hidden md:table-cell">Materi</TableHead>
                    <TableHead className="text-xs md:text-sm whitespace-nowrap">Nilai</TableHead>
                    <TableHead className="text-xs md:text-sm whitespace-nowrap">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSetoran.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8 text-sm">
                        Belum ada data setoran
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSetoran.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-xs md:text-sm whitespace-nowrap">{item.tanggal}</TableCell>
                        <TableCell className="font-medium text-xs md:text-sm">{item.santri}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] md:text-xs">
                            {getJenisLabel(item.jenis)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-primary/10 text-primary border-primary text-[10px] md:text-xs">
                            Juz {item.juz}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs md:text-sm hidden md:table-cell">{item.materi}</TableCell>
                        <TableCell className="font-semibold text-primary text-xs md:text-sm">{item.nilai}</TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "text-[10px] md:text-xs",
                            item.status === "Lancar"
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground"
                          )}>
                            {item.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SetoranHafalan;
