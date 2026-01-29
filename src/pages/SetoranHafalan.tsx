import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  Download, 
  BookOpen, 
  BookMarked,
  Home,
  Target,
  RefreshCw,
  CheckCircle,
  Lock,
  Unlock,
  Eye,
  X,
  Award,
  Search
} from "lucide-react";
import { toast } from "sonner";
import { JuzSelector } from "@/components/JuzSelector";
import { SetoranCalendar } from "@/components/setoran/SetoranCalendar";
import { DrillForm } from "@/components/setoran/DrillForm";
import { getSurahsByJuz, Surah } from "@/lib/quran-data";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";

// Jenis setoran
type JenisSetoran = "setoran_baru" | "murojaah" | "tilawah" | "tilawah_rumah" | "drill";

const jenisSetoranOptions = [
  { value: "setoran_baru", label: "Setoran Baru", icon: BookOpen, description: "Hafalan ayat/halaman baru" },
  { value: "murojaah", label: "Murojaah", icon: RefreshCw, description: "Mengulang hafalan lama" },
  { value: "tilawah", label: "Tilawah", icon: BookMarked, description: "Membaca Al-Quran di kelas" },
  { value: "tilawah_rumah", label: "Tilawah di Rumah", icon: Home, description: "Membaca Al-Quran di rumah" },
  { value: "drill", label: "Drill", icon: Target, description: "Latihan hafalan intensif" },
];

// Drill levels dengan Drill 1 Juz baru
const drillLevels = [
  { id: "drill1", name: "Drill 1", desc: "5 Halaman / 5 Surat", icon: "📘" },
  { id: "drill2", name: "Drill 2", desc: "5 Halaman berikutnya", icon: "📗" },
  { id: "drillHalfJuz", name: "Drill ½ Juz", desc: "10 Halaman", icon: "📙" },
  { id: "drillFirstHalf", name: "½ Juz Pertama", desc: "Setengah juz awal", icon: "📕" },
  { id: "drillSecondHalf", name: "½ Juz Kedua", desc: "Setengah juz akhir", icon: "📓" },
  { id: "drill1Juz", name: "Drill 1 Juz", desc: "Latihan 1 juz penuh", icon: "📖" },
  { id: "tasmi1Juz", name: "Tasmi' 1 Juz", desc: "Ujian lengkap 1 juz", icon: "🏆" },
];

// Drill levels untuk juz 29-30 (lebih banyak karena surah pendek)
const drillLevels2930 = [
  { id: "drill1", name: "Drill 1", desc: "5 Surat pertama", icon: "📘" },
  { id: "drill2", name: "Drill 2", desc: "5 Surat berikutnya", icon: "📗" },
  { id: "drill3", name: "Drill 3", desc: "5 Surat berikutnya", icon: "📙" },
  { id: "drillHalfJuz", name: "Drill ½ Juz", desc: "15 Surat", icon: "📕" },
  { id: "drillFirstHalf", name: "½ Juz Pertama", desc: "Setengah juz awal", icon: "📓" },
  { id: "drillSecondHalf", name: "½ Juz Kedua", desc: "Setengah juz akhir", icon: "📔" },
  { id: "drill1Juz", name: "Drill 1 Juz", desc: "Latihan 1 juz penuh", icon: "📖" },
  { id: "tasmi1Juz", name: "Tasmi' 1 Juz", desc: "Ujian lengkap 1 juz", icon: "🏆" },
];

// Mock data
const mockSantri = [
  { id: "1", nama: "Muhammad Faiz", nis: "S001", halaqoh: "Halaqoh Al-Azhary" },
  { id: "2", nama: "Fatimah Zahra", nis: "S003", halaqoh: "Halaqoh Al-Furqon" },
  { id: "3", nama: "Aisyah Nur", nis: "S002", halaqoh: "Halaqoh Al-Azhary" },
];

// Mock setoran records
const mockSetoranRecords = [
  { tanggal: subDays(new Date(), 1), santriId: "1", jenis: "setoran_baru" as JenisSetoran, status: "selesai" as const },
  { tanggal: subDays(new Date(), 2), santriId: "1", jenis: "murojaah" as JenisSetoran, status: "selesai" as const },
  { tanggal: subDays(new Date(), 3), santriId: "1", jenis: "setoran_baru" as JenisSetoran, status: "selesai" as const },
];

// Mock setoran list untuk tabel
const mockSetoranList = [
  { id: 1, tanggal: "15/01/2025", santri: "Muhammad Faiz", jenis: "setoran_baru", juz: 3, materi: "Al-Baqarah 101-120", nilai: 95, status: "Lancar" },
  { id: 2, tanggal: "14/01/2025", santri: "Fatimah Zahra", jenis: "murojaah", juz: 4, materi: "An-Nisa 1-30", nilai: 92, status: "Lancar" },
  { id: 3, tanggal: "14/01/2025", santri: "Aisyah Nur", jenis: "drill", juz: 30, materi: "Drill 1 - An-Naba", nilai: 88, status: "Lulus" },
  { id: 4, tanggal: "13/01/2025", santri: "Muhammad Faiz", jenis: "tilawah", juz: 3, materi: "Al-Baqarah 80-100", nilai: 90, status: "Lancar" },
];

const BATAS_LANCAR = 80;
const BATAS_LULUS_DRILL = 88;

const SetoranHafalan = () => {
  const [search, setSearch] = useState("");
  const [filterJuz, setFilterJuz] = useState("all");
  const [filterJenis, setFilterJenis] = useState("all");
  const [filterHalaqoh, setFilterHalaqoh] = useState("all");
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("setoran_baru");
  
  // Form state
  const [selectedSantri, setSelectedSantri] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [juz, setJuz] = useState("");
  const [surah, setSurah] = useState("");
  const [ayatDari, setAyatDari] = useState("1");
  const [ayatSampai, setAyatSampai] = useState("7");
  const [jumlahKesalahan, setJumlahKesalahan] = useState("0");
  const [catatan, setCatatan] = useState("");
  const [drillLevel, setDrillLevel] = useState("");

  const selectedSantriData = mockSantri.find(s => s.id === selectedSantri);
  
  const surahByJuz: Surah[] = useMemo(() => {
    if (!juz) return [];
    return getSurahsByJuz(Number(juz));
  }, [juz]);

  const selectedSurah = useMemo(() => {
    return surahByJuz.find(s => s.number === Number(surah));
  }, [surah, surahByJuz]);

  const nilaiKelancaran = Math.max(0, 100 - parseInt(jumlahKesalahan || "0"));

  // Get appropriate drill levels based on juz
  const getAppropriateDrillLevels = (juzNum: number) => {
    return juzNum >= 29 ? drillLevels2930 : drillLevels;
  };

  const getJenisLabel = (jenis: string) => {
    const option = jenisSetoranOptions.find(o => o.value === jenis);
    return option?.label || jenis;
  };

  const handleExport = () => {
    toast.success("Data setoran berhasil diexport!");
  };

  const handleSubmit = () => {
    if (!selectedDate || !selectedSantri) {
      toast.error("Silakan pilih santri dan tanggal terlebih dahulu");
      return;
    }

    const isDrill = activeTab === "drill";
    const batasLulus = isDrill ? BATAS_LULUS_DRILL : BATAS_LANCAR;
    const status = nilaiKelancaran >= batasLulus ? (isDrill ? "Lulus" : "Lancar") : (isDrill ? "Tidak Lulus" : "Kurang");

    console.log({
      jenis: activeTab,
      santri: selectedSantriData?.nama,
      tanggal: format(selectedDate, "yyyy-MM-dd"),
      juz,
      surah: selectedSurah?.name,
      ayatDari,
      ayatSampai,
      drillLevel: isDrill ? drillLevel : null,
      nilai: nilaiKelancaran,
      status,
      catatan,
    });

    toast.success(
      status === "Lancar" || status === "Lulus"
        ? `${isDrill ? "Drill" : "Setoran"} berhasil disimpan! 🎉`
        : `${isDrill ? "Drill" : "Setoran"} dicatat. Perlu latihan lagi.`
    );

    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedSantri("");
    setSelectedDate(undefined);
    setJuz("");
    setSurah("");
    setAyatDari("1");
    setAyatSampai("7");
    setJumlahKesalahan("0");
    setCatatan("");
    setDrillLevel("");
  };

  const filteredSetoran = mockSetoranList.filter((item) => {
    const matchSearch = item.santri.toLowerCase().includes(search.toLowerCase());
    const matchJuz = filterJuz === "all" || item.juz === Number(filterJuz);
    const matchJenis = filterJenis === "all" || item.jenis === filterJenis;
    return matchSearch && matchJuz && matchJenis;
  });

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Setoran Hafalan</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Kelola setoran harian, murojaah, tilawah, dan drill hafalan
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <DrillForm 
              santriList={mockSantri} 
              setoranRecords={mockSetoranRecords}
            />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Setoran
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Tambah Setoran
                  </DialogTitle>
                  <DialogDescription>
                    Pilih jenis setoran dan lengkapi data penilaian
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-5 w-full">
                    {jenisSetoranOptions.map((option) => (
                      <TabsTrigger key={option.value} value={option.value} className="text-xs">
                        <option.icon className="w-4 h-4 mr-1 hidden sm:inline" />
                        {option.label.split(" ")[0]}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {jenisSetoranOptions.map((option) => (
                    <TabsContent key={option.value} value={option.value} className="space-y-4 mt-4">
                      {/* Info jenis */}
                      <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-3">
                            <option.icon className="w-8 h-8 text-primary" />
                            <div>
                              <p className="font-medium">{option.label}</p>
                              <p className="text-sm text-muted-foreground">{option.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Pilih Santri */}
                      <div className="space-y-2">
                        <Label>Pilih Santri *</Label>
                        <Select value={selectedSantri} onValueChange={setSelectedSantri}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih santri" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockSantri.map(santri => (
                              <SelectItem key={santri.id} value={santri.id}>
                                {santri.nama} - {santri.nis}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedSantriData && (
                          <p className="text-sm text-muted-foreground">
                            Halaqoh: {selectedSantriData.halaqoh}
                          </p>
                        )}
                      </div>

                      {/* Calendar untuk pilih tanggal - hanya muncul jika santri dipilih */}
                      {selectedSantri && (
                        <SetoranCalendar
                          santriId={selectedSantri}
                          setoranRecords={mockSetoranRecords}
                          selectedDate={selectedDate}
                          onSelectDate={setSelectedDate}
                        />
                      )}

                      {/* Form detail - muncul jika tanggal dipilih */}
                      {selectedDate && (
                        <>
                          {/* Juz & Surah */}
                          <div className="grid grid-cols-2 gap-4">
                            <JuzSelector value={juz} onValueChange={setJuz} required />
                            <div className="space-y-2">
                              <Label>Surah *</Label>
                              <Select value={surah} onValueChange={setSurah} disabled={!juz}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih surah" />
                                </SelectTrigger>
                                <SelectContent>
                                  {surahByJuz.map((s) => (
                                    <SelectItem key={s.number} value={String(s.number)}>
                                      {s.number}. {s.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Ayat range */}
                          {selectedSurah && (
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Ayat Dari</Label>
                                <Input
                                  type="number"
                                  min={1}
                                  max={selectedSurah.numberOfAyahs}
                                  value={ayatDari}
                                  onChange={(e) => setAyatDari(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Ayat Sampai</Label>
                                <Input
                                  type="number"
                                  min={Number(ayatDari)}
                                  max={selectedSurah.numberOfAyahs}
                                  value={ayatSampai}
                                  onChange={(e) => setAyatSampai(e.target.value)}
                                />
                              </div>
                            </div>
                          )}

                          {/* Drill level - hanya untuk drill */}
                          {option.value === "drill" && juz && (
                            <div className="space-y-2">
                              <Label>Level Drill *</Label>
                              <Select value={drillLevel} onValueChange={setDrillLevel}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih level drill" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getAppropriateDrillLevels(Number(juz)).map(level => (
                                    <SelectItem key={level.id} value={level.id}>
                                      <span className="flex items-center gap-2">
                                        <span>{level.icon}</span>
                                        <span>{level.name}</span>
                                        <span className="text-muted-foreground text-xs">- {level.desc}</span>
                                      </span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {drillLevel === "tasmi1Juz" && (
                                <div className="p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200">
                                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    <Award className="w-4 h-4 inline mr-1" />
                                    Setelah lulus Tasmi' 1 Juz, santri bisa didaftarkan ke Ujian Tasmi'!
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Penilaian */}
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm">Penilaian</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="space-y-2">
                                <Label>Jumlah Kesalahan</Label>
                                <Input 
                                  type="number" 
                                  value={jumlahKesalahan}
                                  onChange={(e) => setJumlahKesalahan(e.target.value)}
                                  min="0"
                                />
                                <p className="text-xs text-muted-foreground">
                                  Setiap kesalahan mengurangi 1 poin dari 100
                                </p>
                              </div>

                              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <Label>Nilai Kelancaran</Label>
                                <div className="text-right">
                                  <span className={cn(
                                    "text-2xl font-bold",
                                    nilaiKelancaran >= (option.value === "drill" ? BATAS_LULUS_DRILL : BATAS_LANCAR)
                                      ? "text-primary"
                                      : "text-destructive"
                                  )}>
                                    {nilaiKelancaran}
                                  </span>
                                  <p className="text-xs text-muted-foreground">
                                    {option.value === "drill" 
                                      ? `Batas lulus: ${BATAS_LULUS_DRILL}`
                                      : `Batas lancar: ${BATAS_LANCAR}`
                                    }
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label>Catatan</Label>
                                <Textarea 
                                  placeholder="Catatan tajwid, makharijul huruf, dll..."
                                  value={catatan}
                                  onChange={(e) => setCatatan(e.target.value)}
                                />
                              </div>
                            </CardContent>
                          </Card>

                          <Button onClick={handleSubmit} className="w-full bg-primary hover:bg-primary/90">
                            Simpan {option.label}
                          </Button>
                        </>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {jenisSetoranOptions.map((option) => (
            <Card key={option.value}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <option.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {mockSetoranList.filter(s => s.jenis === option.value).length}
                    </p>
                    <p className="text-xs text-muted-foreground">{option.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cari santri..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterJenis} onValueChange={setFilterJenis}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Jenis" />
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
                <SelectTrigger>
                  <SelectValue placeholder="Semua Juz" />
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
                <SelectTrigger>
                  <SelectValue placeholder="Semua Halaqoh" />
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
          <CardHeader>
            <CardTitle>Riwayat Setoran</CardTitle>
            <CardDescription>Daftar semua setoran hafalan santri</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Santri</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Juz</TableHead>
                    <TableHead>Materi</TableHead>
                    <TableHead>Nilai</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSetoran.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        Belum ada data setoran
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSetoran.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.tanggal}</TableCell>
                        <TableCell className="font-medium">{item.santri}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {getJenisLabel(item.jenis)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-primary/10 text-primary border-primary">
                            Juz {item.juz}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{item.materi}</TableCell>
                        <TableCell className="font-semibold text-primary">{item.nilai}</TableCell>
                        <TableCell>
                          <Badge className={cn(
                            item.status === "Lancar" || item.status === "Lulus"
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-yellow-500 hover:bg-yellow-600"
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
