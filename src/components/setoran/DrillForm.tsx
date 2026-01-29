import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Target, Award } from "lucide-react";
import { toast } from "sonner";
import { JuzSelector } from "@/components/JuzSelector";
import { SetoranCalendar } from "@/components/setoran/SetoranCalendar";
import { getSurahsByJuz, Surah } from "@/lib/quran-data";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";

// Drill levels untuk juz 1-28
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

const BATAS_LULUS_DRILL = 88;

interface SetoranRecord {
  tanggal: Date;
  santriId: string;
  jenis: "setoran_baru" | "murojaah" | "tilawah" | "tilawah_rumah" | "drill";
  status: "selesai" | "tidak_hadir";
}

interface Santri {
  id: string;
  nama: string;
  nis: string;
  halaqoh: string;
}

interface DrillFormProps {
  santriList: Santri[];
  setoranRecords: SetoranRecord[];
  onSubmit?: (data: DrillFormData) => void;
}

export interface DrillFormData {
  santriId: string;
  tanggal: Date;
  juz: string;
  surah: string;
  ayatDari: string;
  ayatSampai: string;
  drillLevel: string;
  nilai: number;
  status: string;
  catatan: string;
}

export function DrillForm({ santriList, setoranRecords, onSubmit }: DrillFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  
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

  const selectedSantriData = santriList.find(s => s.id === selectedSantri);
  
  const surahByJuz: Surah[] = useMemo(() => {
    if (!juz) return [];
    return getSurahsByJuz(Number(juz));
  }, [juz]);

  const selectedSurah = useMemo(() => {
    return surahByJuz.find(s => s.number === Number(surah));
  }, [surah, surahByJuz]);

  const nilaiKelancaran = Math.max(0, 100 - parseInt(jumlahKesalahan || "0"));

  const getAppropriateDrillLevels = (juzNum: number) => {
    return juzNum >= 29 ? drillLevels2930 : drillLevels;
  };

  const handleSubmit = () => {
    if (!selectedDate || !selectedSantri) {
      toast.error("Silakan pilih santri dan tanggal terlebih dahulu");
      return;
    }

    if (!drillLevel) {
      toast.error("Silakan pilih level drill");
      return;
    }

    const status = nilaiKelancaran >= BATAS_LULUS_DRILL ? "Lulus" : "Tidak Lulus";

    const formData: DrillFormData = {
      santriId: selectedSantri,
      tanggal: selectedDate,
      juz,
      surah: selectedSurah?.name || "",
      ayatDari,
      ayatSampai,
      drillLevel,
      nilai: nilaiKelancaran,
      status,
      catatan,
    };

    console.log("Drill data:", formData);

    if (onSubmit) {
      onSubmit(formData);
    }

    toast.success(
      status === "Lulus"
        ? "Drill berhasil disimpan! 🎉"
        : "Drill dicatat. Perlu latihan lagi."
    );

    setIsOpen(false);
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Target className="w-4 h-4 mr-2" />
          Tambah Drill
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Tambah Drill
          </DialogTitle>
          <DialogDescription>
            Latihan hafalan intensif untuk memperkuat hafalan santri
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Info jenis */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-medium">Drill Hafalan</p>
                  <p className="text-sm text-muted-foreground">Latihan hafalan intensif per level</p>
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
                {santriList.map(santri => (
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

          {/* Calendar untuk pilih tanggal */}
          {selectedSantri && (
            <SetoranCalendar
              santriId={selectedSantri}
              setoranRecords={setoranRecords}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          )}

          {/* Form detail */}
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

              {/* Drill level */}
              {juz && (
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
                        nilaiKelancaran >= BATAS_LULUS_DRILL
                          ? "text-primary"
                          : "text-destructive"
                      )}>
                        {nilaiKelancaran}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        Batas lulus: {BATAS_LULUS_DRILL}
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

              <Button onClick={handleSubmit} className="w-full">
                Simpan Drill
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
