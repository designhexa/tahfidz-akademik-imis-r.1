import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "@/lib/target-hafalan";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSantri: 0,
    totalHalaqoh: 0,
    totalSetoran: 0,
    avgKelancaran: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      const [santriRes, halaqohRes, setoranRes] = await Promise.all([
        supabase.from("santri").select("*", { count: "exact", head: true }),
        supabase.from("halaqoh").select("*", { count: "exact", head: true }),
        supabase.from("setoran").select("nilai_kelancaran"),
      ]);

      if (santriRes.error) throw santriRes.error;
      if (halaqohRes.error) throw halaqohRes.error;
      if (setoranRes.error) throw setoranRes.error;

      const validNilai =
        setoranRes.data?.map((s) => s.nilai_kelancaran ?? 0) ?? [];

      const avgKelancaran =
        validNilai.length > 0
          ? validNilai.reduce((a, b) => a + b, 0) / validNilai.length
          : 0;

      setStats({
        totalSantri: santriRes.count ?? 0,
        totalHalaqoh: halaqohRes.count ?? 0,
        totalSetoran: validNilai.length,
        avgKelancaran: Math.round(avgKelancaran),
      });
    } catch (err) {
      console.error("Fetch dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= TARGET STATS ================= */

  const targetStats = useMemo(
    () => calculateTargetStats(mockSantriProgress),
    []
  );

  const targetPerKelasData = useMemo(() => {
    const kelasGroups: Record<string, { total: number; meetsTarget: number }> =
      {};

    mockSantriProgress.forEach((student) => {
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
      }));
  }, []);

  const pieChartData = useMemo(
    () => [
      { name: "Memenuhi", value: targetStats.meetsTarget },
      { name: "Belum", value: targetStats.notMeetsTarget },
    ],
    [targetStats]
  );

  const studentsNotMeetingTarget = useMemo(
    () =>
      mockSantriProgress
        .filter(
          (s) => !checkTargetStatus(s.kelasNumber, s.juzSelesai).meetsTarget
        )
        .slice(0, 5),
    []
  );

  const eligibleForTasmi = useMemo(
    () => mockSantriProgress.filter((s) => s.eligibleForTasmi).slice(0, 5),
    []
  );

  /* ================= STAT CARDS ================= */

  const statCards = [
    {
      title: "Total Santri",
      value:
        stats.totalSantri > 0
          ? stats.totalSantri
          : mockSantriProgress.length,
      icon: Users,
      gradient: "from-amber-500 to-amber-800",
    },
    {
      title: "Memenuhi Target",
      value: targetStats.meetsTarget,
      icon: CheckCircle,
      gradient: "from-green-500 to-green-600",
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
        <div>
          <h1 className="text-3xl font-bold">Dashboard Tahfidz</h1>
          <p className="text-muted-foreground mt-1">
            Selamat datang di sistem manajemen hafalan Al-Qur'an
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-sm text-muted-foreground">
            Memuat data dashboard...
          </div>
        )}

        {/* STAT CARDS */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center`}
                >
                  <card.icon className="w-5 h-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{card.value}</div>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Pencapaian Target per Kelas
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={targetPerKelasData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Bar dataKey="memenuhi" />
                  <Bar dataKey="belum" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Ringkasan Target
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieChartData} dataKey="value" />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

/* ================= HELPER ================= */

function getNextJuzForStudent(juzSelesai: number[]): number {
  const JUZ_ORDER = [
    30, 29, 28, 27, 26,
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25,
  ];

  return JUZ_ORDER.find((juz) => !juzSelesai.includes(juz)) ?? 30;
}