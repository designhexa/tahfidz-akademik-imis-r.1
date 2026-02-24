import { useMemo } from "react"
import { Link } from "react-router-dom"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Legend,
} from "recharts"

import { MOCK_SANTRI } from "@/data/mockSantri"

/* ===============================
   TARGET PER KELAS
================================ */

const TARGET_KELAS: Record<string, number> = {
  k3: 2,
  k4: 2,
  k5: 3,
  k6: 3,
  k7: 4,
  k8: 4,
  k9: 5,
}

export default function Dashboard() {
  /* ===============================
     DATA ASLI (TIDAK DIUBAH)
  ================================ */

  const totalSantri = MOCK_SANTRI.length

  const totalJilid = MOCK_SANTRI.reduce(
    (acc, s) => acc + s.jilidSaatIni,
    0
  )

  const calonTasmi = MOCK_SANTRI.filter(
    (s) => s.jilidSaatIni >= 4
  )

  const tidakSesuaiTarget = MOCK_SANTRI.filter((s) => {
    const target = TARGET_KELAS[s.idKelas]
    if (!target) return false
    return s.jilidSaatIni < target
  })

  /* ===============================
     BAR CHART – jumlah santri per kelas
  ================================ */

  const barData = useMemo(() => {
    const kelasMap: Record<string, number> = {}

    MOCK_SANTRI.forEach((s) => {
      kelasMap[s.idKelas] =
        (kelasMap[s.idKelas] || 0) + 1
    })

    return Object.entries(kelasMap).map(([kelas, total]) => ({
      kelas,
      total,
    }))
  }, [])

  /* ===============================
     PIE CHART – distribusi jilid
  ================================ */

  const pieData = useMemo(() => {
    const jilidMap: Record<number, number> = {}

    MOCK_SANTRI.forEach((s) => {
      jilidMap[s.jilidSaatIni] =
        (jilidMap[s.jilidSaatIni] || 0) + 1
    })

    return Object.entries(jilidMap).map(([jilid, total]) => ({
      name: `Jilid ${jilid}`,
      value: total,
    }))
  }, [])

  return (
    <div className="p-4 space-y-6">

      {/* ===============================
         STAT CARDS
      ================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Santri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalSantri}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Jilid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalJilid}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calon Tasmi'</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {calonTasmi.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tidak Sesuai Target</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">
              {tidakSesuaiTarget.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===============================
         BAR CHART
      ================================ */}
      <Card>
        <CardHeader>
          <CardTitle>Jumlah Santri per Kelas</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="kelas" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ===============================
         PIE CHART
      ================================ */}
      <Card>
        <CardHeader>
          <CardTitle>Distribusi Jilid Saat Ini</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                label
              />
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ===============================
         TABEL FULL DATA
      ================================ */}
      <Card>
        <CardHeader>
          <CardTitle>Data Santri</CardTitle>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NIS</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Jilid</TableHead>
                <TableHead>Halaman</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {MOCK_SANTRI.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.nis}</TableCell>
                  <TableCell className="font-medium">
                    {s.nama}
                  </TableCell>
                  <TableCell>{s.idKelas}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {s.jilidSaatIni}
                    </Badge>
                  </TableCell>
                  <TableCell>{s.halamanSaatIni}</TableCell>
                  <TableCell>{s.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ===============================
         TIDAK SESUAI TARGET
      ================================ */}
      <Card>
        <CardHeader>
          <CardTitle>Santri Tidak Sesuai Target</CardTitle>
          <CardDescription>
            Jilid di bawah target kelas
          </CardDescription>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Jilid</TableHead>
                <TableHead>Target</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {tidakSesuaiTarget.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Semua santri sesuai target 🎉
                  </TableCell>
                </TableRow>
              ) : (
                tidakSesuaiTarget.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">
                      {s.nama}
                    </TableCell>
                    <TableCell>{s.idKelas}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">
                        {s.jilidSaatIni}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {TARGET_KELAS[s.idKelas]}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  )
}

/* ================= HELPER ================= */

function getNextJuzForStudent(
  juzSelesai: number[]
): number {
  const JUZ_ORDER = [
    30, 29, 28, 27, 26,
    1, 2, 3, 4, 5, 6, 7,
    8, 9, 10, 11, 12, 13,
    14, 15, 16, 17, 18, 19,
    20, 21, 22, 23, 24, 25,
  ];

  for (const juz of JUZ_ORDER) {
    if (!juzSelesai.includes(juz)) {
      return juz;
    }
  }

  return 30;
}