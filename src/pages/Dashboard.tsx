// PASTE FULL FILE INI

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

/* ================= COMPONENT ================= */

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

      const nilai =
        setoranRes.data?.map((s) => s.nilai_kelancaran ?? 0) ?? [];

      const avg =
        nilai.length > 0
          ? nilai.reduce((a, b) => a + b, 0) / nilai.length
          : 0;

      setStats({
        totalSantri: santriRes.count ?? 0,
        totalHalaqoh: halaqohRes.count ?? 0,
        totalSetoran: nilai.length,
        avgKelancaran: Math.round(avg),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= TARGET DATA ================= */

  const targetStats = useMemo(
    () => calculateTargetStats(mockSantriProgress),
    []
  );

  const targetPerKelasData = useMemo(() => {
    const kelasGroups: Record<string, { total: number; meets: number }> = {};

    mockSantriProgress.forEach((s) => {
      if (!kelasGroups[s.kelasNumber]) {
        kelasGroups[s.kelasNumber] = { total: 0, meets: 0 };
      }

      kelasGroups[s.kelasNumber].total += 1;

      if (checkTargetStatus(s.kelasNumber, s.juzSelesai).meetsTarget) {
        kelasGroups[s.kelasNumber].meets += 1;
      }
    });

    return Object.entries(kelasGroups).map(([k, v]) => ({
      name: `Kelas ${k}`,
      memenuhi: v.meets,
      belum: v.total - v.meets,
    }));
  }, []);

  const pieChartData = [
    { name: "Memenuhi", value: targetStats.meetsTarget },
    { name: "Belum", value: targetStats.notMeetsTarget },
  ];

  const studentsNotMeetingTarget = mockSantriProgress
    .filter((s) => !checkTargetStatus(s.kelasNumber, s.juzSelesai).meetsTarget)
    .slice(0, 5);

  const eligibleForTasmi = mockSantriProgress
    .filter((s) => s.eligibleForTasmi)
    .slice(0, 5);

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

  /* ================= RENDER ================= */

  return (
    <Layout>
      <div className="space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard Tahfidz</h1>
          <p className="text-muted-foreground">
            Monitoring target hafalan santri
          </p>
        </div>

        {/* STAT CARDS */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <Card key={card.title}>
              <CardHeader className="flex justify-between items-center pb-2">
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
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CHARTS */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Pencapaian per Kelas</CardTitle>
            </CardHeader>
            <CardContent className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={targetPerKelasData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Bar dataKey="memenuhi" fill="#22c55e" />   // green-500
                  <Bar dataKey="belum" fill="#ef4444" />      // red-500
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Target</CardTitle>
            </CardHeader>
            <CardContent className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieChartData} dataKey="value">
                    <Cell fill="#22c55e" />
                    <Cell fill="#ef4444" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* TABLES */}
        <div className="grid gap-6 md:grid-cols-2">

          {/* BELUM TARGET */}
          <Card>
            <CardHeader>
              <CardTitle>Belum Memenuhi Target</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Hafalan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentsNotMeetingTarget.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        Semua memenuhi target 🎉
                      </TableCell>
                    </TableRow>
                  ) : (
                    studentsNotMeetingTarget.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>{s.nama}</TableCell>
                        <TableCell>{s.kelas}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">
                            {s.jumlahJuzHafal} Juz
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* TASMI */}
          <Card>
            <CardHeader>
              <CardTitle>Calon Peserta Tasmi'</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Hafalan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eligibleForTasmi.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{s.nama}</TableCell>
                      <TableCell>{s.kelas}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {s.jumlahJuzHafal} Juz
                        </Badge>
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