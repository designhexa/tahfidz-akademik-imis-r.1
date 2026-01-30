import { useState } from "react";
import { Layout } from "@/components/Layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Plus,
  Download,
  BookOpen,
  BookMarked,
  Home,
  Target,
  RefreshCw,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import TambahSetoran from "@/pages/TambahSetoran";
import TambahDrill from "@/pages/TambahDrill";

/* ================= MOCK DATA ================= */

const jenisSetoranOptions = [
  { value: "setoran_baru", label: "Setoran Baru", icon: BookOpen },
  { value: "murojaah", label: "Murojaah", icon: RefreshCw },
  { value: "tilawah", label: "Tilawah", icon: BookMarked },
  { value: "tilawah_rumah", label: "Tilawah Rumah", icon: Home },
  { value: "drill", label: "Drill", icon: Target },
];

const mockSetoranList = [
  {
    id: 1,
    tanggal: "15/01/2025",
    santri: "Muhammad Faiz",
    jenis: "setoran_baru",
    juz: 3,
    materi: "Al-Baqarah 101–120",
    nilai: 95,
    status: "Lancar",
  },
  {
    id: 2,
    tanggal: "14/01/2025",
    santri: "Aisyah Nur",
    jenis: "drill",
    juz: 30,
    materi: "Drill Juz 30 – An-Naba",
    nilai: 88,
    status: "Lulus",
  },
];

/* ================= COMPONENT ================= */

const SetoranHafalan = () => {
  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState("all");

  const [isSetoranOpen, setIsSetoranOpen] = useState(false);
  const [isDrillOpen, setIsDrillOpen] = useState(false);

  const filteredSetoran = mockSetoranList.filter(item => {
    const matchSearch = item.santri
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchJenis =
      filterJenis === "all" || item.jenis === filterJenis;
    return matchSearch && matchJenis;
  });

  const handleExport = () => {
    toast.success("Data setoran berhasil diexport!");
  };

  const getJenisLabel = (jenis: string) =>
    jenisSetoranOptions.find(j => j.value === jenis)?.label ??
    jenis;

  return (
    <Layout>
      <div className="space-y-6">

        {/* HEADER */}
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-2xl font-bold">Setoran Hafalan</h1>
            <p className="text-muted-foreground text-sm">
              Kelola setoran dan drill hafalan santri
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-1" /> Export
            </Button>

            {/* SETORAN */}
            <Dialog open={isSetoranOpen} onOpenChange={setIsSetoranOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-1" /> Setoran
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Tambah Setoran</DialogTitle>
                  <DialogDescription>
                    Setoran hafalan harian santri
                  </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="setoran_baru">
                  <TabsList className="grid grid-cols-4">
                    <TabsTrigger value="setoran_baru">
                      Setoran Baru
                    </TabsTrigger>
                    <TabsTrigger value="murojaah">
                      Murojaah
                    </TabsTrigger>
                    <TabsTrigger value="tilawah">
                      Tilawah
                    </TabsTrigger>
                    <TabsTrigger value="tilawah_rumah">
                      Tilawah Rumah
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="setoran_baru" className="mt-4">
                    <TambahSetoran />
                  </TabsContent>

                  <TabsContent value="murojaah" className="mt-4">
                    <div className="text-muted-foreground text-center p-6 border rounded">
                      Form belum tersedia
                    </div>
                  </TabsContent>

                  <TabsContent value="tilawah" className="mt-4">
                    <div className="text-muted-foreground text-center p-6 border rounded">
                      Form belum tersedia
                    </div>
                  </TabsContent>

                  <TabsContent value="tilawah_rumah" className="mt-4">
                    <div className="text-muted-foreground text-center p-6 border rounded">
                      Form belum tersedia
                    </div>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>

            {/* DRILL */}
            <Dialog open={isDrillOpen} onOpenChange={setIsDrillOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Target className="w-4 h-4 mr-1" /> Drill
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Tambah Drill Hafalan</DialogTitle>
                  <DialogDescription>
                    Drill mengikuti aturan juz & level
                  </DialogDescription>
                </DialogHeader>

                {/* ⬇️ SATU-SATUNYA SUMBER DRILL */}
                <TambahDrill />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* FILTER */}
        <Card>
          <CardContent className="p-4 grid grid-cols-2 gap-2">
            <div className="relative col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari santri..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* TABLE */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Setoran</CardTitle>
            <CardDescription>
              Semua setoran & drill santri
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Santri</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Juz</TableHead>
                  <TableHead>Materi</TableHead>
                  <TableHead>Nilai</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSetoran.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground"
                    >
                      Belum ada data
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSetoran.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{item.tanggal}</TableCell>
                      <TableCell>{item.santri}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getJenisLabel(item.jenis)}
                        </Badge>
                      </TableCell>
                      <TableCell>Juz {item.juz}</TableCell>
                      <TableCell>{item.materi}</TableCell>
                      <TableCell className="font-semibold">
                        {item.nilai}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            item.status === "Lancar" ||
                              item.status === "Lulus"
                              ? "bg-green-600 text-white"
                              : "bg-secondary"
                          )}
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SetoranHafalan;
