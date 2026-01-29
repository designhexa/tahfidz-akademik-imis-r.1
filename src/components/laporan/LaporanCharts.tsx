import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";

// Data capaian per kelas
interface CapaianKelasData {
  kelas: string;
  rataRata: number;
  totalSetoran: number;
}

// Data capaian per halaqoh  
interface CapaianHalaqohData {
  halaqoh: string;
  rataRata: number;
  totalSetoran: number;
}

// Data capaian per siswa
interface CapaianSiswaData {
  nama: string;
  juzSelesai: number;
  totalJuz: number;
  persentase: number;
}

interface LaporanChartsProps {
  capaianKelas: CapaianKelasData[];
  capaianHalaqoh: CapaianHalaqohData[];
  capaianSiswa: CapaianSiswaData[];
}

const chartConfig: ChartConfig = {
  rataRata: {
    label: "Rata-rata Nilai",
    color: "hsl(var(--primary))",
  },
  totalSetoran: {
    label: "Total Setoran",
    color: "hsl(var(--secondary))",
  },
  persentase: {
    label: "Persentase",
    color: "hsl(var(--primary))",
  },
};

const COLORS = [
  "hsl(160, 60%, 45%)",
  "hsl(45, 90%, 55%)",
  "hsl(200, 70%, 50%)",
  "hsl(280, 60%, 55%)",
  "hsl(340, 75%, 55%)",
  "hsl(30, 85%, 55%)",
];

export function CapaianKelasChart({ data }: { data: CapaianKelasData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">📊 Capaian per Kelas</CardTitle>
        <CardDescription>Rata-rata nilai hafalan per kelas</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis type="category" dataKey="kelas" width={120} tick={{ fontSize: 12 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="rataRata" name="Rata-rata Nilai" radius={[0, 4, 4, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function CapaianHalaqohChart({ data }: { data: CapaianHalaqohData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">📊 Capaian per Halaqoh</CardTitle>
        <CardDescription>Rata-rata nilai hafalan per halaqoh</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="halaqoh" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
            <YAxis domain={[0, 100]} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="rataRata" name="Rata-rata Nilai" radius={[4, 4, 0, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function CapaianSiswaChart({ data }: { data: CapaianSiswaData[] }) {
  // Format data untuk pie chart
  const pieData = data.slice(0, 5).map((siswa, idx) => ({
    name: siswa.nama,
    value: siswa.persentase,
    fill: COLORS[idx % COLORS.length],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">📊 Top 5 Santri Berprestasi</CardTitle>
        <CardDescription>Persentase capaian hafalan tertinggi</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function LaporanCharts({ capaianKelas, capaianHalaqoh, capaianSiswa }: LaporanChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <CapaianKelasChart data={capaianKelas} />
      <CapaianHalaqohChart data={capaianHalaqoh} />
      <div className="lg:col-span-2">
        <CapaianSiswaChart data={capaianSiswa} />
      </div>
    </div>
  );
}
