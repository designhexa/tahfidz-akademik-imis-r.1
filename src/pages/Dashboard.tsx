import { useMemo } from "react"
import { Layout } from "@/components/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartContainer } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts"
import { MOCK_SANTRI } from "@/data/mockSantri"
import { mockSantriProgress } from "@/data/mockSantriProgress"

export default function Dashboard() {

  // =============================
  // MAP ID -> NAMA SANTRI
  // =============================

  const santriNameMap = useMemo(() => {
    const map: Record<string, string> = {}
    MOCK_SANTRI.forEach((s) => {
      map[s.id] = s.nama
    })
    return map
  }, [])

  // =============================
  // TARGET PER KELAS
  // =============================

  const getTargetByClass = (kelas: number) => {
    switch (kelas) {
      case 9: return 10
      case 8: return 6
      case 7: return 5
      case 6: return 4
      case 5: return 3
      case 4: return 2
      case 3: return 2
      default: return 2
    }
  }

  // =============================
  // TARGET BELUM TERCAPAI
  // =============================

  const studentsNotMeetingTarget = mockSantriProgress.filter((s) => {
    return s.juzSelesai.length < getTargetByClass(s.kelasNumber)
  })

  // =============================
  // CALON TASMI (>= target)
  // =============================

  const eligibleForTasmi = mockSantriProgress.filter((s) => {
    return s.juzSelesai.length >= getTargetByClass(s.kelasNumber)
  })

  // =============================
  // PIE CHART DATA
  // =============================

  const pieData = [
    { name: "Tercapai", value: eligibleForTasmi.length },
    { name: "Belum", value: studentsNotMeetingTarget.length },
  ]

  const COLORS = ["#22c55e", "#ef4444"]

  // =============================
  // BAR CHART DATA (Per Kelas)
  // =============================

  const barData = useMemo(() => {
    const kelasMap: Record<number, number> = {}

    mockSantriProgress.forEach((s) => {
      if (!kelasMap[s.kelasNumber]) {
        kelasMap[s.kelasNumber] = 0
      }
      kelasMap[s.kelasNumber] += s.juzSelesai.length
    })

    return Object.keys(kelasMap).map((kelas) => ({
      kelas: `Kelas ${kelas}`,
      totalJuz: kelasMap[Number(kelas)],
    }))
  }, [])

  // =============================
  // RENDER
  // =============================

  return (
    <Layout>
      <div className="space-y-6">

        {/* ================= STAT CARD ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <Card>
            <CardHeader>
              <CardTitle>Total Santri</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {mockSantriProgress.length}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tercapai Target</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold text-green-600">
              {eligibleForTasmi.length}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Belum Tercapai</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold text-red-600">
              {studentsNotMeetingTarget.length}
            </CardContent>
          </Card>

        </div>

        {/* ================= CHART ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* PIE */}
          <Card>
            <CardHeader>
              <CardTitle>Distribusi Target</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer>
                <PieChart width={300} height={250}>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* BAR */}
          <Card>
            <CardHeader>
              <CardTitle>Total Juz per Kelas</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer>
                <BarChart width={400} height={250} data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="kelas" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalJuz" fill="#3b82f6" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

        </div>

        {/* ================= TARGET BELUM ================= */}
        <Card>
          <CardHeader>
            <CardTitle>Santri Belum Tercapai Target</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Juz Selesai</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsNotMeetingTarget.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {santriNameMap[student.id] ?? student.id}
                    </TableCell>
                    <TableCell>
                      {student.kelasNumber}
                    </TableCell>
                    <TableCell>
                      {student.juzSelesai.length}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* ================= TASMI ================= */}
        <Card>
          <CardHeader>
            <CardTitle>Santri Siap Tasmi</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Total Juz</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eligibleForTasmi.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {santriNameMap[student.id] ?? student.id}
                    </TableCell>
                    <TableCell>
                      {student.kelasNumber}
                    </TableCell>
                    <TableCell>
                      {student.juzSelesai.length}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
    </Layout>
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