import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { BookOpen, CalendarIcon, Plus } from "lucide-react";
import { toast } from "sonner";
import { JuzSelector } from "@/components/JuzSelector";
import { getSurahsByJuz, Surah } from "@/lib/quran-data";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

/* ================= MOCK DATA ================= */

const mockSantri = [
  { id: "1", nama: "Muhammad Faiz", nis: "S001", halaqoh: "Halaqoh Al-Azhary" },
  { id: "2", nama: "Fatimah Zahra", nis: "S003", halaqoh: "Halaqoh Al-Furqon" },
  { id: "3", nama: "Aisyah Nur", nis: "S002", halaqoh: "Halaqoh Al-Azhary" },
];

const BATAS_LANCAR_SETORAN = 80;

function tentukanStatusSetoran(nilai: number): "Lancar" | "Kurang" {
  return nilai >= BATAS_LANCAR_SETORAN ? "Lancar" : "Kurang";
}

/* ================= COMPONENT ================= */

const TambahSetoran = () => {
  const [selectedSantri, setSelectedSantri] = useState("");
  const [tanggalSetoran, setTanggalSetoran] = useState<Date>();
  const [juz, setJuz] = useState("");
  const [surah, setSurah] = useState("");
  const [ayatDari, setAyatDari] = useState("1");
  const [ayatSampai, setAyatSampai] = useState("7");
  const [jumlahKesalahan, setJumlahKesalahan] = useState("0");
  const [catatanTajwid, setCatatanTajwid] = useState("");

  const selectedSantriData = mockSantri.find(s => s.id === selectedSantri);

  const surahByJuz: Surah[] = useMemo(() => {
    if (!juz) return [];
    return getSurahsByJuz(Number(juz));
  }, [juz]);

  const selectedSurah = useMemo(() => {
    return surahByJuz.find(s => s.number === Number(surah));
  }, [surah, surahByJuz]);

  const nilaiKelancaran = Math.max(0, 100 - parseInt(jumlahKesalahan || "0"));
  const selisihNilai = Math.max(0, BATAS_LANCAR_SETORAN - nilaiKelancaran);

  const handleSubmit = () => {
    if (!selectedSantri || !tanggalSetoran || !juz || !surah) {
      toast.error("Lengkapi data terlebih dahulu");
      return;
    }

    const nilai = nilaiKelancaran;
    const status = tentukanStatusSetoran(nilai);

    const dataBaru = {
      santriId: selectedSantri,
      tanggal: tanggalSetoran,
      juz,
      surah,
      ayatDari,
      ayatSampai,
      nilai,
      status,
      catatanTajwid,
    };

    console.log("SETORAN BARU:", dataBaru);

    toast.success(
      status === "Lancar"
        ? "✅ Setoran lancar"
        : `⚠️ Setoran kurang ${selisihNilai} poin`
    );

    // reset
    setSelectedSantri("");
    setTanggalSetoran(undefined);
    setJuz("");
    setSurah("");
    setAyatDari("1");
    setAyatSampai("7");
    setJumlahKesalahan("0");
    setCatatanTajwid("");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold">Tambah Setoran Hafalan</h1>
        <p className="text-muted-foreground">Form pencatatan setoran santri</p>
      </div>

      {/* Informasi Santri */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Informasi Santri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Santri *</Label>
              <Select value={selectedSantri} onValueChange={setSelectedSantri}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih santri" />
                </SelectTrigger>
                <SelectContent>
                  {mockSantri.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nama} - {s.nis}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tanggal *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start", !tanggalSetoran && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {tanggalSetoran ? format(tanggalSetoran, "dd/MM/yyyy") : "Pilih tanggal"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={tanggalSetoran}
                    onSelect={setTanggalSetoran}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {selectedSantriData && (
            <div className="p-3 bg-primary/10 rounded border">
              Halaqoh: <b>{selectedSantriData.halaqoh}</b>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Hafalan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Detail Hafalan</CardTitle>
          <CardDescription>Pilih juz, surah dan ayat</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <JuzSelector value={juz} onValueChange={setJuz} required />

          <div className="space-y-2">
            <Label>Surah *</Label>
            <Select value={surah} onValueChange={setSurah} disabled={!juz}>
              <SelectTrigger>
                <SelectValue placeholder={juz ? "Pilih surah" : "Pilih juz dulu"} />
              </SelectTrigger>
              <SelectContent>
                {surahByJuz.map(s => (
                  <SelectItem key={s.number} value={String(s.number)}>
                    {s.number}. {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSurah && (
            <div className="text-sm bg-primary/10 p-2 rounded">
              {selectedSurah.name} – {selectedSurah.numberOfAyahs} ayat
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Ayat dari *</Label>
              <Input
                type="number"
                value={ayatDari}
                min={1}
                max={selectedSurah?.numberOfAyahs}
                onChange={(e) => setAyatDari(e.target.value)}
                disabled={!selectedSurah}
              />
            </div>

            <div className="space-y-1">
              <Label>Ayat sampai *</Label>
              <Input
                type="number"
                value={ayatSampai}
                min={Number(ayatDari)}
                max={selectedSurah?.numberOfAyahs}
                onChange={(e) => setAyatSampai(e.target.value)}
                disabled={!selectedSurah}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Penilaian */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Penilaian</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Jumlah Kesalahan *</Label>
            <Input
              type="number"
              value={jumlahKesalahan}
              min={0}
              onChange={(e) => setJumlahKesalahan(e.target.value)}
            />
          </div>

          <div className="flex justify-between p-3 bg-muted rounded">
            <span>Nilai</span>
            <b>{nilaiKelancaran}</b>
          </div>

          {nilaiKelancaran < BATAS_LANCAR_SETORAN && (
            <p className="text-sm text-yellow-600">
              Kurang {selisihNilai} poin dari batas lancar
            </p>
          )}

          <div className="space-y-2">
            <Label>Catatan Tajwid</Label>
            <Textarea
              value={catatanTajwid}
              onChange={(e) => setCatatanTajwid(e.target.value)}
              placeholder="Catatan perbaikan bacaan..."
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSubmit} className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Simpan Setoran
      </Button>
    </div>
  );
};

export default TambahSetoran;
