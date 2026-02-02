import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Image, Calendar } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";

interface TasmiCandidate {
  no: number;
  nama: string;
  kelas: string;
  jumlahHafalan: string;
  juzDiujikan: string;
}

interface TasmiCandidateCardProps {
  candidates: TasmiCandidate[];
  schoolName?: string;
  schoolLogo?: string;
  scheduledDate?: Date;
  onGenerate?: () => void;
}

export const TasmiCandidateCard = ({
  candidates,
  schoolName = "PKBM Imam Muslim Islamic School",
  scheduledDate = new Date(),
}: TasmiCandidateCardProps) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customDate, setCustomDate] = useState<string>(format(scheduledDate, "yyyy-MM-dd"));
  const [customSchoolName, setCustomSchoolName] = useState(schoolName);

  const handleDownloadImage = async () => {
    if (!printRef.current) return;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });
      
      const link = document.createElement("a");
      link.download = `jadwal-tasmi-${format(new Date(customDate), "yyyy-MM-dd")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      
      toast.success("Gambar berhasil diunduh!");
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Gagal generate gambar");
    } finally {
      setIsGenerating(false);
    }
  };

  const formattedDate = format(new Date(customDate), "EEEE, d MMMM yyyy", { locale: id });

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Image className="w-4 h-4" />
            Generate Gambar Jadwal Tasmi'
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama Sekolah</Label>
              <Input
                value={customSchoolName}
                onChange={(e) => setCustomSchoolName(e.target.value)}
                placeholder="Nama sekolah"
              />
            </div>
            <div className="space-y-2">
              <Label>Tanggal Ujian</Label>
              <Input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
              />
            </div>
          </div>
          <Button
            onClick={handleDownloadImage}
            disabled={isGenerating || candidates.length === 0}
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGenerating ? "Generating..." : "Download Gambar"}
          </Button>
        </CardContent>
      </Card>

      {/* Preview */}
      <div className="overflow-auto border rounded-lg bg-muted/50 p-4">
        <div
          ref={printRef}
          className="w-[1080px] min-h-[1080px] mx-auto relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #e8f5e9 0%, #f5f5f5 50%, #e3f2fd 100%)",
          }}
        >
          {/* Background Pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23166534' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          {/* Content Container */}
          <div className="relative z-10 p-8 flex flex-col items-center">
            {/* Logo */}
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow-lg border-4 border-amber-400 mb-4">
              <div className="text-center text-white">
                <div className="text-3xl mb-1">📖</div>
                <div className="text-[8px] font-bold leading-tight px-2">
                  {customSchoolName.split(' ').slice(0, 2).join(' ')}
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold text-green-800 mb-2" style={{ fontFamily: "serif" }}>
              Jadwal Sertifikasi Hafalan
            </h1>
            <div className="flex items-center gap-2 text-xl text-gray-700 mb-6">
              <Calendar className="w-5 h-5" />
              {formattedDate}
            </div>

            {/* Table */}
            <div className="w-full max-w-4xl bg-white/80 rounded-lg overflow-hidden shadow-xl border-2 border-green-600/30">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-green-700 to-green-600 text-white">
                    <th className="py-3 px-4 text-center font-semibold border-r border-green-500/50 w-16">No</th>
                    <th className="py-3 px-4 text-center font-semibold border-r border-green-500/50">Nama Lengkap</th>
                    <th className="py-3 px-4 text-center font-semibold border-r border-green-500/50 w-20">Kelas</th>
                    <th className="py-3 px-4 text-center font-semibold border-r border-green-500/50 w-28">Jumlah Hapalan</th>
                    <th className="py-3 px-4 text-center font-semibold w-32">Juz yang di ujikan</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((candidate, index) => (
                    <tr
                      key={candidate.no}
                      className={index % 2 === 0 ? "bg-amber-50" : "bg-white"}
                    >
                      <td className="py-3 px-4 text-center border-r border-gray-200 font-medium">
                        {candidate.no}
                      </td>
                      <td className="py-3 px-4 border-r border-gray-200 font-medium text-gray-800">
                        {candidate.nama}
                      </td>
                      <td className="py-3 px-4 text-center border-r border-gray-200">
                        {candidate.kelas}
                      </td>
                      <td className="py-3 px-4 text-center border-r border-gray-200">
                        {candidate.jumlahHafalan}
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-green-700">
                        {candidate.juzDiujikan}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Quote */}
            <div className="mt-8 max-w-3xl text-center">
              <p className="text-gray-700 italic text-lg leading-relaxed">
                "Sesungguhnya Allah mengangkat dengan kitab Al-Qur'an ini beberapa kaum dan juga
                dengan kitab Al-Qur'an ini Allah merendahkan yang lainnya."
              </p>
              <p className="text-gray-600 mt-2 font-semibold">(HR. Muslim)</p>
            </div>

            {/* Footer */}
            <div className="mt-8 flex items-center justify-center gap-8 text-gray-600">
              <div className="flex items-center gap-2 px-6 py-2 bg-white/80 rounded-full shadow">
                <span className="text-xl">🌐</span>
                <span className="font-medium">www.imis.sch.id</span>
              </div>
              <div className="flex items-center gap-2 px-6 py-2 bg-white/80 rounded-full shadow">
                <span className="text-xl">📱</span>
                <span className="font-medium">@imammuslimislamicschool</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasmiCandidateCard;
