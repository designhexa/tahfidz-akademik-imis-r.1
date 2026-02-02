import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Award, 
  Plus,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  User,
  Image,
  Users
} from "lucide-react";
import { getJuzName } from "@/lib/quran-data";
import { JuzSelector } from "@/components/JuzSelector";
import { supabase } from "@/integrations/supabase/client";
import { TasmiCandidateCard } from "@/components/tasmi/TasmiCandidateCard";
import { mockSantriProgress, getNextTasmiJuz } from "@/lib/target-hafalan";

const JUZ_ORDER = [30, 29, 28, 27, 26, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];

const getPredikat = (nilai: number): { label: string; color: string; passed: boolean } => {
  if (nilai >= 96) return { label: "Mumtaz Murtafi'", color: "bg-emerald-500", passed: true };
  if (nilai >= 90) return { label: "Mumtaz", color: "bg-green-500", passed: true };
  if (nilai >= 76) return { label: "Jayyid Jiddan", color: "bg-blue-500", passed: true };
  if (nilai >= 70) return { label: "Jayyid", color: "bg-amber-500", passed: true };
  return { label: "Tidak Lulus", color: "bg-red-500", passed: false };
};

interface Halaqoh {
  id: string;
  nama_halaqoh: string;
}

interface Kelas {
  id: string;
  nama_kelas: string;
}

const dummySantri = [
  { id: "1", nama: "Ahmad Fauzi", halaqoh: "Halaqoh Al-Fatih", kelas: "Paket A Kelas 6", juzSelesai: [30, 29] },
  { id: "2", nama: "Muhammad Rizki", halaqoh: "Halaqoh Al-Fatih", kelas: "Paket A Kelas 6", juzSelesai: [30] },
  { id: "3", nama: "Abdullah Hakim", halaqoh: "Halaqoh An-Nur", kelas: "KBTK A", juzSelesai: [] },
];

const dummyHasilUjian = [
  { id: "1", santriId: "1", santriNama: "Ahmad Fauzi", juz: 30, tanggal: "2025-01-05", nilaiTotal: 92, predikat: "Mumtaz", status: "Lulus", penguji: "Ustadz Ahmad", catatanPerHalaman: [], catatanUmum: "Bagus" },
  { id: "2", santriId: "1", santriNama: "Ahmad Fauzi", juz: 29, tanggal: "2025-01-06", nilaiTotal: 88, predikat: "Jayyid Jiddan", status: "Lulus", penguji: "Ustadz Ahmad", catatanPerHalaman: [], catatanUmum: "Perlu lebih lancar" },
];

interface PenilaianHalaman { halaman: number; pancingan: number; catatan: string; }
interface PenilaianJuz { juz: number; halaman: PenilaianHalaman[]; catatanJuz: string; }

const UjianTasmi = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isForm5JuzOpen, setIsForm5JuzOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedUjian, setSelectedUjian] = useState<typeof dummyHasilUjian[0] | null>(null);
  const [expandedRules, setExpandedRules] = useState(false);
  
  const [selectedSantri, setSelectedSantri] = useState("");
  const [selectedJuz, setSelectedJuz] = useState("");
  const [penilaianHalaman, setPenilaianHalaman] = useState<PenilaianHalaman[]>(Array.from({ length: 20 }, (_, i) => ({ halaman: i + 1, pancingan: 0, catatan: "" })));
  const [catatanUmum, setCatatanUmum] = useState("");
  const [diberhentikan, setDiberhentikan] = useState(false);

  const [selectedSantri5Juz, setSelectedSantri5Juz] = useState("");
  const [selectedJuzList, setSelectedJuzList] = useState<number[]>([]);
  const [penilaian5Juz, setPenilaian5Juz] = useState<PenilaianJuz[]>([]);
  const [catatanUmum5Juz, setCatatanUmum5Juz] = useState("");
  const [diberhentikan5Juz, setDiberhentikan5Juz] = useState(false);

  const handleSelectJuz5Juz = (juzIndex: number, juzValue: string) => {
    const newJuzList = [...selectedJuzList];
    newJuzList[juzIndex] = parseInt(juzValue);
    setSelectedJuzList(newJuzList);
    const newPenilaian = [...penilaian5Juz];
    newPenilaian[juzIndex] = { juz: parseInt(juzValue), halaman: Array.from({ length: 20 }, (_, i) => ({ halaman: i + 1, pancingan: 0, catatan: "" })), catatanJuz: "" };
    setPenilaian5Juz(newPenilaian);
  };

  const hitungNilaiTotal = () => penilaianHalaman.reduce((t, h) => t + Math.max(0, 5 - h.pancingan), 0);
  const hitungNilaiTotal5Juz = () => penilaian5Juz.reduce((t, j) => t + j.halaman.reduce((th, h) => th + Math.max(0, 5 - h.pancingan), 0), 0);
  const getMaxScore5Juz = () => penilaian5Juz.length * 100;
  const hitungPersentase5Juz = () => getMaxScore5Juz() === 0 ? 0 : Math.round((hitungNilaiTotal5Juz() / getMaxScore5Juz()) * 100);

  const nilaiTotal = hitungNilaiTotal();
  const predikat = getPredikat(nilaiTotal);
  const nilaiTotal5Juz = hitungPersentase5Juz();
  const predikat5Juz = getPredikat(nilaiTotal5Juz);

  const resetForm1Juz = () => { setSelectedSantri(""); setSelectedJuz(""); setPenilaianHalaman(Array.from({ length: 20 }, (_, i) => ({ halaman: i + 1, pancingan: 0, catatan: "" }))); setCatatanUmum(""); setDiberhentikan(false); };
  const resetForm5Juz = () => { setSelectedSantri5Juz(""); setSelectedJuzList([]); setPenilaian5Juz([]); setCatatanUmum5Juz(""); setDiberhentikan5Juz(false); };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Award className="w-7 h-7 text-amber-500" />
              Ujian Tasmi'
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Ujian hafalan 1 juz atau 5 juz penuh</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                  <Plus className="w-4 h-4 mr-2" />Tasmi' 1 Juz
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle className="flex items-center gap-2"><Award className="w-5 h-5 text-amber-500" />Form Ujian Tasmi' (1 Juz)</DialogTitle></DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Santri</Label><Select value={selectedSantri} onValueChange={setSelectedSantri}><SelectTrigger><SelectValue placeholder="Pilih santri" /></SelectTrigger><SelectContent>{dummySantri.map((s) => (<SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>))}</SelectContent></Select></div>
                    <JuzSelector value={selectedJuz} onValueChange={setSelectedJuz} label="Juz" required />
                  </div>
                  <Card className={`${predikat.passed ? 'border-green-500/50 bg-green-500/5' : 'border-red-500/50 bg-red-500/5'}`}><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Nilai Total</p><p className="text-3xl font-bold">{nilaiTotal}</p></div><div className="text-right"><p className="text-sm text-muted-foreground">Predikat</p><Badge className={`${predikat.color} text-white`}>{predikat.label}</Badge></div></div></CardContent></Card>
                  <div className="space-y-3"><Label className="text-base font-semibold">Penilaian Per Halaman</Label><p className="text-xs text-muted-foreground">Nilai per halaman: 5 poin. Maks 5 pancingan/halaman.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-5 gap-2">{penilaianHalaman.map((h, idx) => (<div key={idx} className="flex items-center gap-1.5 p-1.5 border rounded-md bg-card"><span className="text-xs font-medium whitespace-nowrap">Hal {h.halaman} <span className="text-muted-foreground">({Math.max(0, 5 - h.pancingan)})</span></span><div className="flex items-center gap-0.5 ml-auto"><Button type="button" variant="outline" size="sm" className="h-6 w-6 p-0 text-xs" onClick={() => { const n = [...penilaianHalaman]; n[idx].pancingan = Math.max(0, n[idx].pancingan - 1); setPenilaianHalaman(n); }}>-</Button><span className="w-5 text-center text-xs font-medium">{h.pancingan}</span><Button type="button" variant="outline" size="sm" className="h-6 w-6 p-0 text-xs" onClick={() => { const n = [...penilaianHalaman]; n[idx].pancingan = Math.min(5, n[idx].pancingan + 1); setPenilaianHalaman(n); }}>+</Button></div></div>))}</div>
                  </div>
                  <div className="space-y-2"><Label>Catatan Tajwid</Label><Textarea placeholder="Catatan perbaikan..." value={catatanUmum} onChange={(e) => setCatatanUmum(e.target.value)} rows={3} /></div>
                  <Card className="border-red-500/30 bg-red-500/5"><CardContent className="p-4"><div className="flex items-start gap-3"><input type="checkbox" id="diberhentikan" checked={diberhentikan} onChange={(e) => setDiberhentikan(e.target.checked)} className="mt-1" /><div><Label htmlFor="diberhentikan" className="text-red-600 font-medium cursor-pointer">Santri Diberhentikan</Label><p className="text-xs text-muted-foreground mt-1">Centang jika santri harus mengulang.</p></div></div></CardContent></Card>
                  <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setIsFormOpen(false)}>Batal</Button><Button onClick={() => { setIsFormOpen(false); resetForm1Juz(); }} className="bg-gradient-to-r from-amber-500 to-orange-500" disabled={!selectedSantri || !selectedJuz}>Simpan</Button></div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isForm5JuzOpen} onOpenChange={setIsForm5JuzOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-purple-500 text-purple-600 hover:bg-purple-50"><Plus className="w-4 h-4 mr-2" />Tasmi' 5 Juz</Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle className="flex items-center gap-2"><Award className="w-5 h-5 text-purple-500" />Form Ujian Tasmi' (5 Juz)</DialogTitle></DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2"><Label>Santri</Label><Select value={selectedSantri5Juz} onValueChange={setSelectedSantri5Juz}><SelectTrigger><SelectValue placeholder="Pilih santri" /></SelectTrigger><SelectContent>{dummySantri.map((s) => (<SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>))}</SelectContent></Select></div>
                  <Card className={`${predikat5Juz.passed ? 'border-green-500/50 bg-green-500/5' : 'border-red-500/50 bg-red-500/5'}`}><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Nilai Total</p><p className="text-3xl font-bold">{hitungNilaiTotal5Juz()} <span className="text-lg text-muted-foreground">/ {getMaxScore5Juz()}</span></p><p className="text-xs text-muted-foreground">Persentase: {nilaiTotal5Juz}%</p></div><div className="text-right"><p className="text-sm text-muted-foreground">Predikat</p><Badge className={`${predikat5Juz.color} text-white`}>{predikat5Juz.label}</Badge></div></div></CardContent></Card>
                  <div className="space-y-3"><Label className="text-base font-semibold">Penilaian Per Juz</Label>
                    <Accordion type="multiple" className="space-y-2">
                      {[0, 1, 2, 3, 4].map((juzIndex) => (
                        <AccordionItem key={juzIndex} value={`juz-${juzIndex}`} className="border rounded-lg px-4">
                          <AccordionTrigger className="hover:no-underline"><div className="flex items-center gap-3"><Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">Juz {juzIndex + 1}</Badge>{selectedJuzList[juzIndex] ? <span className="text-sm font-medium">{getJuzName(selectedJuzList[juzIndex])}{penilaian5Juz[juzIndex] && <span className="text-muted-foreground ml-2">(Nilai: {penilaian5Juz[juzIndex].halaman.reduce((t, h) => t + Math.max(0, 5 - h.pancingan), 0)}/100)</span>}</span> : <span className="text-sm text-muted-foreground">Pilih juz...</span>}</div></AccordionTrigger>
                          <AccordionContent className="pt-4 space-y-4">
                            <JuzSelector value={selectedJuzList[juzIndex]?.toString() || ""} onValueChange={(v) => handleSelectJuz5Juz(juzIndex, v)} label="Pilih Juz" />
                            {penilaian5Juz[juzIndex] && (<><div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-5 gap-2">{penilaian5Juz[juzIndex].halaman.map((h, hIdx) => (<div key={hIdx} className="flex items-center gap-1.5 p-1.5 border rounded-md bg-card"><span className="text-xs font-medium whitespace-nowrap">Hal {h.halaman} <span className="text-muted-foreground">({Math.max(0, 5 - h.pancingan)})</span></span><div className="flex items-center gap-0.5 ml-auto"><Button type="button" variant="outline" size="sm" className="h-6 w-6 p-0 text-xs" onClick={() => { const n = [...penilaian5Juz]; n[juzIndex].halaman[hIdx].pancingan = Math.max(0, n[juzIndex].halaman[hIdx].pancingan - 1); setPenilaian5Juz(n); }}>-</Button><span className="w-5 text-center text-xs font-medium">{h.pancingan}</span><Button type="button" variant="outline" size="sm" className="h-6 w-6 p-0 text-xs" onClick={() => { const n = [...penilaian5Juz]; n[juzIndex].halaman[hIdx].pancingan = Math.min(5, n[juzIndex].halaman[hIdx].pancingan + 1); setPenilaian5Juz(n); }}>+</Button></div></div>))}</div><div className="space-y-2"><Label>Catatan {getJuzName(selectedJuzList[juzIndex])}</Label><Textarea placeholder="Catatan tajwid..." value={penilaian5Juz[juzIndex].catatanJuz} onChange={(e) => { const n = [...penilaian5Juz]; n[juzIndex].catatanJuz = e.target.value; setPenilaian5Juz(n); }} rows={2} /></div></>)}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                  <div className="space-y-2"><Label>Catatan Umum</Label><Textarea placeholder="Catatan umum..." value={catatanUmum5Juz} onChange={(e) => setCatatanUmum5Juz(e.target.value)} rows={3} /></div>
                  <Card className="border-red-500/30 bg-red-500/5"><CardContent className="p-4"><div className="flex items-start gap-3"><input type="checkbox" id="diberhentikan5juz" checked={diberhentikan5Juz} onChange={(e) => setDiberhentikan5Juz(e.target.checked)} className="mt-1" /><div><Label htmlFor="diberhentikan5juz" className="text-red-600 font-medium cursor-pointer">Santri Diberhentikan</Label></div></div></CardContent></Card>
                  <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setIsForm5JuzOpen(false)}>Batal</Button><Button onClick={() => { setIsForm5JuzOpen(false); resetForm5Juz(); }} className="bg-gradient-to-r from-purple-500 to-pink-500" disabled={!selectedSantri5Juz || penilaian5Juz.length === 0}>Simpan 5 Juz</Button></div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpandedRules(!expandedRules)}>
            <div className="flex items-center justify-between"><CardTitle className="text-base flex items-center gap-2"><AlertCircle className="w-4 h-4 text-amber-500" />Ketentuan Ujian Tasmi'</CardTitle>{expandedRules ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</div>
          </CardHeader>
          {expandedRules && (<CardContent className="text-sm space-y-4"><div><h4 className="font-semibold mb-2">📚 Urutan Juz:</h4><p className="text-muted-foreground">Juz 30 → 29 → 28 → 27 → 26, lalu Juz 1 → 2 → 3 dst...</p></div><div><h4 className="font-semibold mb-2">🏆 Kriteria:</h4><div className="grid grid-cols-2 sm:grid-cols-5 gap-2"><Badge className="bg-emerald-500 text-white justify-center">96-100: Mumtaz Murtafi'</Badge><Badge className="bg-green-500 text-white justify-center">90-95: Mumtaz</Badge><Badge className="bg-blue-500 text-white justify-center">76-89: Jayyid Jiddan</Badge><Badge className="bg-amber-500 text-white justify-center">70-75: Jayyid</Badge><Badge className="bg-red-500 text-white justify-center">&lt;70: Tidak Lulus</Badge></div></div></CardContent>)}
        </Card>

        {/* Tabs untuk Calon Tasmi dan Riwayat */}
        <Tabs defaultValue="candidates" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="candidates">
              <Users className="w-4 h-4 mr-2" />
              Calon Peserta
            </TabsTrigger>
            <TabsTrigger value="history">
              <FileText className="w-4 h-4 mr-2" />
              Riwayat Ujian
            </TabsTrigger>
            <TabsTrigger value="generate">
              <Image className="w-4 h-4 mr-2" />
              Generate Gambar
            </TabsTrigger>
          </TabsList>

          {/* Calon Peserta Tasmi' */}
          <TabsContent value="candidates" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Calon Peserta Ujian Tasmi'
                </CardTitle>
                <CardDescription>
                  Santri yang telah menyelesaikan drill dan siap mengikuti ujian
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">No</TableHead>
                        <TableHead>Nama Lengkap</TableHead>
                        <TableHead>Kelas</TableHead>
                        <TableHead className="text-center">Jumlah Hafalan</TableHead>
                        <TableHead className="text-center">Juz Berikutnya</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockSantriProgress
                        .filter(s => s.eligibleForTasmi)
                        .map((student, index) => {
                          const nextJuz = getNextTasmiJuz(student.juzSelesai);
                          return (
                            <TableRow key={student.id}>
                              <TableCell className="font-medium">{index + 1}</TableCell>
                              <TableCell className="font-medium">{student.nama}</TableCell>
                              <TableCell>{student.kelas}</TableCell>
                              <TableCell className="text-center">
                                <Badge variant="secondary">{student.jumlahJuzHafal} Juz</Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                {nextJuz ? (
                                  <Badge className="bg-amber-500 hover:bg-amber-600 text-white">
                                    Juz {nextJuz}
                                  </Badge>
                                ) : (
                                  <Badge className="bg-emerald-500 text-white">Khatam!</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline" className="border-primary text-primary">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Siap Ujian
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Riwayat Ujian */}
          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Riwayat Ujian Tasmi'
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Santri</TableHead>
                        <TableHead>Juz</TableHead>
                        <TableHead className="text-center">Nilai</TableHead>
                        <TableHead className="text-center">Predikat</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dummyHasilUjian.map((ujian) => {
                        const pred = getPredikat(ujian.nilaiTotal);
                        return (
                          <TableRow key={ujian.id}>
                            <TableCell className="whitespace-nowrap">
                              {new Date(ujian.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </TableCell>
                            <TableCell className="font-medium">{ujian.santriNama}</TableCell>
                            <TableCell>{getJuzName(ujian.juz)}</TableCell>
                            <TableCell className="text-center font-bold">{ujian.nilaiTotal}</TableCell>
                            <TableCell className="text-center">
                              <Badge className={`${pred.color} text-white`}>{ujian.predikat}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              {pred.passed ? (
                                <Badge variant="outline" className="border-green-500 text-green-600">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />Lulus
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="border-red-500 text-red-600">
                                  <XCircle className="w-3 h-3 mr-1" />Tidak Lulus
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Generate Gambar */}
          <TabsContent value="generate" className="mt-4">
            <TasmiCandidateCard
              candidates={mockSantriProgress
                .filter(s => s.eligibleForTasmi)
                .map((s, i) => {
                  const nextJuz = getNextTasmiJuz(s.juzSelesai);
                  return {
                    no: i + 1,
                    nama: s.nama,
                    kelas: s.kelasNumber,
                    jumlahHafalan: `${s.jumlahJuzHafal} Juz`,
                    juzDiujikan: nextJuz 
                      ? s.juzSelesai.length >= 5 
                        ? `Juz ${s.juzSelesai.slice(-5).join('-')}`
                        : `Juz ${nextJuz}`
                      : "Khatam"
                  };
                })}
            />
          </TabsContent>
        </Tabs>

        {/* Progress Per Santri */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5" />
              Progress Tasmi' Per Santri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dummySantri.map((santri) => (
                <Card key={santri.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{santri.nama}</h4>
                        <p className="text-xs text-muted-foreground">{santri.halaqoh}</p>
                      </div>
                      <Badge variant="outline">{santri.juzSelesai.length} Juz Lulus</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {JUZ_ORDER.slice(0, 10).map((juz) => {
                        const selesai = santri.juzSelesai.includes(juz);
                        return (
                          <div
                            key={juz}
                            className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium ${
                              selesai ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            }`}
                            title={`Juz ${juz}`}
                          >
                            {juz}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default UjianTasmi;
