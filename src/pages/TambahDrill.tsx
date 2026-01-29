import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Plus, X, Lock, CheckCircle, AlertCircle, CalendarIcon } from "lucide-react";
import { JuzSelector } from "@/components/JuzSelector";
import { getSurahsByJuz, Surah } from "@/lib/quran-data";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* =======================
   Mock data (sementara)
======================= */

const mockSantri = [
  { id: "1", nama: "Muhammad Faiz" },
  { id: "2", nama: "Fatimah Zahra" },
  { id: "3", nama: "Aisyah Nur" },
];

const drillLevels = [
  { id: "drill1", name: "Drill 1", icon: "📘" },
  { id: "drill2", name: "Drill 2", icon: "📗" },
  { id: "drillHalfJuz", name: "Drill ½ Juz", icon: "📙" },
  { id: "drillFirstHalf", name: "½ Juz Pertama", icon: "📕" },
  { id: "drillSecondHalf", name: "½ Juz Kedua", icon: "📓" },
  { id: "tasmi1Juz", name: "Tasmi' 1 Juz", icon: "🏆" },
];

const BATAS_LULUS = 88;

/* =======================
   Types
======================= */

interface DrillSurahEntry {
  id: string;
  surahNumber: number;
  surahName: string;
  ayatDari: number;
  ayatSampai: number;
}

/* =======================
   Component
======================= */

const TambahDrill = () => {
  const [selectedSantri, setSelectedSantri] = useState("");
  const [tanggalDrill, setTanggalDrill] = useState<Date>();
  const [juz, setJuz] = useState("");
  const [drillLevel, setDrillLevel] = useState("");
  const [jumlahKesalahan, setJumlahKesalahan] = useState("0");
  const [catatanTajwid, setCatatanTajwid] = useState("");

  const [surahEntries, setSurahEntries] = useState<DrillSurahEntry[]>([
    { id: "1", surahNumber: 0, surahName: "", ayatDari: 1, ayatSampai: 7 },
  ]);

  const surahByJuz: Surah[] = useMemo(() => {
    if (!juz) return [];
    return getSurahsByJuz(Number(juz));
  }, [juz]);

  const nilaiKelancaran = Math.max(0, 100 - parseInt(jumlahKesalahan || "0"));

  const handleAddSurahEntry = () => {
    setSurahEntries((prev) => [
      ...prev,
      { id: Date.now().toString(), surahNumber: 0, surahName: "", ayatDari: 1, ayatSampai: 7 },
    ]);
  };

  const handleRemoveSurahEntry = (id: string) => {
    if (surahEntries.length > 1) {
      setSurahEntries((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const handleSurahEntryChange = (id: string, field: keyof DrillSurahEntry, value: number | string) => {
    setSurahEntries((prev) =>
      prev.map((entry) => {
        if (entry.id === id) {
          if (field === "surahNumber") {
            const surah = surahByJuz.find((s) => s.number === Number(value));
            return {
              ...entry,
              surahNumber: Number(value),
              surahName: surah?.name || "",
              ayatDari: 1,
              ayatSampai: surah?.numberOfAyahs || 7,
            };
          }
          return { ...entry, [field]: value };
        }
        return entry;
      })
    );
  };

  const handleSubmit = () => {
    if (!selectedSantri || !tanggalDrill || !juz || !drillLevel) {
      toast.error("Lengkapi data wajib terlebih dahulu");
      return;
    }

    toast.success("Drill berhasil disimpan");

    // reset
    setSelectedSantri("");
    setTanggalDrill(undefined);
    setJuz("");
    setDrillLevel("");
    setJumlahKesalahan("0");
    setCatatanTajwid("");
    setSurahEntries([{ id: "1", surahNumber: 0, surahName: "", ayatDari: 1, ayatSampai: 7 }]);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Tambah Drill Hafalan</h1>
      </div>

      {/* Santri */}
      <div className="space-y-2">
        <Label>Pilih Santri *</Label>
        <Select value={selectedSantri} onValueChange={setSelectedSantri}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih santri" />
          </SelectTrigger>
          <SelectContent>
            {mockSantri.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.nama}
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
            <Button variant="outline" className="w-full justify-start">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {tanggalDrill ? format(tanggalDrill, "dd/MM/yyyy") : "Pilih tanggal"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <CalendarComponent mode="single" selected={tanggalDrill} onSelect={setTanggalDrill} />
          </PopoverContent>
        </Popover>
      </div>

      <JuzSelector value={juz} onValueChange={setJuz} required />

      {/* Level drill */}
      <div className="space-y-2">
        <Label>Level Drill *</Label>
        <Select value={drillLevel} onValueChange={setDrillLevel}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih level drill" />
          </SelectTrigger>
          <SelectContent>
            {drillLevels.map((level) => (
              <SelectItem key={level.id} value={level.id}>
                {level.icon} {level.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Materi */}
      <Card className="border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex justify-between">
            Materi Drill
            <Button size="sm" variant="outline" onClick={handleAddSurahEntry} disabled={!juz}>
              <Plus className="w-3 h-3 mr-1" /> Tambah
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {surahEntries.map((entry, idx) => {
            const selectedSurah = surahByJuz.find((s) => s.number === entry.surahNumber);
            return (
              <div key={entry.id} className="border p-3 rounded space-y-2 relative">
                {surahEntries.length > 1 && (
                  <Button size="icon" variant="ghost" className="absolute right-2 top-2" onClick={() => handleRemoveSurahEntry(entry.id)}>
                    <X className="w-4 h-4" />
                  </Button>
                )}

                <Badge>Surat {idx + 1}</Badge>

                <Select
                  value={entry.surahNumber ? String(entry.surahNumber) : ""}
                  onValueChange={(v) => handleSurahEntryChange(entry.id, "surahNumber", v)}
                  disabled={!juz}
                >
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

                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" value={entry.ayatDari} onChange={(e) => handleSurahEntryChange(entry.id, "ayatDari", Number(e.target.value))} />
                  <Input type="number" value={entry.ayatSampai} onChange={(e) => handleSurahEntryChange(entry.id, "ayatSampai", Number(e.target.value))} />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Penilaian */}
      <div className="space-y-2">
        <Label>Jumlah Kesalahan</Label>
        <Input type="number" value={jumlahKesalahan} onChange={(e) => setJumlahKesalahan(e.target.value)} />

        <div className="flex justify-between bg-muted p-3 rounded">
          <span>Nilai</span>
          <span className={cn("font-bold", nilaiKelancaran >= BATAS_LULUS ? "text-green-600" : "text-destructive")}>
            {nilaiKelancaran}
          </span>
        </div>

        <Textarea placeholder="Catatan tajwid..." value={catatanTajwid} onChange={(e) => setCatatanTajwid(e.target.value)} />
      </div>

      <Button className="w-full" onClick={handleSubmit}>
        Simpan Drill
      </Button>
    </div>
  );
};

export default TambahDrill;
