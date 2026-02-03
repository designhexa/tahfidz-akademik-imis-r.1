import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, User } from "lucide-react";
import { toast } from "sonner";
import { JuzSelector } from "@/components/JuzSelector";
import { getSurahsByJuz, Surah } from "@/lib/quran-data";
import { SetoranCalendar } from "@/components/setoran/SetoranCalendar";
import { format } from "date-fns";

/* ================= MOCK DATA ================= */

const mockSantri = [
  { id: "1", nama: "Muhammad Faiz", nis: "S001", halaqoh: "Halaqoh Al-Azhary", halaqohId: "h1" },
  { id: "2", nama: "Fatimah Zahra", nis: "S003", halaqoh: "Halaqoh Al-Furqon", halaqohId: "h2" },
  { id: "3", nama: "Aisyah Nur", nis: "S002", halaqoh: "Halaqoh Al-Azhary", halaqohId: "h1" },
];

const mockHalaqoh = [
  { id: "h1", nama_halaqoh: "Halaqoh Al-Azhary" },
  { id: "h2", nama_halaqoh: "Halaqoh Al-Furqon" },
];

// Mock setoran records untuk kalender
const mockSetoranRecords = [
  { tanggal: new Date(2026, 1, 1), santriId: "1", jenis: "setoran_baru" as const, status: "selesai" as const },
  { tanggal: new Date(2026, 1, 2), santriId: "1", jenis: "murojaah" as const, status: "selesai" as const },
];

const BATAS_LANCAR_SETORAN = 80;

function tentukanStatusSetoran(nilai: number): "Lancar" | "Kurang" {
  return nilai >= BATAS_LANCAR_SETORAN ? "Lancar" : "Kurang";
}

/* ================= COMPONENT ================= */

const TambahSetoran = () => {
  // Santri selection state (di luar tabs)
  const [halaqohFilter, setHalaqohFilter] = useState("");
  const [selectedSantri, setSelectedSantri] = useState("");
  const [tanggalSetoran, setTanggalSetoran] = useState<Date>();

  // Form state
  const [activeTab, setActiveTab] = useState("setoran_baru");
  const [juz, setJuz] = useState("");
  const [surah, setSurah] = useState("");
  const [ayatDari, setAyatDari] = useState("1");
  const [ayatSampai, setAyatSampai] = useState("7");
  const [jumlahKesalahan, setJumlahKesalahan] = useState("0");
  const [catatanTajwid, setCatatanTajwid] = useState("");

  const filteredSantri = useMemo(() => {
    if (!halaqohFilter) return mockSantri;
    return mockSantri.filter(s => s.halaqohId === halaqohFilter);
  }, [halaqohFilter]);

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
      jenis: activeTab,
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

    // Reset form (keep santri selection)
    setTanggalSetoran(undefined);
    setJuz("");
    setSurah("");
    setAyatDari("1");
    setAyatSampai("7");
    setJumlahKesalahan("0");
    setCatatanTajwid("");
  };

  const handleDateSelect = (date: Date | undefined) => {
    setTanggalSetoran(date);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 p-4">
      <h1 className="text-2xl font-bold">Tambah Setoran Hafalan</h1>

      {/* ================= Informasi Santri (Di Luar Tabs) ================= */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4" />
            Pilih Santri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Filter Halaqoh */}
            <div className="space-y-2">
              <Label>Filter Halaqoh</Label>
              <Select
                value={halaqohFilter || "all"}
                onValueChange={(v) => {
                  setHalaqohFilter(v === "all" ? "" : v);
                  setSelectedSantri("");
                  setTanggalSetoran(undefined);
                }}
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
              <Select 
                value={selectedSantri} 
                onValueChange={(v) => {
                  setSelectedSantri(v);
                  setTanggalSetoran(undefined);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih santri" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSantri.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nama} ({s.nis})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedSantriData && (
            <div className="p-3 bg-primary/10 rounded border text-sm">
              <span className="font-medium">{selectedSantriData.nama}</span> • {selectedSantriData.halaqoh}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ================= Kalender (Muncul setelah pilih santri) ================= */}
      {selectedSantri && (
        <SetoranCalendar
          santriId={selectedSantri}
          setoranRecords={mockSetoranRecords}
          onSelectDate={handleDateSelect}
          selectedDate={tanggalSetoran}
        />
      )}

      {/* ================= Tabs Jenis Setoran ================= */}
      {selectedSantri && tanggalSetoran && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="setoran_baru" className="text-xs">Setoran Baru</TabsTrigger>
            <TabsTrigger value="murojaah" className="text-xs">Murojaah</TabsTrigger>
            <TabsTrigger value="tilawah" className="text-xs">Tilawah</TabsTrigger>
            <TabsTrigger value="tilawah_rumah" className="text-xs">Tilawah Rumah</TabsTrigger>
          </TabsList>

          {/* Content sama untuk semua tab */}
          <TabsContent value={activeTab} className="space-y-4 mt-4">
            {/* Info tanggal terpilih */}
            <div className="p-3 bg-secondary rounded-lg text-sm">
              📅 Tanggal: <strong>{format(tanggalSetoran, "dd MMMM yyyy")}</strong>
            </div>

            {/* Detail Hafalan */}
            <Card>
              <CardHeader className="pb-3">
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
                      {surahByJuz.map((s) => (
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
              <CardHeader className="pb-3">
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
                  <p className="text-sm text-secondary-foreground bg-secondary p-2 rounded">
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
              Simpan {activeTab === "setoran_baru" ? "Setoran" : activeTab === "murojaah" ? "Murojaah" : activeTab === "tilawah" ? "Tilawah" : "Tilawah Rumah"}
            </Button>
          </TabsContent>
        </Tabs>
      )}

      {/* Empty state */}
      {!selectedSantri && (
        <div className="text-center py-8 text-muted-foreground">
          Silakan pilih santri terlebih dahulu untuk memulai input setoran
        </div>
      )}

      {selectedSantri && !tanggalSetoran && (
        <div className="text-center py-4 text-muted-foreground">
          Pilih tanggal pada kalender untuk melanjutkan input setoran
        </div>
      )}
    </div>
  );
};

export default TambahSetoran;
