import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  BookOpenCheck,
  BookOpen,
  TrendingUp,
  Target,
  Award,
  CheckCircle,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  mockSantriProgress,
  calculateTargetStats,
  checkTargetStatus,
  CLASS_TARGETS,
  StudentProgress,
} from "@/lib/target-hafalan";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSantri: 0,
    totalHalaqoh: 0,
    totalSetoran: 0,
    avgKelancaran: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [santriRes, halaqohRes, setoranRes] = await Promise.all([
      supabase.from("santri").select("*", { count: "exact", head: true }),
      supabase.from("halaqoh").select("*", { count: "exact", head: true }),
      supabase.from("setoran").select("nilai_kelancaran"),
    ]);

    const avgKelancaran =
      setoranRes.data?.length
        ? setoranRes.data.reduce(
            (acc, curr) => acc + (curr.nilai_kelancaran || 0),
            0
          ) / setoranRes.data.length
        : 0;

    setStats({
      totalSantri: santriRes.count || 0,
      totalHalaqoh: halaqohRes.count || 0,
      totalSetoran: setoranRes.data?.length || 0,
      avgKelancaran: Math.round(avgKelancaran),
    });
  };

  /* ================= TARGET STATS ================= */

  const targetStats = useMemo(
    () => calculateTargetStats(mockSantriProgress),
    []
  );

  const targetPerKelasData = useMemo(() => {
    const kelasGroups: Record<
      string,
      { total: number; meetsTarget: number }
    > = {};

    mockSantriProgress.forEach((student) => {
      const kelas = student.kelasNumber;

      if (!kelasGroups[kelas]) {
        kelasGroups[kelas] = { total: 0, meetsTarget: 0 };
      }

      kelasGroups[kelas].total += 1;

      const status = checkTargetStatus(
        kelas,
        student.juzSelesai
      );

      if (status.meetsTarget) {
        kelasGroups[kelas].meetsTarget += 1;
      }
    });

    return Object.entries(kelasGroups)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([kelas, data]) => ({
        name: `Kelas ${kelas}`,
        memenuhi: data.meetsTarget,
        belum: data.total - data.meetsTarget,
        total: data.total,
      }));
  }, []);

  const pieChartData = useMemo(
    () => [
      {
        name: "memenuhi",
        value: targetStats.meetsTarget,
      },
      {
        name: "belum",
        value: targetStats.notMeetsTarget,
      },
    ],
    [targetStats]
  );

  const barChartConfig = {
    memenuhi: {
      label: "Memenuhi Target",
      color: "hsl(var(--chart-2))",
    },
    belum: {
      label: "Belum Memenuhi",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  const pieChartConfig = {
    memenuhi: {
      label: "Memenuhi Target",
      color: "hsl(var(--chart-2))",
    },
    belum: {
      label: "Belum Memenuhi",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  const studentsNotMeetingTarget = useMemo(() => {
    return mockSantriProgress
      .filter((s) => {
        const status = checkTargetStatus(
          s.kelasNumber,
          s.juzSelesai
        );
        return !status.meetsTarget;
      })
      .slice(0, 5);
  }, []);

  const eligibleForTasmi = useMemo(() => {
    return mockSantriProgress
      .filter((s) => s.eligibleForTasmi)
      .slice(0, 5);
  }, []);

  const statCards = [
    {
      title: "Total Santri",
      value:
        stats.totalSantri ||
        mockSantriProgress.length,
      icon: Users,
      gradient: "from-amber-500 to-amber-800",
    },
    {
      title: "Memenuhi Target",
      value: targetStats.meetsTarget,
      icon: CheckCircle,
      gradient: "from-green-500 to-green-500",
      subtitle: `${targetStats.meetsTargetPercentage}%`,
    },
    {
      title: "Belum Memenuhi",
      value: targetStats.notMeetsTarget,
      icon: XCircle,
      gradient: "from-destructive to-destructive/80",
    },
    {
      title: "Calon Tasmi'",
      value: targetStats.eligibleForTasmi,
      icon: BookOpenCheck,
      gradient: "from-green-500 to-green-800",
    },
  ];

  return (
    <Layout>
      <div className="space-y-6 px-1 sm:px-0">
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Dashboard Tahfidz
          </h1>
          <p className="text-muted-foreground mt-1">
            Selamat datang di sistem manajemen hafalan
            Al-Qur'an
          </p>
        </div>

        {/* STAT CARDS */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <Card
              key={card.title}
              className="overflow-hidden"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>

                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center`}
                >
                  <card.icon className="w-5 h-5 text-primary-foreground" />
                </div>
              </CardHeader>

              <CardContent>
                <div className="text-3xl font-bold">
                  {card.value}
                </div>
                {card.subtitle && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.subtitle}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CHARTS */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* BAR CHART */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Pencapaian Target per Kelas
              </CardTitle>
              <CardDescription>
                Perbandingan santri yang memenuhi
                target hafalan
              </CardDescription>
            </CardHeader>

            <CardContent>
              <ChartContainer
                config={barChartConfig}
                className="min-w-[350px] h-[260px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={targetPerKelasData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="memenuhi"
                      fill="var(--color-memenuhi)"
                      radius={6}
                    />
                    <Bar
                      dataKey="belum"
                      fill="var(--color-belum)"
                      radius={6}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* PIE CHART */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Ringkasan Target Keseluruhan
              </CardTitle>
              <CardDescription>
                Proporsi santri yang memenuhi target
              </CardDescription>
            </CardHeader>

            <CardContent>
              <ChartContainer
                config={pieChartConfig}
                className="min-w-[280px] h-[260px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={60}
                    >
                      {pieChartData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={`var(--color-${entry.name})`}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* TABLES */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* TARGET BELUM TERCAPAI */}
          <Card>
            <CardHeader>
              <CardTitle>Santri Belum Memenuhi Target</CardTitle>
              <CardDescription>
                5 santri dengan capaian di bawah target kelas
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Juz</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentsNotMeetingTarget.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.name}
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

          {/* CALON TASMI */}
          <Card>
            <CardHeader>
              <CardTitle>Calon Tasmi'</CardTitle>
              <CardDescription>
                5 santri yang siap mengikuti tasmi'
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Juz Terakhir</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eligibleForTasmi.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.name}
                      </TableCell>
                      <TableCell>
                        {student.kelasNumber}
                      </TableCell>
                      <TableCell>
                        {getNextJuzForStudent(student.juzSelesai)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
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