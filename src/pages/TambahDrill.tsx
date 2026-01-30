import { FC, useEffect, useMemo, useState } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { CalendarIcon, Plus, X, FileText } from "lucide-react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { JuzSelector } from "@/components/JuzSelector";

import {
  getDrillsForJuz,
  formatDrillDescription,
  DrillDefinition,
} from "@/lib/drill-data";

/* ================= CONST ================= */

const BATAS_LULUS = 80;
const BATAS_KESALAHAN = 5;

/* ================= TYPES ================= */

interface ManualPage {
  id: string;
  page: number;
}

/* ================= COMPONENT ================= */

const TambahDrill: FC<any> = ({
  halaqohList,
  filteredSantriForForm,
  CalendarComponent,
}) => {
  /* ===== BASIC ===== */
  const [halaqohId, setHalaqohId] = useState("");
  const [santriId, setSantriId] = useState("");
  const [tanggal, setTanggal] = useState<Date>();
  const [juz, setJuz] = useState("");

  /* ===== DRILL ===== */
  const [selectedDrill, setSelectedDrill] =
    useState<DrillDefinition | null>(null);

  const drills = useMemo<DrillDefinition[]>(() => {
    if (!juz) return [];
    return getDrillsForJuz(Number(juz));
  }, [juz]);



  /* ===== MANUAL INPUT (PAGE) ===== */
  const [pages, setPages] = useState<ManualPage[]>([]);
  const [manualDrills, setManualDrills] = useState<
    { id: string; pageStart: number }[]
  >([]);

  const handleAddManualDrill = () => {
    if (!selectedDrill) return;
    setManualDrills((m) => [
      ...m,
      {
        id: crypto.randomUUID(),
        pageStart: selectedDrill.pageStart ?? 1,
      },
    ]);
  };

  const handleManualDrillChange = (
    id: string,
    value: number
  ) => {
    setManualDrills((m) =>
      m.map((d) =>
        d.id === id ? { ...d, pageStart: value } : d
      )
    );
  };

  const handleRemoveManualDrill = (id: string) => {
    setManualDrills((m) => m.filter((d) => d.id !== id));
  };

  /* ===== PENILAIAN ===== */
  const [jumlahKesalahan, setJumlahKesalahan] = useState(0);
  const nilaiKelancaran = Math.max(
    0,
    100 - jumlahKesalahan * BATAS_KESALAHAN
  );
  const [catatan, setCatatan] = useState("");

  /* ===== RESET SAAT DRILL GANTI ===== */
  useEffect(() => {
    if (!selectedDrill) return;

    if (selectedDrill.type === 'page') {
      setPages([{ 
        id: crypto.randomUUID(), 
        page: selectedDrill.pageStart ?? 1 
      }]);
      setSurahs([]);
    } else {
      setSurahs([{ 
        id: crypto.randomUUID(), 
        surahName: "" 
      }]);
      setPages([]);
    }
  }, [selectedDrill]);


  /* ===== DRILL TYPE ===== */
  const isPageBased = selectedDrill?.type === "page";

  /* ================= RENDER ================= */

  return (
    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Tambah Drill Hafalan</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {/* Halaqoh */}
        <div>
          <Label>Halaqoh</Label>
          <Select value={halaqohId} onValueChange={setHalaqohId}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih halaqoh" />
            </SelectTrigger>
            <SelectContent>
              {halaqohList.map((h: any) => (
                <SelectItem key={h.id} value={h.id}>
                  {h.nama_halaqoh}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Santri */}
        <div>
          <Label>Santri</Label>
          <Select value={santriId} onValueChange={setSantriId}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih santri" />
            </SelectTrigger>
            <SelectContent>
              {filteredSantriForForm.map((s: any) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.nama}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tanggal */}
        <div>
          <Label>Tanggal</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {tanggal
                  ? format(tanggal, "dd/MM/yyyy")
                  : "Pilih tanggal"}
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <CalendarComponent
                mode="single"
                selected={tanggal}
                onSelect={setTanggal}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Juz */}
        <JuzSelector value={juz} onValueChange={setJuz} />

        {/* LEVEL DRILL */}
        <div>
          <Label>Level Drill</Label>
          <Select
            value={selectedDrill?.drillNumber?.toString() ?? ""}
            onValueChange={(value) => {
              const drill = drills.find(
                (d) => d.drillNumber === Number(value)
              );
              setSelectedDrill(drill ?? null);
            }}
            disabled={!juz}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih Level Drill" />
            </SelectTrigger>
            <SelectContent>
              {drills.map((drill) => (
                <SelectItem
                  key={drill.drillNumber}
                  value={String(drill.drillNumber)}
                >
                  Level {drill.drillNumber} —{" "}
                  {formatDrillDescription(drill)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* INFO DRILL */}
        {isPageBased && selectedDrill && (
          <Card className="border-dashed">
            <CardContent className="p-4 flex gap-3">
              <FileText className="w-5 h-5" />
              <div>
                <p className="font-medium">
                  Halaman {selectedDrill.pageStart} –{" "}
                  {selectedDrill.pageEnd}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedDrill?.type === 'surah' && selectedDrill.surahRanges && (
          <div className="p-3 rounded border bg-muted space-y-1 text-sm">
            <p className="font-medium">Target Drill</p>

            {selectedDrill.surahRanges.map((s, i) => (
              <p key={i}>
                {s.surahName}
                {s.fullSurah
                  ? " (1 surat penuh)"
                  : ` ayat ${s.ayatStart}–${s.ayatEnd}`}
              </p>
            ))}
          </div>
        )}

        {/* MANUAL INPUT PAGE */}
        {isPageBased && selectedDrill && (
          <Card className="border-dashed border-amber-500/50">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm">
                  Input Manual Halaman
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddManualDrill}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Tambah
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-2">
              {manualDrills.map((md) => (
                <div
                  key={md.id}
                  className="flex items-center gap-2"
                >
                  <Input
                    type="number"
                    value={md.pageStart}
                    min={selectedDrill.pageStart}
                    max={selectedDrill.pageEnd}
                    onChange={(e) =>
                      handleManualDrillChange(
                        md.id,
                        Number(e.target.value)
                      )
                    }
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      handleRemoveManualDrill(md.id)
                    }
                  >
                    <X />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* PENILAIAN */}
        <div className="space-y-2 pt-4 border-t">
          <Label>Jumlah Kesalahan</Label>
          <Input
            type="number"
            value={jumlahKesalahan}
            onChange={(e) =>
              setJumlahKesalahan(Number(e.target.value))
            }
          />

          <Badge
            className={cn(
              nilaiKelancaran >= BATAS_LULUS
                ? "bg-green-600"
                : "bg-destructive"
            )}
          >
            Nilai: {nilaiKelancaran}
          </Badge>

          <Textarea
            placeholder="Catatan tajwid"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
          />
        </div>
      </div>
    </DialogContent>
  );
};

export default TambahDrill;
