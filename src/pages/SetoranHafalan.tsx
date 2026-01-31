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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { 
  Plus, 
  Download, 
  BookOpen, 
  BookMarked,
  Home,
  Target,
  RefreshCw,
  Search,
  CalendarIcon,
  Unlock,
  Lock,
  Save,
  Trophy,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  X,
  Edit3
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { getSurahsByJuz, Surah } from "@/lib/quran-data";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";
import TambahSetoran from "@/pages/TambahSetoran";
import { JuzSelector } from "@/components/JuzSelector";
import {
  getDrillsForJuz,
  DrillDefinition,
  isPageBasedDrill,
  formatDrillDescription,
} from "@/lib/drill-data";

// Jenis setoran
type FormTab = "setoran_baru" | "murojaah" | "tilawah" | "tilawah_rumah" | "drill";
type JenisSetoran = "setoran_baru" | "murojaah" | "tilawah" | "tilawah_rumah" | "drill";
type SetoranRecord = {
  tanggal: Date;
  santriId: string;
  jenis: JenisSetoran;
  status: "selesai" | "tidak_hadir";
};

const jenisSetoranOptions = [
  { value: "setoran_baru", label: "Setoran Baru", icon: BookOpen, description: "Hafalan ayat/halaman baru" },
  { value: "murojaah", label: "Murojaah", icon: RefreshCw, description: "Mengulang hafalan lama" },
  { value: "tilawah", label: "Tilawah", icon: BookMarked, description: "Membaca Al-Quran di kelas" },
  { value: "tilawah_rumah", label: "Tilawah di Rumah", icon: Home, description: "Membaca Al-Quran di rumah" },
  { value: "drill", label: "Drill", icon: Target, description: "Latihan hafalan intensif" },
];

// Mock data
const mockSantri = [
  { id: "1", nama: "Muhammad Faiz", nis: "S001", halaqoh: "Halaqoh Al-Azhary" },
  { id: "2", nama: "Fatimah Zahra", nis: "S003", halaqoh: "Halaqoh Al-Furqon" },
  { id: "3", nama: "Aisyah Nur", nis: "S002", halaqoh: "Halaqoh Al-Azhary" },
];

// Mock setoran records
const mockSetoranRecords: SetoranRecord[] = [
  { tanggal: subDays(new Date(), 1), santriId: "1", jenis: "setoran_baru", status: "selesai" },
  { tanggal: subDays(new Date(), 2), santriId: "1", jenis: "murojaah", status: "selesai" },
  { tanggal: subDays(new Date(), 3), santriId: "1", jenis: "setoran_baru", status: "selesai" },
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
const BATAS_KESALAHAN_DRILL = 12;

// Mock halaqoh list
const mockHalaqoh = [
  { id: "h1", nama_halaqoh: "Halaqoh Al-Azhary" },
  { id: "h2", nama_halaqoh: "Halaqoh Al-Furqon" },
];

const SetoranHafalan = () => {
  const [search, setSearch] = useState("");
  const [filterJuz, setFilterJuz] = useState("all");
  const [filterJenis, setFilterJenis] = useState("all");
  const [filterHalaqoh, setFilterHalaqoh] = useState("all");
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDrillDialogOpen, setIsDrillDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<FormTab>("setoran_baru");
  
  // Form state for Setoran
  const [selectedSantri, setSelectedSantri] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [juz, setJuz] = useState("");
  const [surah, setSurah] = useState("");
  const [ayatDari, setAyatDari] = useState("1");
  const [ayatSampai, setAyatSampai] = useState("7");
  const [jumlahKesalahan, setJumlahKesalahan] = useState("0");
  const [catatan, setCatatan] = useState("");

  // Drill form state
  const [drillFormHalaqohFilter, setDrillFormHalaqohFilter] = useState("");
  const [drillSelectedSantri, setDrillSelectedSantri] = useState("");
  const [tanggalDrill, setTanggalDrill] = useState<Date>();
  const [drillJuz, setDrillJuz] = useState("");
  const [drillLevelSelected, setDrillLevelSelected] = useState("");
  const drills: DrillDefinition[] = useMemo(() => {
    if (!drillJuz) return [];
    return getDrillsForJuz(Number(drillJuz));
  }, [drillJuz]);
  const [drillJumlahKesalahan, setDrillJumlahKesalahan] = useState("0");
  const [catatanTajwid, setCatatanTajwid] = useState("");
  
  // Manual drill input state
  const [useManualInput, setUseManualInput] = useState(false);
  const [manualPages, setManualPages] = useState<{ id: string; page: number }[]>([]);

  const selectedSantriData = mockSantri.find(s => s.id === selectedSantri);
  
  const surahByJuz: Surah[] = useMemo(() => {
    if (!juz) return [];
    return getSurahsByJuz(Number(juz));
  }, [juz]);

  const selectedSurah = useMemo(() => {
    return surahByJuz.find(s => s.number === Number(surah));
  }, [surah, surahByJuz]);

  const nilaiKelancaran = Math.max(0, 100 - parseInt(jumlahKesalahan || "0"));
  const drillNilaiKelancaran = Math.max(0, 100 - parseInt(drillJumlahKesalahan || "0"));

  const filteredSantriForDrillForm = useMemo(() => {
    if (!drillFormHalaqohFilter) return mockSantri;
    return mockSantri.filter(s => s.halaqoh === mockHalaqoh.find(h => h.id === drillFormHalaqohFilter)?.nama_halaqoh);
  }, [drillFormHalaqohFilter]);

  const isDrillUnlocked = (santriId: string, drillNumber: number, juzNum: number) => {
    // For now, only Drill 1 is unlocked by default
    // In real implementation, check completed drills from database
    return drillNumber === 1;
  };

  const handleDrillLevelChange = (value: string) => {
    setDrillLevelSelected(value);
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
    setDrillLevelSelected("");
  };

  const resetDrillForm = () => {
    setDrillFormHalaqohFilter("");
    setDrillSelectedSantri("");
    setTanggalDrill(undefined);
    setDrillJuz("");
    setDrillLevelSelected("");
    setDrillJumlahKesalahan("0");
    setCatatanTajwid("");
    setUseManualInput(false);
    setManualPages([]);
  };

  const handleAddManualPage = () => {
    const selectedDrill = drills.find(d => d.drillNumber === Number(drillLevelSelected));
    const defaultPage = selectedDrill?.pageStart ?? 1;
    setManualPages(prev => [...prev, { id: crypto.randomUUID(), page: defaultPage }]);
  };

  const handleUpdateManualPage = (id: string, value: number) => {
    setManualPages(prev => prev.map(p => p.id === id ? { ...p, page: value } : p));
  };

  const handleRemoveManualPage = (id: string) => {
    setManualPages(prev => prev.filter(p => p.id !== id));
  };

  const handleSaveDrill = () => {
    if (!tanggalDrill || !drillSelectedSantri || !drillJuz) {
      toast.error("Silakan lengkapi data drill terlebih dahulu");
      return;
    }
    
    const santriData = mockSantri.find(s => s.id === drillSelectedSantri);
    const selectedDrill = drills.find(d => d.drillNumber === Number(drillLevelSelected));
    
    console.log({
      jenis: "drill",
      santri: santriData?.nama,
      tanggal: format(tanggalDrill, "yyyy-MM-dd"),
      juz: drillJuz,
      drillLevel: drillLevelSelected,
      nilai: drillNilaiKelancaran,
      catatan: catatanTajwid,
      isManualInput: useManualInput,
      manualPages: useManualInput ? manualPages.map(p => p.page) : null,
      targetPages: selectedDrill?.type === 'page' 
        ? { start: selectedDrill.pageStart, end: selectedDrill.pageEnd }
        : null,
    });
    
    toast.success(useManualInput 
      ? `Drill (input manual: ${manualPages.length} halaman) berhasil disimpan!`
      : "Drill berhasil disimpan!"
    );
    setIsDrillDialogOpen(false);
    resetDrillForm();
  };

  const handleLulusDrill = () => {
    if (drillNilaiKelancaran >= BATAS_LULUS_DRILL) {
      handleSaveDrill();
      toast.success("Drill LULUS! 🎉");
    }
  };

  const handleUlangiDrill = () => {
    if (!tanggalDrill || !drillSelectedSantri) {
      toast.error("Silakan lengkapi data drill terlebih dahulu");
      return;
    }
    
    const santriData = mockSantri.find(s => s.id === drillSelectedSantri);
    console.log({
      jenis: "drill",
      santri: santriData?.nama,
      status: "ulangi",
      nilai: drillNilaiKelancaran,
    });
    
    toast.info("Drill dicatat. Santri perlu mengulang.");
    setIsDrillDialogOpen(false);
    resetDrillForm();
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
            <h1 className="text-xl md:text-3xl font-bold text-foreground">Setoran Hafalan</h1>
            <p className="text-xs md:text-base text-muted-foreground">
              Kelola setoran harian, murojaah, tilawah, dan drill hafalan
            </p>
          </div>
          
          {/* Action Buttons - Responsive Grid */}
          <div className="grid grid-cols-3 gap-2 md:flex md:gap-2">
            <Button variant="outline" size="sm" className="w-full md:w-auto" onClick={handleExport}>
              <Download className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Export</span>
            </Button>
            
            {/* Tambah Setoran Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full md:w-auto">
                  <Plus className="w-4 h-4 md:mr-2" />
                  <span className="hidden sm:inline">Setoran</span>
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
                
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FormTab)} className="w-full">
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="setoran_baru">Setoran Baru</TabsTrigger>
                    <TabsTrigger value="murojaah">Murojaah</TabsTrigger>
                    <TabsTrigger value="tilawah">Tilawah</TabsTrigger>
                    <TabsTrigger value="tilawah_rumah">Tilawah Rumah</TabsTrigger>
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
                      Form tilawah rumah belum tersedia.
                    </div>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>

            {/* Tambah Drill Dialog */}
            <Dialog open={isDrillDialogOpen} onOpenChange={setIsDrillDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full md:w-auto">
                  <Target className="w-4 h-4 md:mr-2" />
                  <span className="hidden sm:inline">Drill</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Tambah Drill Hafalan</DialogTitle>
                  <DialogDescription>
                    Masukkan penilaian drill hafalan untuk santri
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {/* Filter Halaqoh */}
                  <div className="space-y-2">
                    <Label>Filter Halaqoh</Label>
                    <Select
                      value={drillFormHalaqohFilter || "all"}
                      onValueChange={(v) => setDrillFormHalaqohFilter(v === "all" ? "" : v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Semua Halaqoh" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Halaqoh</SelectItem>
                        {mockHalaqoh.map((h) => (
                          <SelectItem key={h.id} value={h.id}>
                            {h.nama_halaqoh}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Santri */}
                  <div className="space-y-2">
                    <Label>Pilih Santri *</Label>
                    <Select value={drillSelectedSantri} onValueChange={setDrillSelectedSantri}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih santri" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredSantriForDrillForm.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.nama} ({s.nis})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tanggal */}
                  <div className="space-y-2">
                    <Label>Tanggal Drill *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !tanggalDrill && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {tanggalDrill ? format(tanggalDrill, "dd/MM/yyyy") : "Pilih tanggal"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={tanggalDrill}
                          onSelect={setTanggalDrill}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <JuzSelector value={drillJuz} onValueChange={setDrillJuz} required />

                  {/* Level Drill */}
                  <div className="space-y-2">
                    <Label>Level Drill</Label>
                    <Select
                      value={drillLevelSelected}
                      onValueChange={setDrillLevelSelected}
                      disabled={!drillJuz}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih level drill" />
                      </SelectTrigger>

                      <SelectContent>
                        {drills.map(drill => {
                          const unlocked = isDrillUnlocked(
                            drillSelectedSantri,
                            drill.drillNumber,
                            Number(drillJuz)
                          );

                          return (
                            <SelectItem
                              key={drill.drillNumber}
                              value={String(drill.drillNumber)}
                              disabled={!unlocked}
                            >
                              {unlocked ? <Unlock className="inline w-3 h-3 mr-1" /> : <Lock className="inline w-3 h-3 mr-1" />}
                              Level {drill.drillNumber} — {formatDrillDescription(drill)}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Info Drill yang dipilih */}
                  {drillLevelSelected && drillJuz && (() => {
                    const selectedDrill = drills.find(d => d.drillNumber === Number(drillLevelSelected));
                    if (!selectedDrill) return null;

                    if (selectedDrill.type === 'page') {
                      return (
                        <>
                          <Card className="border-dashed border-primary/50">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <BookOpen className="w-5 h-5 text-primary" />
                                <div>
                                  <p className="font-medium">Target Drill: Halaman</p>
                                  <p className="text-sm text-muted-foreground">
                                    Halaman {selectedDrill.pageStart} – {selectedDrill.pageEnd}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Manual Input Toggle */}
                          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                            <div className="flex items-center gap-2">
                              <Edit3 className="w-4 h-4 text-muted-foreground" />
                              <Label htmlFor="manual-input" className="text-sm cursor-pointer">
                                Input Manual (tidak sesuai target)
                              </Label>
                            </div>
                            <Switch
                              id="manual-input"
                              checked={useManualInput}
                              onCheckedChange={(checked) => {
                                setUseManualInput(checked);
                                if (!checked) setManualPages([]);
                              }}
                            />
                          </div>

                          {/* Manual Pages Input */}
                          {useManualInput && (
                            <Card className="border-dashed border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-center">
                                  <CardTitle className="text-sm flex items-center gap-2">
                                    <Edit3 className="w-4 h-4" />
                                    Input Halaman Manual
                                  </CardTitle>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleAddManualPage}
                                    className="h-7"
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Tambah
                                  </Button>
                                </div>
                                <CardDescription className="text-xs">
                                  Masukkan halaman yang berhasil dihafalkan
                                </CardDescription>
                              </CardHeader>

                              <CardContent className="space-y-2">
                                {manualPages.length === 0 ? (
                                  <p className="text-sm text-muted-foreground text-center py-2">
                                    Klik "Tambah" untuk menambahkan halaman
                                  </p>
                                ) : (
                                  manualPages.map((mp, index) => (
                                    <div key={mp.id} className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground w-6">{index + 1}.</span>
                                      <Input
                                        type="number"
                                        value={mp.page}
                                        min={selectedDrill.pageStart}
                                        max={selectedDrill.pageEnd}
                                        onChange={(e) => handleUpdateManualPage(mp.id, Number(e.target.value))}
                                        className="h-9 flex-1"
                                        placeholder="Halaman"
                                      />
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleRemoveManualPage(mp.id)}
                                        className="h-9 w-9 text-destructive hover:text-destructive"
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  ))
                                )}
                                {manualPages.length > 0 && (
                                  <p className="text-xs text-muted-foreground pt-2 border-t">
                                    Total: {manualPages.length} halaman diinput manual
                                  </p>
                                )}
                              </CardContent>
                            </Card>
                          )}
                        </>
                      );
                    }

                    if (selectedDrill.type === 'surah' && selectedDrill.surahRanges) {
                      return (
                        <Card className="border-dashed border-primary/50">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Target className="w-5 h-5 text-primary mt-0.5" />
                              <div className="space-y-1">
                                <p className="font-medium">Target Drill: Surat</p>
                                <div className="text-sm text-muted-foreground space-y-0.5">
                                  {selectedDrill.surahRanges.map((s, i) => (
                                    <p key={i}>
                                      • {s.surahName}
                                      {s.fullSurah
                                        ? " (1 surat penuh)"
                                        : ` ayat ${s.ayatStart}–${s.ayatEnd}`}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    }

                    return null;
                  })()}

                  {/* Penilaian */}
                  <div className="pt-4 border-t space-y-4">
                    <h4 className="font-semibold">Penilaian</h4>

                    <div className="space-y-2">
                      <Label>Jumlah Kesalahan *</Label>
                      <Input
                        type="number"
                        value={drillJumlahKesalahan}
                        min={0}
                        onChange={(e) => setDrillJumlahKesalahan(e.target.value)}
                      />
                    </div>

                    <div className="flex justify-between p-3 bg-muted rounded-lg">
                      <Label>Nilai Kelancaran</Label>
                      <span
                        className={cn(
                          "text-xl font-bold",
                          drillNilaiKelancaran >= BATAS_LULUS_DRILL ? "text-green-600" : "text-destructive"
                        )}
                      >
                        {drillNilaiKelancaran}
                      </span>
                    </div>

                    <Card
                      className={cn(
                        "p-3 border-2",
                        drillNilaiKelancaran >= BATAS_LULUS_DRILL
                          ? "border-green-500 bg-green-50"
                          : "border-destructive bg-destructive/10"
                      )}
                    >
                      <div className="flex gap-3">
                        {drillNilaiKelancaran >= BATAS_LULUS_DRILL ? (
                          <CheckCircle className="text-green-600" />
                        ) : (
                          <AlertCircle className="text-destructive" />
                        )}
                        <div className="text-sm">
                          Batas lulus: {BATAS_LULUS_DRILL} | Maks kesalahan: {BATAS_KESALAHAN_DRILL}
                        </div>
                      </div>
                    </Card>

                    <div className="space-y-2">
                      <Label>Catatan Tajwid</Label>
                      <Textarea
                        value={catatanTajwid}
                        onChange={(e) => setCatatanTajwid(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-2 pt-4">
                    <Button variant="outline" onClick={handleSaveDrill}>
                      <Save className="w-4 h-4 mr-1" /> Simpan
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      disabled={drillNilaiKelancaran < BATAS_LULUS_DRILL}
                      onClick={handleLulusDrill}
                    >
                      <Trophy className="w-4 h-4 mr-1" /> Lulus
                    </Button>
                    <Button variant="destructive" onClick={handleUlangiDrill}>
                      <RotateCcw className="w-4 h-4 mr-1" /> Ulangi
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

          </div>
        </div>

        {/* Stats Cards - Responsive */}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-4">
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
                            item.status === "Lancar" || item.status === "Lulus"
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
