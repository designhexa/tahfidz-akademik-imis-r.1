// TambahDrill.tsx
// Standalone – TIDAK tergantung DrillHafalan.tsx
// Form & logic identik, memakai drill-data.ts langsung

import { useState, useMemo } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  Plus,
  Unlock,
  Lock,
  FileText,
  X,
  Save,
  Trophy,
  RotateCcw,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { JuzSelector } from "@/components/JuzSelector";
import { Calendar } from "@/components/ui/calendar";

// 🔥 DRILL DATA & LOGIC (langsung)
import {
  drillLevelsByJuz,
  surahByJuzMap,
  BATAS_LULUS,
  BATAS_KESALAHAN,
} from "@/lib/drill-data";

// ================= COMPONENT =================

export default function TambahDrill() {
  // ================= STATE DASAR =================
  const [tanggalDrill, setTanggalDrill] = useState<Date | undefined>(new Date());
  const [juz, setJuz] = useState<string>("");
  const [drillLevel, setDrillLevel] = useState<string>("");

  const [jumlahKesalahan, setJumlahKesalahan] = useState<string>("0");
  const [catatanTajwid, setCatatanTajwid] = useState<string>("");

  // ================= DRILL STATE =================
  const drillsForJuz = useMemo(() => {
    if (!juz) return [];
    return drillLevelsByJuz[Number(juz)] || [];
  }, [juz]);

  const selectedDrill = useMemo(() => {
    return drillsForJuz.find((d) => String(d.drillNumber) === drillLevel);
  }, [drillsForJuz, drillLevel]);

  const isPageBased = selectedDrill?.type === "page";

  // ================= MANUAL PAGE DRILL =================
  const [manualDrills, setManualDrills] = useState<any[]>([]);

  const completedPages: number[] = [];

  const handleAddManualDrill = () => {
    setManualDrills((prev) => [
      ...prev,
      { id: crypto.randomUUID(), pageStart: "" },
    ]);
  };

  const handleManualDrillChange = (id: string, field: string, value: number) => {
    setManualDrills((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleRemoveManualDrill = (id: string) => {
    setManualDrills((prev) => prev.filter((m) => m.id !== id));
  };

  // ================= SURAH DRILL =================
  const surahByJuz = useMemo(() => {
    if (!juz) return [];
    return surahByJuzMap[Number(juz)] || [];
  }, [juz]);

  const [surahEntries, setSurahEntries] = useState<any[]>([]);

  const handleAddSurahEntry = () => {
    setSurahEntries((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        surahNumber: undefined,
        ayatDari: 1,
        ayatSampai: 1,
      },
    ]);
  };

  const handleRemoveSurahEntry = (id: string) => {
    setSurahEntries((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSurahEntryChange = (id: string, field: string, value: any) => {
    setSurahEntries((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  // ================= PENILAIAN =================
  const nilaiKelancaran = useMemo(() => {
    const kesalahan = Number(jumlahKesalahan || 0);
    return Math.max(0, 100 - kesalahan);
  }, [jumlahKesalahan]);

  // ================= ACTION =================
  const handleSaveDrill = () => {
    console.log("SAVE DRILL", {
      tanggalDrill,
      juz,
      drillLevel,
      selectedDrill,
      manualDrills,
      surahEntries,
      jumlahKesalahan,
      nilaiKelancaran,
      catatanTajwid,
    });
  };

  const handleLulusDrill = () => {
    console.log("LULUS DRILL");
  };

  const handleUlangiDrill = () => {
    console.log("ULANGI DRILL");
  };

  // ================= RENDER =================

  return (
    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Tambah Drill Hafalan</DialogTitle>
        <DialogDescription>
          Masukkan penilaian drill hafalan untuk santri
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
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
                {tanggalDrill
                  ? format(tanggalDrill, "dd/MM/yyyy")
                  : "Pilih tanggal"}
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

        <JuzSelector value={juz} onValueChange={setJuz} required />

        {/* Level Drill */}
        <div className="space-y-2">
          <Label>Level Drill</Label>
          <Select value={drillLevel} onValueChange={setDrillLevel}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih level drill" />
            </SelectTrigger>
            <SelectContent>
              {drillsForJuz.map((drill: any) => (
                <SelectItem
                  key={drill.drillNumber}
                  value={String(drill.drillNumber)}
                >
                  <span className="flex items-center gap-2">
                    <Unlock className="w-3 h-3 text-green-500" />
                    {drill.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* PAGE BASED */}
        {isPageBased && selectedDrill && (
          <Card className="border-dashed border-amber-500/50">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm">Input Halaman</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddManualDrill}
                >
                  <Plus className="w-3 h-3 mr-1" /> Tambah
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {manualDrills.map((md) => (
                <div key={md.id} className="flex gap-2 items-center">
                  <Input
                    type="number"
                    value={md.pageStart}
                    onChange={(e) =>
                      handleManualDrillChange(
                        md.id,
                        "pageStart",
                        Number(e.target.value)
                      )
                    }
                    className="h-8"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveManualDrill(md.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* SURAH BASED */}
        {!isPageBased && selectedDrill && (
          <Card className="border-dashed border-primary/50">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm">Input Surat</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddSurahEntry}
                >
                  <Plus className="w-3 h-3 mr-1" /> Tambah Surat
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {surahEntries.map((entry) => (
                <div key={entry.id} className="space-y-2">
                  <Select
                    value={entry.surahNumber}
                    onValueChange={(v) =>
                      handleSurahEntryChange(entry.id, "surahNumber", v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih surah" />
                    </SelectTrigger>
                    <SelectContent>
                      {surahByJuz.map((s: any) => (
                        <SelectItem
                          key={s.number}
                          value={String(s.number)}
                        >
                          {s.number}. {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* PENILAIAN */}
        <div className="pt-4 border-t space-y-4">
          <h4 className="font-semibold">Penilaian</h4>

          <div className="space-y-2">
            <Label>Jumlah Kesalahan *</Label>
            <Input
              type="number"
              value={jumlahKesalahan}
              onChange={(e) => setJumlahKesalahan(e.target.value)}
              min={0}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <Label>Nilai Kelancaran</Label>
            <span
              className={cn(
                "text-2xl font-bold",
                nilaiKelancaran >= BATAS_LULUS
                  ? "text-green-600"
                  : "text-destructive"
              )}
            >
              {nilaiKelancaran}
            </span>
          </div>

          <Card
            className={cn(
              "p-3 border-2",
              nilaiKelancaran >= BATAS_LULUS
                ? "border-green-500 bg-green-50"
                : "border-destructive bg-destructive/10"
            )}
          >
            <div className="flex gap-3">
              {nilaiKelancaran >= BATAS_LULUS ? (
                <CheckCircle className="text-green-600" />
              ) : (
                <AlertCircle className="text-destructive" />
              )}
              <div className="text-sm">
                Batas lulus: {BATAS_LULUS} | Maks kesalahan: {BATAS_KESALAHAN}
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

        {/* ACTION */}
        <div className="grid grid-cols-3 gap-2 pt-4">
          <Button variant="outline" onClick={handleSaveDrill}>
            <Save className="w-4 h-4 mr-1" /> Simpan
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            disabled={nilaiKelancaran < BATAS_LULUS}
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
  );
}