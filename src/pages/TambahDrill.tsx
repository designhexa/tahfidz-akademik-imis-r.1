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
  const [manualDrills, setManualDrills] = useState<{id: string, pageStart: number}[]>([]);
  const handleAddManualDrill = () => {
    setManualDrills(m => [...m, { id: crypto.randomUUID(), pageStart: selectedDrill?.pageStart ?? 1 }]);
  };

  const handleManualDrillChange = (id: string, field: string, value: number) => {
    setManualDrills(m => m.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const handleRemoveManualDrill = (id: string) => {
    setManualDrills(m => m.filter(d => d.id !== id));
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
      setPages([{ id: crypto.randomUUID(), page: selectedDrill.pageStart ?? 1 }]);
      setSurahs([]);
    } else {
      setSurahs([{ id: crypto.randomUUID(), surahName: "" }]);
      setPages([]);
    }
  }, [selectedDrill]);

  /* ===== DRILL TYPE ===== */
  const isPageBased = useMemo(() => {
    return selectedDrill?.type === 'page';
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

        {/* Manual Input Section - Only for page-based drills after drill level selected */}
                {isPageBased && juz && selectedDrill && (
                  <Card className="border-dashed border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <FileText className="w-4 h-4 text-amber-600" />
                          Input Halaman {selectedDrill.name}
                        </CardTitle>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={handleAddManualDrill}
                          className="h-7 text-xs"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Tambah
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Range: Halaman {selectedDrill.pageStart} - {selectedDrill.pageEnd}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {manualDrills.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          Klik "Tambah" untuk input halaman
                        </p>
                      ) : (
                        manualDrills.map((md) => (
                          <div key={md.id} className="flex items-center gap-2 p-2 bg-background rounded border">
                            <Input
                              type="number"
                              min={selectedDrill.pageStart || 1}
                              max={selectedDrill.pageEnd || 20}
                              value={md.pageStart}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const minPage = Math.max(
                                  selectedDrill.pageStart || 1,
                                  Math.max(...completedPages, 0) + 1
                                );
                                const maxPage = selectedDrill.pageEnd || 20;
                                const clampedVal = Math.max(minPage, Math.min(maxPage, val));
                                handleManualDrillChange(md.id, 'pageStart', clampedVal);
                              }}
                              placeholder="Dari"
                              className="h-8 w-20"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              onClick={() => handleRemoveManualDrill(md.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))
                      )}
                      <p className="text-xs text-amber-600">
                        ⚠️ Halaman harus dalam range {selectedDrill.pageStart} - {selectedDrill.pageEnd}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Multi Surah Selection - Only for surah-based drills */}
                {!isPageBased && juz && selectedDrill && (
                  <Card className="border-dashed border-primary/50 bg-primary/5">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Input Surat</CardTitle>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={handleAddSurahEntry}
                          disabled={!juz}
                          className="h-7 text-xs"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Tambah Surat
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {surahEntries.map((entry, index) => {
                        const selectedSurah = surahByJuz.find(s => s.number === entry.surahNumber);
                        return (
                          <div key={entry.id} className="space-y-3 p-3 bg-background rounded-lg border relative">
                            {surahEntries.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                                onClick={() => handleRemoveSurahEntry(entry.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                            
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className="text-xs">Surat {index + 1}</Badge>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs">Nama Surah *</Label>
                              <Select 
                                value={entry.surahNumber ? String(entry.surahNumber) : ""} 
                                onValueChange={(v) => handleSurahEntryChange(entry.id, "surahNumber", v)}
                                disabled={!juz}
                              >
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
                              <div className="p-2 bg-primary/10 rounded border border-primary/20">
                                <p className="text-xs">
                                  {selectedSurah.name} ({selectedSurah.arabicName}) – {selectedSurah.numberOfAyahs} ayat
                                </p>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs">Ayat Dari *</Label>
                                <Input
                                  type="number"
                                  min={1}
                                  max={selectedSurah?.numberOfAyahs}
                                  value={entry.ayatDari}
                                  onChange={(e) => handleSurahEntryChange(entry.id, "ayatDari", Number(e.target.value))}
                                  disabled={!selectedSurah}
                                  className="h-9"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Ayat Sampai *</Label>
                                <Input
                                  type="number"
                                  min={entry.ayatDari}
                                  max={selectedSurah?.numberOfAyahs}
                                  value={entry.ayatSampai}
                                  onChange={(e) => handleSurahEntryChange(entry.id, "ayatSampai", Number(e.target.value))}
                                  disabled={!selectedSurah}
                                  className="h-9"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                )}

                {/* Page-based drill info */}
                {isPageBased && juz && selectedDrill && manualDrills.length === 0 && (
                  <Card className="border-dashed border-primary/50 bg-primary/5">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Halaman {selectedDrill.pageStart} - {selectedDrill.pageEnd}</p>
                          <p className="text-xs text-muted-foreground">
                            {(selectedDrill.pageEnd || 0) - (selectedDrill.pageStart || 0) + 1} halaman
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
