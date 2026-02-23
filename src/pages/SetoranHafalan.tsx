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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Plus,
  Download,
  BookOpen,
  BookMarked,
  Home,
  RefreshCw,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import TambahSetoran from "@/pages/TambahSetoran";

const jenisSetoranOptions = [
  {
    value: "setoran_baru",
    label: "Setoran Baru",
    icon: BookOpen,
  },
  {
    value: "murojaah",
    label: "Murojaah",
    icon: RefreshCw,
  },
  {
    value: "tilawah",
    label: "Tilawah",
    icon: BookMarked,
  },
  {
    value: "tilawah_rumah",
    label: "Murojaah di Rumah",
    icon: Home,
  },
];

const mockSetoranList = [
  {
    id: 1,
    tanggal: "15/01/2025",
    santri: "Muhammad Faiz",
    jenis: "setoran_baru",
    juz: 3,
    materi: "Al-Baqarah 101-120",
    nilai: 95,
    status: "Lancar",
  },
  {
    id: 2,
    tanggal: "14/01/2025",
    santri: "Fatimah Zahra",
    jenis: "murojaah",
    juz: 4,
    materi: "An-Nisa 1-30",
    nilai: 92,
    status: "Lancar",
  },
  {
    id: 3,
    tanggal: "13/01/2025",
    santri: "Muhammad Faiz",
    jenis: "tilawah",
    juz: 3,
    materi: "Al-Baqarah 80-100",
    nilai: 90,
    status: "Lancar",
  },
];

const SetoranHafalan = () => {
  const [search, setSearch] = useState("");
  const [filterJuz, setFilterJuz] = useState("all");
  const [filterJenis, setFilterJenis] = useState("all");
  const [filterHalaqoh, setFilterHalaqoh] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getJenisLabel = (jenis: string) => {
    const option = jenisSetoranOptions.find((o) => o.value === jenis);
    return option?.label || jenis;
  };

  const handleExport = () => {
    toast.success("Data setoran berhasil diexport!");
  };

  const filteredSetoran = mockSetoranList.filter((item) => {
    const matchSearch = item.santri
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchJuz =
      filterJuz === "all" || item.juz === Number(filterJuz);
    const matchJenis =
      filterJenis === "all" || item.jenis === filterJenis;

    return matchSearch && matchJuz && matchJenis;
  });

  return (
    <Layout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-foreground">
              Setoran Harian
            </h1>
            <p className="text-xs md:text-base text-muted-foreground">
              Kelola setoran hafalan, murojaah, dan tilawah harian
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Export</span>
            </Button>

            {/* Dialog Tambah Setoran (Tanpa Tabs) */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 md:mr-2" />
                  <span className="hidden sm:inline">
                    Tambah Setoran
                  </span>
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Tambah Setoran
                  </DialogTitle>
                  <DialogDescription>
                    Pilih halaqoh, santri, dan lengkapi data
                    penilaian
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-4">
                  <TambahSetoran />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 md:gap-4">
          {jenisSetoranOptions.map((option) => (
            <Card key={option.value}>
              <CardContent className="p-2 md:p-4">
                <div className="flex flex-col md:flex-row items-center gap-1 md:gap-3 text-center md:text-left">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <option.icon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg md:text-2xl font-bold">
                      {
                        mockSetoranList.filter(
                          (s) => s.jenis === option.value
                        ).length
                      }
                    </p>
                    <p className="text-[9px] md:text-xs text-muted-foreground truncate">
                      {option.label}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-3 md:p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
              <div className="relative col-span-2 md:col-span-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cari santri..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-9 md:h-10 text-sm"
                />
              </div>

              <Select value={filterJenis} onValueChange={setFilterJenis}>
                <SelectTrigger className="h-9 md:h-10 text-sm">
                  <SelectValue placeholder="Jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jenis</SelectItem>
                  {jenisSetoranOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterJuz} onValueChange={setFilterJuz}>
                <SelectTrigger className="h-9 md:h-10 text-sm">
                  <SelectValue placeholder="Juz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Juz</SelectItem>
                  {Array.from({ length: 30 }, (_, i) => (
                    <SelectItem
                      key={i + 1}
                      value={String(i + 1)}
                    >
                      Juz {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filterHalaqoh}
                onValueChange={setFilterHalaqoh}
              >
                <SelectTrigger className="h-9 md:h-10 text-sm">
                  <SelectValue placeholder="Halaqoh" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    Semua Halaqoh
                  </SelectItem>
                  <SelectItem value="azhary">
                    Halaqoh Al-Azhary
                  </SelectItem>
                  <SelectItem value="furqon">
                    Halaqoh Al-Furqon
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Setoran</CardTitle>
            <CardDescription>
              Daftar semua setoran hafalan santri
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 md:p-6">
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Santri</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Juz</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Materi
                    </TableHead>
                    <TableHead>Nilai</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSetoran.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Belum ada data setoran
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSetoran.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.tanggal}</TableCell>
                        <TableCell className="font-medium">
                          {item.santri}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getJenisLabel(item.jenis)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-primary/10 text-primary border-primary">
                            Juz {item.juz}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {item.materi}
                        </TableCell>
                        <TableCell className="font-semibold text-primary">
                          {item.nilai}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              item.status === "Lancar"
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground"
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
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SetoranHafalan;