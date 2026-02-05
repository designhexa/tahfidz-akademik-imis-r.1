 import { Layout } from "@/components/Layout";
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
 import { Badge } from "@/components/ui/badge";
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { Search, Plus, Award, Clock, FileText } from "lucide-react";
 import { useState } from "react";
 import { 
   MOCK_SANTRI_TILAWAH, 
   TILAWATI_JILID,
   KRITERIA_PENILAIAN,
   KRITERIA_KELULUSAN,
   DURASI_UJIAN,
   NILAI_MINIMUM_LULUS
 } from "@/lib/tilawah-data";
 import { toast } from "sonner";

export default function TilawahUjian() {
  const [search, setSearch] = useState("");
  const [filterHalaqoh, setFilterHalaqoh] = useState("all");
  const [filterKelas, setFilterKelas] = useState("all");
   const [dialogOpen, setDialogOpen] = useState(false);
   
   // Form state
   const [selectedSantri, setSelectedSantri] = useState("");
   const [jilidDari, setJilidDari] = useState("");
   const [jilidTujuan, setJilidTujuan] = useState("");
   
   // Nilai Tartil
   const [tartilTajwid, setTartilTajwid] = useState("");
   const [tartilKalimat, setTartilKalimat] = useState("");
   const [tartilKelancaran, setTartilKelancaran] = useState("");
   const [tartilNafas, setTartilNafas] = useState("");
   const [tartilWaqaf, setTartilWaqaf] = useState("");
   
   // Nilai Fashohah
   const [fashohahMakhraj, setFashohahMakhraj] = useState("");
   const [fashohahShifat, setFashohahShifat] = useState("");
   const [fashohahHarakat, setFashohahHarakat] = useState("");
   const [fashohahSuara, setFashohahSuara] = useState("");
   
   // Nilai Tajwid & Ghorib
   const [tajwidPaham, setTajwidPaham] = useState("");
   const [tajwidUraian, setTajwidUraian] = useState("");
   const [ghoribBaca, setGhoribBaca] = useState("");
   const [ghoribKomentar, setGhoribKomentar] = useState("");
 
   // Mock ujian data
   const mockUjianData = [
     { id: "1", santriId: "s1", nama: "Ahmad Fauzi", kelas: "3A", jilidDari: 1, jilidTujuan: 2, nilaiTotal: 85, status: "lulus" },
     { id: "2", santriId: "s3", nama: "Muhammad Rizki", kelas: "3A", jilidDari: 1, jilidTujuan: 2, nilaiTotal: 72, status: "tidak_lulus" },
     { id: "3", santriId: "s5", nama: "Umar Abdullah", kelas: "4A", jilidDari: 2, jilidTujuan: 3, nilaiTotal: 88, status: "lulus" },
   ];
 
   const getKriteriaByJilid = (jilid: number) => {
     return KRITERIA_KELULUSAN[jilid] || ["tartil", "fashohah", "tajwid_dasar", "ghorib"];
   };
 
   const hitungTotalNilai = () => {
     const jilid = parseInt(jilidDari) || 1;
     const kriteria = getKriteriaByJilid(jilid);
     let total = 0;
     let count = 0;
 
     // Tartil
     if (kriteria.includes("tartil")) {
       const tartil = [tartilTajwid, tartilKalimat, tartilKelancaran, tartilNafas, tartilWaqaf]
         .filter(v => v !== "")
         .map(v => parseInt(v) || 0);
       if (tartil.length > 0) {
         total += tartil.reduce((a, b) => a + b, 0) / tartil.length;
         count++;
       }
     }
 
     // Fashohah
     if (kriteria.includes("fashohah")) {
       const fashohah = [fashohahMakhraj, fashohahShifat, fashohahHarakat, fashohahSuara]
         .filter(v => v !== "")
         .map(v => parseInt(v) || 0);
       if (fashohah.length > 0) {
         total += fashohah.reduce((a, b) => a + b, 0) / fashohah.length;
         count++;
       }
     }
 
     // Tajwid
     if (kriteria.includes("tajwid_dasar")) {
       const tajwid = [tajwidPaham, tajwidUraian]
         .filter(v => v !== "")
         .map(v => parseInt(v) || 0);
       if (tajwid.length > 0) {
         total += tajwid.reduce((a, b) => a + b, 0) / tajwid.length;
         count++;
       }
     }
 
     // Ghorib
     if (kriteria.includes("ghorib")) {
       const ghorib = [ghoribBaca, ghoribKomentar]
         .filter(v => v !== "")
         .map(v => parseInt(v) || 0);
       if (ghorib.length > 0) {
         total += ghorib.reduce((a, b) => a + b, 0) / ghorib.length;
         count++;
       }
     }
 
     return count > 0 ? Math.round(total / count) : 0;
   };
 
   const handleSubmit = () => {
     if (!selectedSantri || !jilidDari || !jilidTujuan) {
       toast.error("Lengkapi data ujian");
       return;
     }
 
     const totalNilai = hitungTotalNilai();
     const lulus = totalNilai >= NILAI_MINIMUM_LULUS;
 
     toast.success(`Ujian berhasil disimpan. Nilai: ${totalNilai} - ${lulus ? "LULUS" : "TIDAK LULUS"}`);
     setDialogOpen(false);
     resetForm();
   };
 
   const resetForm = () => {
     setSelectedSantri("");
     setJilidDari("");
     setJilidTujuan("");
     setTartilTajwid("");
     setTartilKalimat("");
     setTartilKelancaran("");
     setTartilNafas("");
     setTartilWaqaf("");
     setFashohahMakhraj("");
     setFashohahShifat("");
     setFashohahHarakat("");
     setFashohahSuara("");
     setTajwidPaham("");
     setTajwidUraian("");
     setGhoribBaca("");
     setGhoribKomentar("");
   };
 
   const kriteriaPenilaian = jilidDari ? getKriteriaByJilid(parseInt(jilidDari)) : [];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Ujian Tilawah Semester</h1>
             <p className="text-muted-foreground text-sm mt-1">Kelola ujian kenaikan jilid metode Tilawati</p>
          </div>
           <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
             <DialogTrigger asChild>
               <Button>
                 <Plus className="w-4 h-4 mr-2" />
                 Tambah Ujian
               </Button>
             </DialogTrigger>
             <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
               <DialogHeader>
                 <DialogTitle className="flex items-center gap-2">
                   <Award className="w-5 h-5" />
                   Ujian Kenaikan Jilid
                 </DialogTitle>
               </DialogHeader>
               
               <div className="space-y-4 pt-4">
                 {/* Info Ujian */}
                 <Card className="bg-muted/50">
                   <CardContent className="pt-4">
                     <div className="flex items-center gap-4 text-sm">
                       <div className="flex items-center gap-2">
                         <Clock className="w-4 h-4 text-muted-foreground" />
                         <span>Durasi: {DURASI_UJIAN} menit per santri</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <FileText className="w-4 h-4 text-muted-foreground" />
                         <span>Nilai Minimum Lulus: {NILAI_MINIMUM_LULUS}</span>
                       </div>
                     </div>
                   </CardContent>
                 </Card>
 
                 {/* Pilih Santri & Jilid */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="space-y-2">
                     <Label>Pilih Santri</Label>
                     <Select value={selectedSantri} onValueChange={setSelectedSantri}>
                       <SelectTrigger>
                         <SelectValue placeholder="Pilih santri..." />
                       </SelectTrigger>
                       <SelectContent>
                         {MOCK_SANTRI_TILAWAH.map((santri) => (
                           <SelectItem key={santri.id} value={santri.id}>
                             {santri.nama} - {santri.kelas}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>
                   <div className="space-y-2">
                     <Label>Jilid Saat Ini</Label>
                     <Select value={jilidDari} onValueChange={(v) => {
                       setJilidDari(v);
                       setJilidTujuan((parseInt(v) + 1).toString());
                     }}>
                       <SelectTrigger>
                         <SelectValue placeholder="Pilih jilid..." />
                       </SelectTrigger>
                       <SelectContent>
                         {TILAWATI_JILID.map((jilid) => (
                           <SelectItem key={jilid.jilid} value={jilid.jilid.toString()}>
                             Jilid {jilid.jilid}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>
                   <div className="space-y-2">
                     <Label>Naik ke Jilid</Label>
                     <Select value={jilidTujuan} onValueChange={setJilidTujuan}>
                       <SelectTrigger>
                         <SelectValue placeholder="Jilid tujuan..." />
                       </SelectTrigger>
                       <SelectContent>
                         {TILAWATI_JILID.filter(j => j.jilid > parseInt(jilidDari || "0")).map((jilid) => (
                           <SelectItem key={jilid.jilid} value={jilid.jilid.toString()}>
                             Jilid {jilid.jilid}
                           </SelectItem>
                         ))}
                         <SelectItem value="7">Al-Qur'an</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                 </div>
 
                 {/* Kriteria Penilaian Info */}
                 {jilidDari && (
                   <Card className="border-primary/30">
                     <CardHeader className="pb-2">
                       <CardTitle className="text-base">Kriteria Penilaian Jilid {jilidDari}</CardTitle>
                       <CardDescription>
                         {parseInt(jilidDari) <= 3 
                           ? "Jilid 1-3: Fokus pada Fashohah & Tartil"
                           : parseInt(jilidDari) <= 5
                           ? "Jilid 4-5: Tartil, Fashohah & Tajwid Dasar"
                           : "Jilid 6: Penilaian lengkap termasuk Ghoribul Qur'an"}
                       </CardDescription>
                     </CardHeader>
                   </Card>
                 )}
 
                 {/* Tabs Penilaian */}
                 <Tabs defaultValue="tartil" className="w-full">
                   <TabsList className="grid w-full grid-cols-4">
                     <TabsTrigger value="tartil" disabled={!kriteriaPenilaian.includes("tartil")}>
                       Tartil
                     </TabsTrigger>
                     <TabsTrigger value="fashohah" disabled={!kriteriaPenilaian.includes("fashohah")}>
                       Fashohah
                     </TabsTrigger>
                     <TabsTrigger value="tajwid" disabled={!kriteriaPenilaian.includes("tajwid_dasar")}>
                       Tajwid
                     </TabsTrigger>
                     <TabsTrigger value="ghorib" disabled={!kriteriaPenilaian.includes("ghorib")}>
                       Ghorib
                     </TabsTrigger>
                   </TabsList>
 
                   <TabsContent value="tartil" className="mt-4">
                     <Card>
                       <CardHeader className="pb-3">
                         <CardTitle className="text-sm">Penilaian Tartil</CardTitle>
                         <CardDescription>Kesempurnaan bacaan, kelancaran, dan ketertiban</CardDescription>
                       </CardHeader>
                       <CardContent className="space-y-3">
                         <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                             <Label className="text-xs">Kesempurnaan Tajwid (0-100)</Label>
                             <Input type="number" min={0} max={100} value={tartilTajwid} onChange={(e) => setTartilTajwid(e.target.value)} />
                           </div>
                           <div className="space-y-2">
                             <Label className="text-xs">Kesempurnaan Kalimat (0-100)</Label>
                             <Input type="number" min={0} max={100} value={tartilKalimat} onChange={(e) => setTartilKalimat(e.target.value)} />
                           </div>
                           <div className="space-y-2">
                             <Label className="text-xs">Kelancaran (0-100)</Label>
                             <Input type="number" min={0} max={100} value={tartilKelancaran} onChange={(e) => setTartilKelancaran(e.target.value)} />
                           </div>
                           <div className="space-y-2">
                             <Label className="text-xs">Nafas (0-100)</Label>
                             <Input type="number" min={0} max={100} value={tartilNafas} onChange={(e) => setTartilNafas(e.target.value)} />
                           </div>
                           <div className="space-y-2 col-span-2">
                             <Label className="text-xs">Waqaf (0-100)</Label>
                             <Input type="number" min={0} max={100} value={tartilWaqaf} onChange={(e) => setTartilWaqaf(e.target.value)} />
                           </div>
                         </div>
                       </CardContent>
                     </Card>
                   </TabsContent>
 
                   <TabsContent value="fashohah" className="mt-4">
                     <Card>
                       <CardHeader className="pb-3">
                         <CardTitle className="text-sm">Penilaian Fashohah</CardTitle>
                         <CardDescription>Kesempurnaan makhorijul huruf dan shifatul huruf</CardDescription>
                       </CardHeader>
                       <CardContent className="space-y-3">
                         <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                             <Label className="text-xs">Makhorijul Huruf (0-100)</Label>
                             <Input type="number" min={0} max={100} value={fashohahMakhraj} onChange={(e) => setFashohahMakhraj(e.target.value)} />
                           </div>
                           <div className="space-y-2">
                             <Label className="text-xs">Shifatul Huruf (0-100)</Label>
                             <Input type="number" min={0} max={100} value={fashohahShifat} onChange={(e) => setFashohahShifat(e.target.value)} />
                           </div>
                           <div className="space-y-2">
                             <Label className="text-xs">Harakat Tidak Imalah (0-100)</Label>
                             <Input type="number" min={0} max={100} value={fashohahHarakat} onChange={(e) => setFashohahHarakat(e.target.value)} />
                           </div>
                           <div className="space-y-2">
                             <Label className="text-xs">Suara Jelas (0-100)</Label>
                             <Input type="number" min={0} max={100} value={fashohahSuara} onChange={(e) => setFashohahSuara(e.target.value)} />
                           </div>
                         </div>
                       </CardContent>
                     </Card>
                   </TabsContent>
 
                   <TabsContent value="tajwid" className="mt-4">
                     <Card>
                       <CardHeader className="pb-3">
                         <CardTitle className="text-sm">Penilaian Tajwid Dasar</CardTitle>
                         <CardDescription>Pemahaman dan kemampuan menguraikan hukum tajwid</CardDescription>
                       </CardHeader>
                       <CardContent className="space-y-3">
                         <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                             <Label className="text-xs">Paham Hukum Tajwid (0-100)</Label>
                             <Input type="number" min={0} max={100} value={tajwidPaham} onChange={(e) => setTajwidPaham(e.target.value)} />
                           </div>
                           <div className="space-y-2">
                             <Label className="text-xs">Mampu Menguraikan (0-100)</Label>
                             <Input type="number" min={0} max={100} value={tajwidUraian} onChange={(e) => setTajwidUraian(e.target.value)} />
                           </div>
                         </div>
                       </CardContent>
                     </Card>
                   </TabsContent>
 
                   <TabsContent value="ghorib" className="mt-4">
                     <Card>
                       <CardHeader className="pb-3">
                         <CardTitle className="text-sm">Penilaian Ghoribul Qur'an</CardTitle>
                         <CardDescription>Kemampuan membaca dan memahami bacaan ghorib</CardDescription>
                       </CardHeader>
                       <CardContent className="space-y-3">
                         <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                             <Label className="text-xs">Membaca Ghorib (0-100)</Label>
                             <Input type="number" min={0} max={100} value={ghoribBaca} onChange={(e) => setGhoribBaca(e.target.value)} />
                           </div>
                           <div className="space-y-2">
                             <Label className="text-xs">Komentar Ghorib (0-100)</Label>
                             <Input type="number" min={0} max={100} value={ghoribKomentar} onChange={(e) => setGhoribKomentar(e.target.value)} />
                           </div>
                         </div>
                       </CardContent>
                     </Card>
                   </TabsContent>
                 </Tabs>
 
                 {/* Total Nilai */}
                 <Card className="bg-primary/5 border-primary/20">
                   <CardContent className="pt-4">
                     <div className="flex items-center justify-between">
                       <div>
                         <p className="text-sm text-muted-foreground">Total Nilai</p>
                         <p className="text-3xl font-bold">{hitungTotalNilai()}</p>
                       </div>
                       <Badge 
                         variant={hitungTotalNilai() >= NILAI_MINIMUM_LULUS ? "default" : "destructive"}
                         className="text-lg px-4 py-2"
                       >
                         {hitungTotalNilai() >= NILAI_MINIMUM_LULUS ? "LULUS" : "TIDAK LULUS"}
                       </Badge>
                     </div>
                   </CardContent>
                 </Card>
 
                 <div className="flex justify-end gap-2 pt-4">
                   <Button variant="outline" onClick={() => setDialogOpen(false)}>
                     Batal
                   </Button>
                   <Button onClick={handleSubmit}>
                     Simpan Hasil Ujian
                   </Button>
                 </div>
               </div>
             </DialogContent>
           </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Ujian Tilawah</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cari santri..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterHalaqoh} onValueChange={setFilterHalaqoh}>
                <SelectTrigger className="w-full sm:w-48">
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
              <Select value={filterKelas} onValueChange={setFilterKelas}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Pilih Kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kelas</SelectItem>
                   <SelectItem value="3A">3A</SelectItem>
                   <SelectItem value="3B">3B</SelectItem>
                   <SelectItem value="4A">4A</SelectItem>
                   <SelectItem value="4B">4B</SelectItem>
                   <SelectItem value="5A">5A</SelectItem>
                   <SelectItem value="5B">5B</SelectItem>
                   <SelectItem value="6A">6A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Nama Santri</TableHead>
                  <TableHead>Kelas</TableHead>
                   <TableHead>Jilid Dari</TableHead>
                   <TableHead>Naik ke</TableHead>
                   <TableHead>Nilai Total</TableHead>
                   <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 {mockUjianData.length > 0 ? (
                   mockUjianData.map((ujian, index) => (
                     <TableRow key={ujian.id}>
                       <TableCell>{index + 1}</TableCell>
                       <TableCell className="font-medium">{ujian.nama}</TableCell>
                       <TableCell>{ujian.kelas}</TableCell>
                       <TableCell>Jilid {ujian.jilidDari}</TableCell>
                       <TableCell>{ujian.jilidTujuan <= 6 ? `Jilid ${ujian.jilidTujuan}` : "Al-Qur'an"}</TableCell>
                       <TableCell className="font-bold">{ujian.nilaiTotal}</TableCell>
                       <TableCell>
                         <Badge variant={ujian.status === "lulus" ? "default" : "destructive"}>
                           {ujian.status === "lulus" ? "Lulus" : "Tidak Lulus"}
                         </Badge>
                       </TableCell>
                     </TableRow>
                   ))
                 ) : (
                   <TableRow>
                     <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                       Belum ada data ujian tilawah
                     </TableCell>
                   </TableRow>
                 )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
