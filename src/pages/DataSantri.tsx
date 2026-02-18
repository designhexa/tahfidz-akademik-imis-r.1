import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Pencil, Trash2, Eye } from "lucide-react";
import {
  MOCK_SANTRI,
  MOCK_HALAQOH,
  MOCK_KELAS,
  getKelasNama,
  getHalaqohNama,
  getWaliNama,
} from "@/lib/mock-data";

export default function DataSantri() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterHalaqoh, setFilterHalaqoh] = useState("all");
  const [filterKelas, setFilterKelas] = useState("all");

  const filteredSantri = MOCK_SANTRI.filter((santri) => {
    const matchSearch = santri.nama.toLowerCase().includes(search.toLowerCase()) ||
      santri.nis.toLowerCase().includes(search.toLowerCase());
    const matchHalaqoh = filterHalaqoh === "all" || santri.idHalaqoh === filterHalaqoh;
    const matchKelas = filterKelas === "all" || santri.idKelas === filterKelas;
    return matchSearch && matchHalaqoh && matchKelas;
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Data Santri</h1>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Santri
          </Button>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari santri..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterHalaqoh} onValueChange={setFilterHalaqoh}>
              <SelectTrigger className="w-full sm:w-[180px]">
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
            <Select value={filterKelas} onValueChange={setFilterKelas}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Semua Kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kelas</SelectItem>
                {MOCK_KELAS.map((k) => (
                  <SelectItem key={k.id} value={k.id}>
                    {k.nama_kelas}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-muted-foreground">NIS</TableHead>
                <TableHead className="text-muted-foreground">Nama Santri</TableHead>
                <TableHead className="text-muted-foreground">Halaqoh</TableHead>
                <TableHead className="text-muted-foreground">Kelas</TableHead>
                <TableHead className="text-muted-foreground">Placement</TableHead>
                <TableHead className="text-muted-foreground">Wali Santri</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSantri.map((santri) => (
                <TableRow key={santri.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/santri/${santri.id}`)}>
                  <TableCell className="font-medium">{santri.nis}</TableCell>
                  <TableCell className="text-primary font-medium">{santri.nama}</TableCell>
                  <TableCell className="text-primary">{getHalaqohNama(santri.idHalaqoh)}</TableCell>
                  <TableCell>{getKelasNama(santri.idKelas)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      Jilid {santri.jilidSaatIni > 1 ? santri.jilidSaatIni - 1 : 1}
                    </Badge>
                  </TableCell>
                  <TableCell>{getWaliNama(santri.idWali)}</TableCell>
                  <TableCell>
                    <Badge variant="default" className="bg-primary/10 text-primary hover:bg-primary/20">
                      {santri.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(`/santri/${santri.id}`)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
