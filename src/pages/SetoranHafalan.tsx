import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  RefreshCw,
  BookMarked,
  Home,
  User,
} from "lucide-react";
import { MonthlyCalendar } from "@/components/setoran/MonthlyCalendar";
import { MobileCalendar } from "@/components/setoran/MobileCalendar";
import { EntryModal } from "@/components/setoran/EntryModal";
import { type CalendarEntry } from "@/components/setoran/CalendarCell";
import { MOCK_SANTRI, MOCK_HALAQOH, getSantriByHalaqoh } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type MainTab = "setoran_hafalan" | "murojaah" | "tilawah" | "murojaah_rumah";

const HEADER_TITLES: Record<MainTab, string> = {
  setoran_hafalan: "SETORAN HAFALAN",
  murojaah: "MUROJAAH DI SEKOLAH",
  tilawah: "SETORAN TILAWAH",
  murojaah_rumah: "MUROJAAH DI RUMAH",
};

const navigate = useNavigate();

// Sub-type options per tab
const SUB_OPTIONS: Record<MainTab, { value: string; label: string }[]> = {
  setoran_hafalan: [
    { value: "setoran_hafalan", label: "Setoran Hafalan" },
    { value: "drill", label: "Drill Hafalan" },
    { value: "tasmi", label: "Ujian Tasmi'" },
  ],
  murojaah: [],
  tilawah: [
    { value: "tilawah_harian", label: "Setoran Tilawah Harian" },
    { value: "ujian_jilid", label: "Ujian Kenaikan Jilid" },
  ],
  murojaah_rumah: [],
};

// Mock entries for demo
const MOCK_ENTRIES: CalendarEntry[] = [
  {
    tanggal: new Date(2025, 7, 4), // Aug 4
    santriId: "s1",
    jenis: "setoran_hafalan",
    juz: 26,
    surah: "Al-Kahfi",
    ayat: "1-19",
    status: "Lancar",
  },
  {
    tanggal: new Date(2025, 7, 5),
    santriId: "s1",
    jenis: "setoran_hafalan",
    juz: 26,
    halaman: "1-5",
    status: "Lancar",
  },
  {
    tanggal: new Date(2025, 7, 6),
    santriId: "s1",
    jenis: "setoran_hafalan",
    surah: "Al-Kahfi",
    ayat: "17-21",
    status: "Lancar",
  },
  {
    tanggal: new Date(2025, 7, 7),
    santriId: "s1",
    jenis: "setoran_hafalan",
    juz: 26,
    halaman: "6-10",
    status: "Lancar",
  },
  {
    tanggal: new Date(2025, 7, 11),
    santriId: "s1",
    jenis: "setoran_hafalan",
    surah: "Al-Kahfi",
    ayat: "21-22",
    status: "Lancar",
  },
  {
    tanggal: new Date(2025, 7, 13),
    santriId: "s1",
    jenis: "drill",
    juz: 26,
    halaman: "4-15",
    status: "Lancar",
  },
  {
    tanggal: new Date(2025, 7, 14),
    santriId: "s1",
    jenis: "setoran_hafalan",
    juz: 26,
    halaman: "21-24",
    status: "Ulangi",
  },
  {
    tanggal: new Date(2025, 7, 18),
    santriId: "s1",
    jenis: "drill",
    juz: 27,
    halaman: "1-5",
    status: "Lulus",
  },
  {
    tanggal: new Date(2025, 7, 25),
    santriId: "s1",
    jenis: "setoran_hafalan",
    juz: 27,
    surah: "Al-Kahfi",
    ayat: "28-20",
    status: "Ulangi",
  },
  // Murojaah
  {
    tanggal: new Date(2025, 7, 4),
    santriId: "s1",
    jenis: "murojaah",
    juz: 30,
    halaman: "6-10",
    status: "Lancar",
  },
  {
    tanggal: new Date(2025, 7, 5),
    santriId: "s1",
    jenis: "murojaah",
    juz: 30,
    halaman: "7-15",
    status: "Lancar",
  },
  {
    tanggal: new Date(2025, 7, 12),
    santriId: "s1",
    jenis: "murojaah",
    juz: 29,
    halaman: "11-15",
    status: "Lancar",
  },
  {
    tanggal: new Date(2025, 7, 13),
    santriId: "s1",
    jenis: "murojaah",
    status: "Sakit",
  },
  // Murojaah rumah
  {
    tanggal: new Date(2025, 7, 4),
    santriId: "s1",
    jenis: "murojaah_rumah",
    juz: 30,
    halaman: "11-20",
  },
  {
    tanggal: new Date(2025, 7, 5),
    santriId: "s1",
    jenis: "murojaah_rumah",
    juz: 29,
    halaman: "1-10",
  },
];

const SetoranHafalan = () => {
  const now = new Date();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<MainTab>("setoran_hafalan");
  const [subType, setSubType] = useState("setoran_hafalan");
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  // Filters
  const [selectedHalaqoh, setSelectedHalaqoh] = useState("");
  const [selectedSantri, setSelectedSantri] = useState("");

  // Local entries storage
  const [entries, setEntries] = useState<CalendarEntry[]>(MOCK_ENTRIES);

  const santriList = useMemo(() => {
    if (!selectedHalaqoh) return MOCK_SANTRI;
    return getSantriByHalaqoh(selectedHalaqoh);
  }, [selectedHalaqoh]);

  const santriData = MOCK_SANTRI.find((s) => s.id === selectedSantri);

  // Filter entries for current tab and santri
  const filteredEntries = useMemo(() => {
    if (!selectedSantri) return [];
    const jenisMap: Record<MainTab, string[]> = {
      setoran_hafalan: ["setoran_hafalan", "drill", "tasmi"],
      murojaah: ["murojaah"],
      tilawah: ["tilawah", "ujian_jilid"],
      murojaah_rumah: ["murojaah_rumah"],
    };
    const allowedJenis = jenisMap[activeTab];
    return entries.filter(
      (e) => e.santriId === selectedSantri && allowedJenis.includes(e.jenis)
    );
  }, [entries, selectedSantri, activeTab]);

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const handleDateClick = useCallback(
    (date: Date) => {
      if (!selectedSantri) return;

      const formattedDate = date.toISOString().split("T")[0];

      if (activeTab === "setoran_hafalan") {
        if (subType === "drill") {
          navigate(`/drill?santri=${selectedSantri}&date=${formattedDate}`);
        } else if (subType === "tasmi") {
          navigate(`/tasmi?santri=${selectedSantri}&date=${formattedDate}`);
        } else {
          navigate(`/setoran-hafalan?santri=${selectedSantri}&date=${formattedDate}`);
        }
      }

      if (activeTab === "tilawah") {
        if (subType === "ujian_jilid") {
          navigate(`/tilawah?type=ujian_jilid&santri=${selectedSantri}&date=${formattedDate}`);
        } else {
          navigate(`/tilawah?santri=${selectedSantri}&date=${formattedDate}`);
        }
      }

      if (activeTab === "murojaah") {
        navigate(`/murojaah?santri=${selectedSantri}&date=${formattedDate}`);
      }

      if (activeTab === "murojaah_rumah") {
        navigate(`/murojaah-rumah?santri=${selectedSantri}&date=${formattedDate}`);
      }
    },
    [selectedSantri, activeTab, subType, navigate]
  );

  const handleSaveEntry = useCallback(
    (data: any) => {
      const newEntry: CalendarEntry = {
        tanggal: data.tanggal,
        santriId: selectedSantri,
        jenis: data.jenis,
        juz: data.juz,
        surah: data.surah,
        halaman: data.halaman,
        ayat: data.ayat,
        status: data.status,
        catatan: data.catatan,
      };
      setEntries((prev) => [...prev, newEntry]);
    },
    [selectedSantri]
  );

  const monthOptions = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];

  const currentYear = now.getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const subOpts = SUB_OPTIONS[activeTab];

  return (
    <Layout>
      <div className="space-y-4 md:space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-foreground">
            Setoran Harian
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Monitoring setoran hafalan, murojaah, dan tilawah
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Filter</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Halaqoh</Label>
                <Select
                  value={selectedHalaqoh || "all"}
                  onValueChange={(v) => {
                    setSelectedHalaqoh(v === "all" ? "" : v);
                    setSelectedSantri("");
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Semua Halaqoh" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Halaqoh</SelectItem>
                    {MOCK_HALAQOH.map((h) => (
                      <SelectItem key={h.id} value={h.id}>
                        {h.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Santri *</Label>
                <Select
                  value={selectedSantri}
                  onValueChange={setSelectedSantri}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Pilih Santri" />
                  </SelectTrigger>
                  <SelectContent>
                    {santriList.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Bulan</Label>
                <Select
                  value={String(month)}
                  onValueChange={(v) => setMonth(Number(v))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((m, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Tahun</Label>
                <Select
                  value={String(year)}
                  onValueChange={(v) => setYear(Number(v))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {santriData && (
              <div className="mt-3 p-2 bg-primary/10 rounded text-xs">
                <span className="font-medium">{santriData.nama}</span> •{" "}
                NIS: {santriData.nis} •{" "}
                {MOCK_HALAQOH.find((h) => h.id === santriData.idHalaqoh)?.nama || "-"}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            setActiveTab(v as MainTab);
            const subs = SUB_OPTIONS[v as MainTab];
            setSubType(subs.length > 0 ? subs[0].value : "");
          }}
        >
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger
              value="setoran_hafalan"
              className="text-[10px] md:text-xs py-2 gap-1"
            >
              <BookOpen className="w-3 h-3 hidden md:block" />
              Setoran
            </TabsTrigger>
            <TabsTrigger
              value="murojaah"
              className="text-[10px] md:text-xs py-2 gap-1"
            >
              <RefreshCw className="w-3 h-3 hidden md:block" />
              Murojaah
            </TabsTrigger>
            <TabsTrigger
              value="tilawah"
              className="text-[10px] md:text-xs py-2 gap-1"
            >
              <BookMarked className="w-3 h-3 hidden md:block" />
              Tilawah
            </TabsTrigger>
            <TabsTrigger
              value="murojaah_rumah"
              className="text-[10px] md:text-xs py-2 gap-1"
            >
              <Home className="w-3 h-3 hidden md:block" />
              Rumah
            </TabsTrigger>
          </TabsList>

          {/* Sub-type selector */}
          {subOpts.length > 0 && (
            <div className="mt-3 flex gap-1.5 flex-wrap">
              {subOpts.map((opt) => (
                <Button
                  key={opt.value}
                  size="sm"
                  variant={subType === opt.value ? "default" : "outline"}
                  className="h-7 text-[10px] md:text-xs"
                  onClick={() => setSubType(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          )}

          {/* Month navigation */}
          <div className="flex items-center justify-between mt-3">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePrevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium text-muted-foreground">
              {monthOptions[month]} {year}
            </span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Calendar */}
          <div className="mt-3">
            {!selectedSantri ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground text-sm">
                  Pilih santri terlebih dahulu untuk melihat kalender monitoring
                </CardContent>
              </Card>
            ) : isMobile ? (
              <MobileCalendar
                month={month}
                year={year}
                entries={filteredEntries}
                onDateClick={handleDateClick}
                headerTitle={HEADER_TITLES[activeTab]}
              />
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[500px]">
                  <MonthlyCalendar
                    month={month}
                    year={year}
                    entries={filteredEntries}
                    onDateClick={handleDateClick}
                    headerTitle={HEADER_TITLES[activeTab]}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          {selectedSantri && (
            <div className="flex flex-wrap gap-3 mt-3 text-[10px] md:text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-[hsl(160,60%,45%)]/20 border border-[hsl(160,60%,45%)]/40" />
                <span>Lancar / Lulus</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-[hsl(45,90%,55%)]/20 border border-[hsl(45,90%,55%)]/40" />
                <span>Kurang Lancar</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-destructive/20 border border-destructive/40" />
                <span>Ulangi</span>
              </div>
              <div className="flex items-center gap-1">
                <span>⭐</span>
                <span>Ujian</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🏠</span>
                <span>Murojaah Rumah</span>
              </div>
            </div>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

export default SetoranHafalan;
