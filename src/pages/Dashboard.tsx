import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  ArrowRight
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
  StudentProgress
} from "@/lib/target-hafalan";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { ResponsiveContainer } from "recharts";

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
      supabase.from("santri").select("*", { count: "exact" }),
      supabase.from("halaqoh").select("*", { count: "exact" }),
      supabase.from("setoran").select("nilai_kelancaran"),
    ]);

    const avgKelancaran = setoranRes.data?.length
      ? setoranRes.data.reduce((acc, curr) => acc + (curr.nilai_kelancaran || 0), 0) / setoranRes.data.length
      : 0;

    setStats({
      totalSantri: santriRes.count || 0,
      totalHalaqoh: halaqohRes.count || 0,
      totalSetoran: setoranRes.data?.length || 0,
      avgKelancaran: Math.round(avgKelancaran),
    });
  };

  // Target stats from mock data
  const targetStats = useMemo(() => calculateTargetStats(mockSantriProgress), []);

  // Data for target per kelas chart
  const targetPerKelasData = useMemo(() => {
    const kelasGroups: Record<string, { total: number; meetsTarget: number }> = {};
    
    mockSantriProgress.forEach(student => {
      const kelas = student.kelasNumber;
      if (!kelasGroups[kelas]) {
        kelasGroups[kelas] = { total: 0, meetsTarget: 0 };
      }
      kelasGroups[kelas].total += 1;
      
      const status = checkTargetStatus(kelas, student.juzSelesai);
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
        total: data.total
      }));
  }, []);

  // Pie chart data
  const pieChartData = useMemo(() => [
    { name: "memenuhi", value: targetStats.meetsTarget, fill: "var(--color-memenuhi)" },
    { name: "belum", value: targetStats.notMeetsTarget, fill: "var(--color-belum)" },
  ], [targetStats]);

  // Chart config for bar chart
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

  // Chart config for pie chart
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

  // Students not meeting targets
  const studentsNotMeetingTarget = useMemo(() => {
    return mockSantriProgress
      .filter(s => {
        const status = checkTargetStatus(s.kelasNumber, s.juzSelesai);
        return !status.meetsTarget;
      })
      .slice(0, 5);
  }, []);

  // Eligible for tasmi'
  const eligibleForTasmi = useMemo(() => {
    return mockSantriProgress.filter(s => s.eligibleForTasmi).slice(0, 5);
  }, []);

  const statCards = [
    {
      title: "Total Santri",
      value: stats.totalSantri || mockSantriProgress.length,
      icon: Users,
      gradient: "from-amber-500 to-amber-800",
    },
    {
      title: "Memenuhi Target",
      value: targetStats.meetsTarget,
      icon: CheckCircle,
      gradient: "from-green-500 to-green-500",
      subtitle: `${targetStats.meetsTargetPercentage}%`
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Tahfidz</h1>
          <p className="text-muted-foreground mt-1">
            Selamat datang di sistem manajemen hafalan Al-Qur'an
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <Card key={card.title} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center`}>
                  <card.icon className="w-5 h-5 text-primary-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{card.value}</div>
                {card.subtitle && (
                  <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Target per Kelas Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Pencapaian Target per Kelas
              </CardTitle>
              <CardDescription>
                Perbandingan santri yang memenuhi target hafalan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[260px] sm:h-[300px]">
                <ChartContainer config={barChartConfig} className="w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={targetPerKelasData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                    >
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        tickMargin={8}
                        axisLine={false}
                      />
                      <YAxis tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="memenuhi" fill="var(--color-memenuhi)" radius={[6,6,0,0]} />
                      <Bar dataKey="belum" fill="var(--color-belum)" radius={[6,6,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          {/* Pie Chart */}
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
              <div className="w-full h-[260px] sm:h-[320px]">
                <ChartContainer
                  config={pieChartConfig}
                  className="w-full h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />

                      <Pie
                        data={pieChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                      />

                      <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tables Row */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Santri Belum Memenuhi Target */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-destructive" />
                    Santri Belum Memenuhi Target
                  </CardTitle>
                  <CardDescription>Perlu perhatian khusus</CardDescription>
                </div>
                <Link to="/laporan-hafalan">
                  <Button variant="ghost" size="sm">
                    Lihat Semua <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentsNotMeetingTarget.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Semua santri memenuhi target 🎉
                      </TableCell>
                    </TableRow>
                  ) : (
                    studentsNotMeetingTarget.map((student) => {
                      const target = CLASS_TARGETS[student.kelasNumber];
                      return (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.nama}</TableCell>
                          <TableCell>{student.kelas}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {target?.targetJuz ? `Juz ${target.targetJuz}` : "Surat Pilihan"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive" className="text-xs">
                              {student.jumlahJuzHafal} Juz
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Calon Peserta Tasmi' */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Award className="w-4 h-4 text-secondary" />
                    Calon Peserta Tasmi'
                  </CardTitle>
                  <CardDescription>Siap mengikuti ujian</CardDescription>
                </div>
                <Link to="/ujian-tasmi">
                  <Button variant="ghost" size="sm">
                    Lihat Semua <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Hafalan</TableHead>
                    <TableHead>Juz Berikut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eligibleForTasmi.map((student) => {
                    const nextJuz = student.juzSelesai.length > 0 
                      ? getNextJuzForStudent(student.juzSelesai)
                      : 30;
                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.nama}</TableCell>
                        <TableCell>{student.kelas}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {student.jumlahJuzHafal} Juz
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                            Juz {nextJuz}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Target Kelas Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Target Hafalan per Kelas
            </CardTitle>
            <CardDescription>
              Konfigurasi target hafalan yang harus dicapai setiap kelas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {Object.entries(CLASS_TARGETS).map(([key, target]) => (
                <div
                  key={key}
                  className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="font-semibold text-sm">{target.kelasName}</div>
                  <div className="text-xl font-bold text-primary mt-1">
                    {target.targetJuz ? `Juz ${target.targetJuz}` : "Surat Pilihan"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {target.targetJuz ? `Target: Juz ${target.targetJuz}` : "Admin config"}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

// Helper function
function getNextJuzForStudent(juzSelesai: number[]): number {
  const JUZ_ORDER = [30, 29, 28, 27, 26, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
  for (const juz of JUZ_ORDER) {
    if (!juzSelesai.includes(juz)) {
      return juz;
    }
  }
  return 30;
}
