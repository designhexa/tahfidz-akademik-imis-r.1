import { useState, useMemo, useEffect } from "react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { 
  CalendarIcon, Unlock, Lock, BookOpen, Target, Edit3, Plus, X, Save, Trophy, RotateCcw, CheckCircle, AlertCircle 
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { JuzSelector } from "@/components/JuzSelector";
import { 
  getDrillsForJuz, 
  DrillDefinition, 
  formatDrillDescription 
} from "@/lib/drill-data";

const mockSantri = [
  { id: "1", nama: "Muhammad Faiz", nis: "S001", halaqoh: "Halaqoh Al-Azhary" },
  { id: "2", nama: "Fatimah Zahra", nis: "S003", halaqoh: "Halaqoh Al-Furqon" },
  { id: "3", nama: "Aisyah Nur", nis: "S002", halaqoh: "Halaqoh Al-Azhary" },
];

const mockHalaqoh = [
  { id: "h1", nama_halaqoh: "Halaqoh Al-Azhary" },
  { id: "h2", nama_halaqoh: "Halaqoh Al-Furqon" },
];

interface AddDrillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (data: any) => void;
  date: Date | null;
  santriName: string;
}

const BATAS_LULUS_DRILL = 88;
const BATAS_KESALAHAN_DRILL = 12;

export const AddDrillModal = ({ open, onOpenChange, onSuccess,  date, santriName }: AddDrillModalProps) => {
  // Form state
  const [halaqohFilter, setHalaqohFilter] = useState("");
  const [selectedSantri, setSelectedSantri] = useState("");
  const [tanggal, setTanggal] = useState<Date>();
  const [juz, setJuz] = useState("");
  const [level, setLevel] = useState("");
  const [kesalahan, setKesalahan] = useState("0");
  const [catatan, setCatatan] = useState("");
  const [useManual, setUseManual] = useState(false);
  const [manualPages, setManualPages] = useState<{ id: string; page: number }[]>([]);
  const [manualSurahs, setManualSurahs] = useState<any[]>([]);

  const drills: DrillDefinition[] = useMemo(() => (juz ? getDrillsForJuz(Number(juz)) : []), [juz]);
  const nilai = Math.max(0, 100 - parseInt(kesalahan || "0"));

  const filteredSantri = useMemo(() => {
    if (!halaqohFilter || halaqohFilter === "all") return mockSantri;
    const hName = mockHalaqoh.find(h => h.id === halaqohFilter)?.nama_halaqoh;
    return mockSantri.filter(s => s.halaqoh === hName);
  }, [halaqohFilter, mockSantri, mockHalaqoh]);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setHalaqohFilter(""); setSelectedSantri(""); setTanggal(undefined);
      setJuz(""); setLevel(""); setKesalahan("0"); setCatatan("");
      setUseManual(false); setManualPages([]); setManualSurahs([]);
    }
  }, [open]);

  const handleSave = (status: "Lulus" | "Mengulang") => {
    if (!tanggal || !selectedSantri || !juz || !level) {
      toast.error("Lengkapi data wajib (*)");
      return;
    }
    
    const santri = mockSantri.find(s => s.id === selectedSantri);
    const selectedDrill = drills.find(d => d.drillNumber === Number(level));

    onSuccess({
      tanggal: format(tanggal, "dd/MM/yyyy"),
      santri: santri?.nama,
      juz: Number(juz),
      level: Number(level),
      materi: formatDrillDescription(selectedDrill!),
      nilai,
      status,
      catatan
    });
    onOpenChange(false);
  };

  if (!date) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Drill Hafalan</DialogTitle>
          <DialogDescription>
            {santriName} •{" "}
            {format(date, "EEEE, d MMMM yyyy", { locale: localeId })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2 hidden">
            <Label>Filter Halaqoh</Label>
            <Select value={halaqohFilter} onValueChange={setHalaqohFilter}>
              <SelectTrigger><SelectValue placeholder="Semua Halaqoh" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Halaqoh</SelectItem>
                {mockHalaqoh.map(h => <SelectItem key={h.id} value={h.id}>{h.nama_halaqoh}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 hidden">
            <Label>Pilih Santri *</Label>
            <Select value={selectedSantri} onValueChange={setSelectedSantri}>
              <SelectTrigger><SelectValue placeholder="Pilih santri" /></SelectTrigger>
              <SelectContent>
                {filteredSantri.map(s => <SelectItem key={s.id} value={s.id}>{s.nama} ({s.nis})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 hidden">
            <Label>Tanggal *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start", !tanggal && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {tanggal ? format(tanggal, "dd/MM/yyyy") : "Pilih tanggal"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={tanggal} onSelect={setTanggal} />
              </PopoverContent>
            </Popover>
          </div>

          <JuzSelector value={juz} onValueChange={setJuz} required />

          <div className="space-y-2">
            <Label>Level Drill</Label>
            <Select value={level} onValueChange={setLevel} disabled={!juz}>
              <SelectTrigger><SelectValue placeholder="Pilih level" /></SelectTrigger>
              <SelectContent>
                {drills.map(d => (
                  <SelectItem key={d.drillNumber} value={String(d.drillNumber)}>
                    Level {d.drillNumber} — {formatDrillDescription(d)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bagian Penilaian */}
          <div className="pt-4 border-t space-y-4">
            <div className="space-y-2">
              <Label>Jumlah Kesalahan *</Label>
              <Input type="number" value={kesalahan} onChange={(e) => setKesalahan(e.target.value)} />
            </div>
            <div className="flex justify-between p-3 bg-muted rounded-lg items-center">
              <Label>Nilai Kelancaran</Label>
              <span className={cn("text-xl font-bold", nilai >= BATAS_LULUS_DRILL ? "text-green-600" : "text-destructive")}>
                {nilai}
              </span>
            </div>
            
            <Card className={cn("p-3 border-2", nilai >= BATAS_LULUS_DRILL ? "border-green-500 bg-green-50" : "border-destructive bg-destructive/10")}>
              <div className="flex gap-3 items-center text-sm">
                {nilai >= BATAS_LULUS_DRILL ? <CheckCircle className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-destructive" />}
                <span>Batas lulus: {BATAS_LULUS_DRILL} | Kesalahan max: {BATAS_KESALAHAN_DRILL}</span>
              </div>
            </Card>

            <div className="space-y-2">
              <Label>Catatan Tajwid</Label>
              <Textarea value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Catatan perbaikan..." />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-4">
            <Button variant="outline" onClick={() => handleSave("Mengulang")}>
              <Save className="w-4 h-4 mr-1" /> Simpan
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700" 
              disabled={nilai < BATAS_LULUS_DRILL} 
              onClick={() => handleSave("Lulus")}
            >
              <Trophy className="w-4 h-4 mr-1" /> Lulus
            </Button>
            <Button variant="destructive" onClick={() => onOpenChange(false)}>
              <RotateCcw className="w-4 h-4 mr-1" /> Batal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};