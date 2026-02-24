import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toast } from "sonner";
import { JuzSelector } from "@/components/JuzSelector";
import { getSurahsByJuz, type Surah } from "@/lib/quran-data";
import { Plus } from "lucide-react";

type TabType = "setoran_hafalan" | "murojaah" | "tilawah" | "murojaah_rumah";
type SubType =
  | "setoran_hafalan"
  | "drill"
  | "tasmi"
  | "tilawah_harian"
  | "ujian_jilid";

interface EntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  santriName: string;
  activeTab: TabType;
  subType?: SubType;
  onSave: (data: any) => void;
}

export function EntryModal({
  open,
  onOpenChange,
  date,
  santriName,
  activeTab,
  subType,
  onSave,
}: EntryModalProps) {
  const [juz, setJuz] = useState("");
  const [surah, setSurah] = useState("");
  const [halamanDari, setHalamanDari] = useState("");
  const [halamanSampai, setHalamanSampai] = useState("");
  const [ayatDari, setAyatDari] = useState("1");
  const [ayatSampai, setAyatSampai] = useState("7");
  const [status, setStatus] = useState("");
  const [catatan, setCatatan] = useState("");
  // Tilawah fields
  const [jilid, setJilid] = useState("");

  const surahByJuz: Surah[] = useMemo(() => {
    if (!juz) return [];
    return getSurahsByJuz(Number(juz));
  }, [juz]);

  const selectedSurah = useMemo(() => {
    return surahByJuz.find((s) => s.number === Number(surah));
  }, [surah, surahByJuz]);

  const getTitle = () => {
    if (activeTab === "murojaah") return "Murojaah Hafalan";
    if (activeTab === "murojaah_rumah") return "Murojaah di Rumah";
    if (activeTab === "tilawah") {
      return subType === "ujian_jilid" ? "Ujian Kenaikan Jilid" : "Setoran Tilawah";
    }
    // setoran_hafalan
    if (subType === "drill") return "Drill Hafalan";
    if (subType === "tasmi") return "Ujian Tasmi'";
    return "Setoran Hafalan";
  };

  const getStatusOptions = () => {
    if (activeTab === "murojaah" || activeTab === "murojaah_rumah") {
      return ["Lancar", "Kurang Lancar"];
    }
    if (subType === "drill") {
      return ["Lulus", "Mengulang"];
    }
    return ["Lancar", "Ulangi", "Sakit", "Izin"];
  };

  const isTilawahTab = activeTab === "tilawah";

  const handleSave = () => {
    if (!date) return;
    if (!isTilawahTab && !juz) {
      toast.error("Pilih Juz terlebih dahulu");
      return;
    }
    if (!status) {
      toast.error("Pilih status terlebih dahulu");
      return;
    }

    const jenisMap: Record<string, string> = {
      setoran_hafalan: "setoran_hafalan",
      drill: "drill",
      tasmi: "tasmi",
      tilawah_harian: "tilawah",
      ujian_jilid: "ujian_jilid",
    };

    onSave({
      tanggal: date,
      jenis:
        activeTab === "murojaah"
          ? "murojaah"
          : activeTab === "murojaah_rumah"
          ? "murojaah_rumah"
          : jenisMap[subType || "setoran_hafalan"] || activeTab,
      juz: juz ? Number(juz) : undefined,
      surah: selectedSurah?.name || surah,
      halaman: halamanDari && halamanSampai ? `${halamanDari}–${halamanSampai}` : halamanDari || undefined,
      ayat: ayatDari && ayatSampai ? `${ayatDari}-${ayatSampai}` : undefined,
      status,
      catatan,
      jilid: jilid || undefined,
    });

    // Reset
    setJuz("");
    setSurah("");
    setHalamanDari("");
    setHalamanSampai("");
    setAyatDari("1");
    setAyatSampai("7");
    setStatus("");
    setCatatan("");
    setJilid("");
    onOpenChange(false);
    toast.success("Data berhasil disimpan!");
  };

  if (!date) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">{getTitle()}</DialogTitle>
          <DialogDescription>
            {santriName} •{" "}
            {format(date, "EEEE, d MMMM yyyy", { locale: localeId })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Juz (for non-tilawah) */}
          {!isTilawahTab && (
            <>
              <JuzSelector value={juz} onValueChange={setJuz} required />

              <div className="space-y-2">
                <Label>Surah</Label>
                <Select value={surah} onValueChange={setSurah} disabled={!juz}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={juz ? "Pilih surah" : "Pilih juz dulu"}
                    />
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
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Ayat dari</Label>
                    <Input
                      type="number"
                      value={ayatDari}
                      min={1}
                      max={selectedSurah.numberOfAyahs}
                      onChange={(e) => setAyatDari(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Ayat sampai</Label>
                    <Input
                      type="number"
                      value={ayatSampai}
                      min={Number(ayatDari)}
                      max={selectedSurah.numberOfAyahs}
                      onChange={(e) => setAyatSampai(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Halaman */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Halaman dari</Label>
                  <Input
                    type="number"
                    value={halamanDari}
                    min={1}
                    onChange={(e) => setHalamanDari(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Halaman sampai</Label>
                  <Input
                    type="number"
                    value={halamanSampai}
                    min={Number(halamanDari) || 1}
                    onChange={(e) => setHalamanSampai(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {/* Tilawah fields */}
          {isTilawahTab && (
            <>
              <div className="space-y-2">
                <Label>Jilid / Al-Qur'an</Label>
                <Select value={jilid} onValueChange={setJilid}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jilid" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 6 }, (_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>
                        Jilid {i + 1}
                      </SelectItem>
                    ))}
                    <SelectItem value="quran">Al-Qur'an</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Halaman dari</Label>
                  <Input
                    type="number"
                    value={halamanDari}
                    min={1}
                    onChange={(e) => setHalamanDari(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Halaman sampai</Label>
                  <Input
                    type="number"
                    value={halamanSampai}
                    min={Number(halamanDari) || 1}
                    onChange={(e) => setHalamanSampai(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {/* Status */}
          <div className="space-y-2">
            <Label>Status *</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                {getStatusOptions().map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Catatan */}
          <div className="space-y-2">
            <Label>Catatan</Label>
            <Textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Catatan ustadz..."
              rows={2}
            />
          </div>

          <Button onClick={handleSave} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Simpan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
