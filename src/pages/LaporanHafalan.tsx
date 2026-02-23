import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, TrendingUp, BookOpen, Calendar, BarChart3, Target, Users, School, BookOpenCheck } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { LaporanCharts, CapaianKelasChart, CapaianHalaqohChart, CapaianSiswaChart } from "@/components/laporan/LaporanCharts";
import { MOCK_KELAS } from "@/lib/mock-data";
import { 
  MOCK_SANTRI_TILAWAH, 
  MOCK_SETORAN_TILAWAH,
  TILAWATI_JILID,
  HALAMAN_PER_JILID,
  getProgressJilid
} from "@/lib/tilawah-data";

// Mock data
const mockLaporanHarian = [
  { tanggal: "15/01/2025", santri: "Muhammad Faiz", juz: 3, halaman: "45-50", ayat: 60, nilai: 95, status: "Lancar" },
  { tanggal: "15/01/2025", santri: "Fatimah Zahra", juz: 4, halaman: "1-5", ayat: 50, nilai: 92, status: "Lancar" },
  { tanggal: "14/01/2025", santri: "Aisyah Nur", juz: 3, halaman: "40-44", ayat: 45, nilai: 88, status: "Lancar" },
  { tanggal: "14/01/2025", santri: "Ahmad Rasyid", juz: 2, halaman: "30-35", ayat: 55, nilai: 90, status: "Lancar" },
  { tanggal: "13/01/2025", santri: "Muhammad Faiz", juz: 3, halaman: "40-44", ayat: 48, nilai: 94, status: "Lancar" },
];

const mockLaporanMingguan = [
  { minggu: "Minggu 1", totalSetoran: 25, totalAyat: 450, rataRata: 92, santriAktif: 45 },
  { minggu: "Minggu 2", totalSetoran: 28, totalAyat: 520, rataRata: 94, santriAktif: 48 },
  { minggu: "Minggu 3", totalSetoran: 22, totalAyat: 400, rataRata: 90, santriAktif: 42 },
  { minggu: "Minggu 4", totalSetoran: 30, totalAyat: 580, rataRata: 93, santriAktif: 50 },
];

const mockCapaianJuz = [
  { juz: 1, santriSelesai: 45, totalSantri: 50, persentase: 90 },
  { juz: 2, santriSelesai: 38, totalSantri: 50, persentase: 76 },
  { juz: 3, santriSelesai: 30, totalSantri: 50, persentase: 60 },
  { juz: 4, santriSelesai: 22, totalSantri: 50, persentase: 44 },
  { juz: 5, santriSelesai: 15, totalSantri: 50, persentase: 30 },
];

const mockDrillHafalan = [
  { santri: "Muhammad Faiz", halaqoh: "Al-Azhary", kelas: "Paket A Kelas 6", drill1: "Lulus", drill2: "Lulus", drill12Juz: "Proses", drill1Juz: "-", tasmi: "-", nilaiTerakhir: 92 },
  { santri: "Fatimah Zahra", halaqoh: "Al-Azhary", kelas: "KBTK A", drill1: "Lulus", drill2: "Lulus", drill12Juz: "Lulus", drill1Juz: "Proses", tasmi: "-", nilaiTerakhir: 88 },
  { santri: "Aisyah Nur", halaqoh: "Al-Furqon", kelas: "Paket B Kelas 8", drill1: "Lulus", drill2: "Proses", drill12Juz: "-", drill1Juz: "-", tasmi: "-", nilaiTerakhir: 90 },
  { santri: "Ahmad Rasyid", halaqoh: "Al-Furqon", kelas: "Paket A Kelas 6", drill1: "Lulus", drill2: "Lulus", drill12Juz: "Lulus", drill1Juz: "Lulus", tasmi: "Lulus", nilaiTerakhir: 95 },
  { santri: "Umar Faruq", halaqoh: "Al-Hidayah", kelas: "KBTK B", drill1: "Proses", drill2: "-", drill12Juz: "-", drill1Juz: "-", tasmi: "-", nilaiTerakhir: 85 },
];

// Chart data
const mockCapaianKelas = [
  { kelas: "KBTK A", rataRata: 92, totalSetoran: 156 },
  { kelas: "KBTK B", rataRata: 88, totalSetoran: 142 },
  { kelas: "Paket A Kelas 6", rataRata: 94, totalSetoran: 178 },
  { kelas: "Paket B Kelas 8", rataRata: 90, totalSetoran: 165 },
  { kelas: "Paket C Kelas 10", rataRata: 86, totalSetoran: 134 },
];

const mockCapaianHalaqoh = [
  { halaqoh: "Al-Azhary", rataRata: 93, totalSetoran: 234 },
  { halaqoh: "Al-Furqon", rataRata: 91, totalSetoran: 198 },
  { halaqoh: "Al-Hidayah", rataRata: 89, totalSetoran: 187 },
  { halaqoh: "An-Nur", rataRata: 87, totalSetoran: 156 },
];

const mockCapaianSiswa = [
  { nama: "Ahmad Rasyid", juzSelesai: 15, totalJuz: 30, persentase: 50 },
  { nama: "Muhammad Faiz", juzSelesai: 12, totalJuz: 30, persentase: 40 },
  { nama: "Fatimah Zahra", juzSelesai: 10, totalJuz: 30, persentase: 33 },
  { nama: "Aisyah Nur", juzSelesai: 8, totalJuz: 30, persentase: 27 },
  { nama: "Umar Faruq", juzSelesai: 6, totalJuz: 30, persentase: 20 },
];

const mockSantri = [
  { id: "1", nama: "Muhammad Faiz", halaqoh: "azhary" },
  { id: "2", nama: "Fatimah Zahra", halaqoh: "azhary" },
  { id: "3", nama: "Aisyah Nur", halaqoh: "furqon" },
  { id: "4", nama: "Ahmad Rasyid", halaqoh: "furqon" },
];

const LaporanHafalan = () => {
  const [activeTab, setActiveTab] = useState("hafalan");
  const [filterPeriode, setFilterPeriode] = useState("bulanan");
  const [filterHalaqoh, setFilterHalaqoh] = useState("all");
  const [filterBulan, setFilterBulan] = useState("januari");
  const [filterSantri, setFilterSantri] = useState("all");
  const [filterKelas, setFilterKelas] = useState("all");
  // Tilawah filters
  const [tilawahHalaqoh, setTilawahHalaqoh] = useState("all");
  const [tilawahKelas, setTilawahKelas] = useState("all");
  const [tilawahJilid, setTilawahJilid] = useState("all");

  // Tilawah stats
  const santriTilawahStats = MOCK_SANTRI_TILAWAH.map(santri => {
    const setoranSantri = MOCK_SETORAN_TILAWAH.filter(s => s.idSantri === santri.id);
    const totalHalaman = setoranSantri.reduce((acc, s) => acc + (s.halamanSampai - s.halamanDari + 1), 0);
    const rataRataNilai = setoranSantri.length > 0
      ? Math.round(setoranSantri.reduce((acc, s) => acc + (s.nilaiRataRata || 0), 0) / setoranSantri.length)
      : 0;
    const progressJilid = getProgressJilid(santri.halamanSaatIni, santri.jilidSaatIni);
    return { ...santri, jumlahSetoran: setoranSantri.length, totalHalaman, rataRataNilai, progressJilid: Math.round(progressJilid) };
  });

  const filteredTilawahSantri = santriTilawahStats.filter(santri => {
    const matchHalaqoh = tilawahHalaqoh === "all" || santri.halaqoh === tilawahHalaqoh;
    const matchKelas = tilawahKelas === "all" || santri.kelas === tilawahKelas;
    const matchJilid = tilawahJilid === "all" || santri.jilidSaatIni === parseInt(tilawahJilid);
    return matchHalaqoh && matchKelas && matchJilid;
  });

  const filteredSantri = filterHalaqoh === "all" 
    ? mockSantri 
    : mockSantri.filter(s => s.halaqoh === filterHalaqoh);

  const filteredDrill = mockDrillHafalan.filter((d) => {
    const matchHalaqoh = filterHalaqoh === "all" || d.halaqoh.toLowerCase().includes(filterHalaqoh);
    const matchKelas = filterKelas === "all" || d.kelas === filterKelas;
    return matchHalaqoh && matchKelas;
  });

  const getStatusBadge = (status: string) => {
    if (status === "Lulus") return <Badge className="bg-green-500 hover:bg-green-600 text-white">Lulus</Badge>;
    if (status === "Proses") return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">Proses</Badge>;
    return <Badge variant="outline" className="text-muted-foreground">-</Badge>;
  };

  const handleExportPDF = () => {
    toast.success("Laporan berhasil diexport ke PDF!");
  };

  const handleExportExcel = () => {
    toast.success("Laporan berhasil diexport ke Excel!");
  };

  return (
    <Layout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Laporan</h1>
            <p className="text-sm md:text-base text-muted-foreground">Rekap dan analisis capaian hafalan & tilawah santri</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 md:flex-none" onClick={handleExportExcel}>
              <Download className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Excel</span>
              <span className="sm:hidden">XLS</span>
            </Button>
            <Button size="sm" className="flex-1 md:flex-none bg-[#015504]" onClick={handleExportPDF}>
              <FileText className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Export PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
          </div>
        </div>

        {/* Top-level Hafalan / Tilawah tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="hafalan" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Hafalan
            </TabsTrigger>
            <TabsTrigger value="tilawah" className="flex items-center gap-2">
              <BookOpenCheck className="w-4 h-4" />
              Tilawah
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hafalan" className="space-y-4 md:space-y-6 mt-4">

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          <Card>
            <CardContent className="p-3 md:pt-4 md:p-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg md:text-2xl font-bold">105</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground truncate">Total Setoran</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:pt-4 md:p-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg md:text-2xl font-bold">1,950</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground truncate">Total Ayat</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:pt-4 md:p-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-accent-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg md:text-2xl font-bold">92.5</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground truncate">Rata-rata</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:pt-4 md:p-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg md:text-2xl font-bold">48</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground truncate">Santri Aktif</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Periode</label>
                <Select value={filterPeriode} onValueChange={setFilterPeriode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="harian">Harian</SelectItem>
                    <SelectItem value="mingguan">Mingguan</SelectItem>
                    <SelectItem value="bulanan">Bulanan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Bulan</label>
                <Select value={filterBulan} onValueChange={setFilterBulan}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="januari">Januari 2025</SelectItem>
                    <SelectItem value="februari">Februari 2025</SelectItem>
                    <SelectItem value="maret">Maret 2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Halaqoh</label>
                <Select value={filterHalaqoh} onValueChange={(v) => { setFilterHalaqoh(v); setFilterSantri("all"); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Halaqoh</SelectItem>
                    <SelectItem value="azhary">Halaqoh Al-Azhary</SelectItem>
                    <SelectItem value="furqon">Halaqoh Al-Furqon</SelectItem>
                    <SelectItem value="hidayah">Halaqoh Al-Hidayah</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Kelas</label>
                <Select value={filterKelas} onValueChange={setFilterKelas}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kelas</SelectItem>
                    {MOCK_KELAS.map((k) => (
                      <SelectItem key={k.id} value={k.id}>
                        {k.nama_kelas}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Santri</label>
                <Select value={filterSantri} onValueChange={setFilterSantri}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Santri</SelectItem>
                    {filteredSantri.map((santri) => (
                      <SelectItem key={santri.id} value={santri.id}>{santri.nama}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Visualisasi Capaian
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CapaianKelasChart data={mockCapaianKelas} />
            <CapaianHalaqohChart data={mockCapaianHalaqoh} />
          </div>
          <CapaianSiswaChart data={mockCapaianSiswa} />
        </div>

        {/* Tabs Content */}
        <Tabs defaultValue="harian" className="space-y-4">
          <TabsList className="flex-wrap">
            <TabsTrigger value="harian" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Rekap Harian
            </TabsTrigger>
            <TabsTrigger value="mingguan" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Rekap Mingguan
            </TabsTrigger>
            <TabsTrigger value="capaian" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Capaian per Juz
            </TabsTrigger>
            <TabsTrigger value="drill" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Rekap Drill Hafalan
            </TabsTrigger>
          </TabsList>

          {/* Rekap Harian */}
          <TabsContent value="harian">
            <Card>
              <CardHeader>
                <CardTitle>Rekap Setoran Harian</CardTitle>
                <CardDescription>Daftar setoran hafalan harian santri</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Santri</TableHead>
                        <TableHead>Juz</TableHead>
                        <TableHead>Halaman</TableHead>
                        <TableHead>Ayat</TableHead>
                        <TableHead>Nilai</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockLaporanHarian.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.tanggal}</TableCell>
                          <TableCell className="font-medium">{item.santri}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
                              Juz {item.juz}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.halaman}</TableCell>
                          <TableCell>{item.ayat} ayat</TableCell>
                          <TableCell className="font-semibold text-primary">{item.nilai}</TableCell>
                          <TableCell>
                            <Badge className="bg-green-500 hover:bg-green-600">{item.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rekap Mingguan */}
          <TabsContent value="mingguan">
            <Card>
              <CardHeader>
                <CardTitle>Rekap Mingguan</CardTitle>
                <CardDescription>Statistik setoran per minggu</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Periode</TableHead>
                        <TableHead className="text-center">Total Setoran</TableHead>
                        <TableHead className="text-center">Total Ayat</TableHead>
                        <TableHead className="text-center">Rata-rata Nilai</TableHead>
                        <TableHead className="text-center">Santri Aktif</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockLaporanMingguan.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.minggu}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{item.totalSetoran}</Badge>
                          </TableCell>
                          <TableCell className="text-center">{item.totalAyat}</TableCell>
                          <TableCell className="text-center font-semibold text-primary">{item.rataRata}</TableCell>
                          <TableCell className="text-center">{item.santriAktif}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Capaian per Juz */}
          <TabsContent value="capaian">
            <Card>
              <CardHeader>
                <CardTitle>Capaian Hafalan per Juz</CardTitle>
                <CardDescription>Progress penyelesaian hafalan santri per juz</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCapaianJuz.map((item) => (
                    <div key={item.juz} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
                            Juz {item.juz}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {item.santriSelesai} dari {item.totalSantri} santri
                          </span>
                        </div>
                        <span className="font-semibold text-primary">{item.persentase}%</span>
                      </div>
                      <Progress value={item.persentase} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rekap Drill Hafalan */}
          <TabsContent value="drill">
            <Card>
              <CardHeader>
                <CardTitle>Rekap Drill Hafalan</CardTitle>
                <CardDescription>Progress drill hafalan per santri (Drill 1, Drill 2, ½ Juz, 1 Juz, Tasmi')</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Santri</TableHead>
                        <TableHead>Halaqoh</TableHead>
                        <TableHead>Kelas</TableHead>
                        <TableHead className="text-center">Drill 1</TableHead>
                        <TableHead className="text-center">Drill 2</TableHead>
                        <TableHead className="text-center">½ Juz</TableHead>
                        <TableHead className="text-center">1 Juz</TableHead>
                        <TableHead className="text-center">Tasmi'</TableHead>
                        <TableHead className="text-center">Nilai</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDrill.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.santri}</TableCell>
                          <TableCell>{item.halaqoh}</TableCell>
                          <TableCell>{item.kelas}</TableCell>
                          <TableCell className="text-center">{getStatusBadge(item.drill1)}</TableCell>
                          <TableCell className="text-center">{getStatusBadge(item.drill2)}</TableCell>
                          <TableCell className="text-center">{getStatusBadge(item.drill12Juz)}</TableCell>
                          <TableCell className="text-center">{getStatusBadge(item.drill1Juz)}</TableCell>
                          <TableCell className="text-center">{getStatusBadge(item.tasmi)}</TableCell>
                          <TableCell className="text-center font-semibold text-primary">{item.nilaiTerakhir}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
          </TabsContent>

          {/* Tilawah Tab */}
          <TabsContent value="tilawah" className="space-y-4 md:space-y-6 mt-4">
            {/* Tilawah Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filter Laporan Tilawah</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Select value={tilawahHalaqoh} onValueChange={setTilawahHalaqoh}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Halaqoh" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Halaqoh</SelectItem>
                      <SelectItem value="Halaqoh 1">Halaqoh 1</SelectItem>
                      <SelectItem value="Halaqoh 2">Halaqoh 2</SelectItem>
                      <SelectItem value="Halaqoh 3">Halaqoh 3</SelectItem>
                      <SelectItem value="Halaqoh 4">Halaqoh 4</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={tilawahKelas} onValueChange={setTilawahKelas}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kelas</SelectItem>
                      {MOCK_KELAS.map((k) => (
                        <SelectItem key={k.id} value={k.id}>
                          {k.nama_kelas}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={tilawahJilid} onValueChange={setTilawahJilid}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Jilid" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Jilid</SelectItem>
                      {TILAWATI_JILID.map((jilid) => (
                        <SelectItem key={jilid.jilid} value={jilid.jilid.toString()}>
                          Jilid {jilid.jilid}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Tilawah Data Table */}
            <Card>
              <CardHeader>
                <CardTitle>Data Laporan Tilawah</CardTitle>
                <CardDescription>Perkembangan tilawah metode Tilawati</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>Nama Santri</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead>Halaqoh</TableHead>
                      <TableHead>Jilid</TableHead>
                      <TableHead>Halaman</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Setoran</TableHead>
                      <TableHead>Nilai</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTilawahSantri.length > 0 ? (
                      filteredTilawahSantri.map((santri, index) => (
                        <TableRow key={santri.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">{santri.nama}</TableCell>
                          <TableCell>{santri.kelas}</TableCell>
                          <TableCell>{santri.halaqoh}</TableCell>
                          <TableCell>
                            <Badge variant="outline">Jilid {santri.jilidSaatIni}</Badge>
                          </TableCell>
                          <TableCell>{santri.halamanSaatIni}/{HALAMAN_PER_JILID}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={santri.progressJilid} className="w-16 h-2" />
                              <span className="text-xs text-muted-foreground">{santri.progressJilid}%</span>
                            </div>
                          </TableCell>
                          <TableCell>{santri.jumlahSetoran}x</TableCell>
                          <TableCell>
                            <Badge variant={santri.rataRataNilai >= 80 ? "default" : santri.rataRataNilai >= 70 ? "secondary" : "outline"}>
                              {santri.rataRataNilai || "-"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                          Belum ada data laporan tilawah
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default LaporanHafalan;
