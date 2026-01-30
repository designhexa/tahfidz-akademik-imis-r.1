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
import { CalendarIcon, Plus, X } from "lucide-react";
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
  isPageBasedDrill,
  formatDrillDescription, // ✅ PAKAI INI
  DrillDefinition
} from "@/lib/drill-data";

/* ================= CONST ================= */

const BATAS_LULUS = 80;
const BATAS_KESALAHAN = 5;

/* ================= TYPES ================= */

interface ManualPage {
  id: string;
  page: number;
}

interface ManualSurah {
  id: string;
  surahName: string;
  ayatStart?: number;
  ayatEnd?: number;
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

  /* ===== DRILL (INI KUNCI) ===== */
  const [selectedDrill, setSelectedDrill] =
    useState<DrillDefinition | null>(null);

  const drills = useMemo<DrillDefinition[]>(() => {
    if (!juz) return [];
    return getDrillsForJuz(Number(juz));
  }, [juz]);

  /* ===== MANUAL INPUT ===== */
  const [pages, setPages] = useState<ManualPage[]>([]);
  const [surahs, setSurahs] = useState<ManualSurah[]>([]);

  /* ===== PENILAIAN ===== */
  const [jumlahKesalahan, setJumlahKesalahan] = useState(0);
  const nilaiKelancaran = Math.max(
    0,
    100 - jumlahKesalahan * BATAS_KESALAHAN
  );
  const [catatan, setCatatan] = useState("");

  /* ===== RESET SAAT DRILL GANTI ===== */
  useEffect(() => {
    setPages([]);
    setSurahs([]);
  }, [selectedDrill]);

  /* ===== DRILL TYPE ===== */
  const isPageBased = useMemo(() => {
    if (!selectedDrill) return false;
    return (
      "pageCount" in selectedDrill ||
      ("startPage" in selectedDrill && "endPage" in selectedDrill)
    );
  }, [selectedDrill]);

  /* ===== HELPERS ===== */
  const addPage = () =>
    setPages(p => [...p, { id: crypto.randomUUID(), page: 1 }]);

  const addSurah = () =>
    setSurahs(s => [
      ...s,
      { id: crypto.randomUUID(), surahName: "" },
    ]);

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
                {tanggal ? format(tanggal, "dd/MM/yyyy") : "Pilih tanggal"}
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

        {/* LEVEL DRILL (SUMBER TUNGGAL) */}
        <div>
          <Label>Level Drill</Label>
          <Select
            value={selectedDrill?.drillNumber?.toString() ?? ""}
            onValueChange={value => {
              const drill = drills.find(
                d => d.drillNumber === Number(value)
              );
              setSelectedDrill(drill ?? null);
            }}
            disabled={!juz}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih Level Drill" />
            </SelectTrigger>
            <SelectContent>
              {drills.map(drill => (
                <SelectItem
                  key={drill.drillNumber}
                  value={String(drill.drillNumber)}
                >
                  Level {drill.drillNumber} — {formatDrillDescription(drill)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* INPUT DRILL */}
        {selectedDrill && (
          isPageBased ? (
            <div className="space-y-2">
              <Label>Halaman Hafalan</Label>

              {pages.map(p => (
                <div key={p.id} className="flex gap-2">
                  <Input
                    type="number"
                    value={p.page}
                    onChange={e =>
                      setPages(m =>
                        m.map(x =>
                          x.id === p.id
                            ? { ...x, page: Number(e.target.value) }
                            : x
                        )
                      )
                    }
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      setPages(m => m.filter(x => x.id !== p.id))
                    }
                  >
                    <X />
                  </Button>
                </div>
              ))}

              <Button size="sm" variant="outline" onClick={addPage}>
                <Plus className="w-4 h-4 mr-1" /> Tambah Halaman
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Surat & Ayat</Label>

              {surahs.map(s => (
                <div key={s.id} className="space-y-2 border p-2 rounded">
                  <Input
                    placeholder="Nama surat"
                    value={s.surahName}
                    onChange={e =>
                      setSurahs(m =>
                        m.map(x =>
                          x.id === s.id
                            ? { ...x, surahName: e.target.value }
                            : x
                        )
                      )
                    }
                  />
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Ayat awal"
                      onChange={e =>
                        setSurahs(m =>
                          m.map(x =>
                            x.id === s.id
                              ? { ...x, ayatStart: Number(e.target.value) }
                              : x
                          )
                        )
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Ayat akhir"
                      onChange={e =>
                        setSurahs(m =>
                          m.map(x =>
                            x.id === s.id
                              ? { ...x, ayatEnd: Number(e.target.value) }
                              : x
                          )
                        )
                      }
                    />
                  </div>
                </div>
              ))}

              <Button size="sm" variant="outline" onClick={addSurah}>
                <Plus className="w-4 h-4 mr-1" /> Tambah Surat
              </Button>
            </div>
          )
        )}

        {/* PENILAIAN */}
        <div className="space-y-2 pt-4 border-t">
          <Label>Jumlah Kesalahan</Label>
          <Input
            type="number"
            value={jumlahKesalahan}
            onChange={e => setJumlahKesalahan(Number(e.target.value))}
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
            onChange={e => setCatatan(e.target.value)}
          />
        </div>
      </div>
    </DialogContent>
  );
};

export default TambahDrill;
