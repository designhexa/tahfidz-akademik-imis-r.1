import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileSpreadsheet, Download } from "lucide-react";
import { useState } from "react";
import { MOCK_KELAS } from "@/lib/mock-data";

export default function TilawahRapor() {
  const [filterHalaqoh, setFilterHalaqoh] = useState("all");
  const [filterKelas, setFilterKelas] = useState("all");
  const [filterSemester, setFilterSemester] = useState("ganjil");

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Generate Rapor Tilawah</h1>
            <p className="text-muted-foreground text-sm mt-1">Generate dan cetak rapor tilawah santri</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Generate Rapor
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filter Rapor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={filterSemester} onValueChange={setFilterSemester}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ganjil">Semester Ganjil</SelectItem>
                  <SelectItem value="genap">Semester Genap</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterHalaqoh} onValueChange={setFilterHalaqoh}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Pilih Halaqoh" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Halaqoh</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterKelas} onValueChange={setFilterKelas}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Pilih Kelas" />
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Santri untuk Rapor</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Nama Santri</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Halaqoh</TableHead>
                  <TableHead>Status Rapor</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Belum ada data untuk generate rapor
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
