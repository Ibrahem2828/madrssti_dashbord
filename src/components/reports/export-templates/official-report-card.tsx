import React from "react";

interface ReportCardData {
  studentName: string;
  grade: string;
  academicYear: string;
  semester: string;
  subjects: { name: string; score: number; grade: string; }[];
  attendance: { present: number; absent: number; late: number; };
  behaviorPoints: number;
  quranProgress: { surahName: string; ayahsMemorized: number; juzCompleted: number; };
  teacherNotes: string;
  principalName: string;
  issueDate: string;
  schoolName: string;
  schoolLogo: string;
}

interface OfficialReportCardProps {
  data: ReportCardData;
}

const gradeMap: Record<string, string> = {
  "A+": "ممتاز", A: "ممتاز", "B+": "جيد جداً", B: "جيد جداً", "C+": "جيد", C: "جيد", "D+": "مقبول", D: "مقبول", F: "ضعيف",
};

const scoreToGrade = (score: number): string => {
  if (score >= 95) return "A+";
  if (score >= 85) return "A";
  if (score >= 75) return "B+";
  if (score >= 65) return "B";
  if (score >= 55) return "C+";
  if (score >= 50) return "C";
  if (score >= 45) return "D+";
  if (score >= 40) return "D";
  return "F";
};

export function OfficialReportCard({ data }: OfficialReportCardProps) {
  const avgScore = data.subjects.length > 0
    ? Math.round(data.subjects.reduce((s, sub) => s + sub.score, 0) / data.subjects.length)
    : 0;
  const overallGrade = scoreToGrade(avgScore);

  return (
    <div
      dir="rtl"
      className="mx-auto max-w-4xl rounded-2xl border-2 border-brand-navy/20 bg-white p-8 shadow-brand-lg print:shadow-none"
      style={{ fontFamily: "'Noto Sans Arabic', system-ui, sans-serif" }}
    >
      <div className="border-b-2 border-brand-gold pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-brand-gold bg-brand-navy text-2xl font-bold text-white">
              {data.schoolLogo || "م"}
            </div>
            <div>
              <h1 className="gold-gradient-text text-xl font-bold">{data.schoolName}</h1>
              <p className="text-xs text-text-muted">بطاقة التقرير الدراسي | Academic Report Card</p>
            </div>
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-brand-navy">العام الدراسي: {data.academicYear}</p>
            <p className="text-xs text-text-muted">{data.semester}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 border-b border-surface-border py-5">
        <div>
          <p className="text-xs font-semibold text-brand-gold uppercase tracking-wider mb-1">بيانات الطالب</p>
          <p className="text-lg font-bold text-text-primary">{data.studentName}</p>
          <p className="text-sm text-text-muted">الصف: {data.grade}</p>
        </div>
        <div className="text-left" dir="ltr">
          <p className="text-xs font-semibold text-brand-gold uppercase tracking-wider mb-1">Student Information</p>
          <p className="text-lg font-bold text-text-primary">{data.studentName}</p>
          <p className="text-sm text-text-muted">Grade: {data.grade}</p>
        </div>
      </div>

      <div className="py-5">
        <p className="mb-3 text-xs font-semibold text-brand-navy uppercase tracking-wider">المواد الدراسية / Academic Subjects</p>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-brand-navy text-white">
              <th className="px-4 py-2 text-right text-xs font-medium">المادة</th>
              <th className="px-4 py-2 text-center text-xs font-medium">الدرجة</th>
              <th className="px-4 py-2 text-center text-xs font-medium">التقدير</th>
              <th className="px-4 py-2 text-left text-xs font-medium" dir="ltr">Subject</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {data.subjects.map((sub) => (
              <tr key={sub.name} className="hover:bg-surface-muted/50">
                <td className="px-4 py-2 font-medium text-text-primary">{sub.name}</td>
                <td className="px-4 py-2 text-center font-bold">{sub.score}</td>
                <td className="px-4 py-2 text-center">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    sub.score >= 85 ? "bg-status-success/10 text-status-success" : sub.score >= 65 ? "bg-status-warning/10 text-status-warning" : "bg-status-error/10 text-status-error"
                  }`}>
                    {gradeMap[sub.grade] || sub.grade}
                  </span>
                </td>
                <td className="px-4 py-2 text-left text-text-muted" dir="ltr">{sub.name}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-brand-gold/10 font-bold">
              <td className="px-4 py-2 text-text-primary">المجموع الكلي</td>
              <td className="px-4 py-2 text-center text-brand-navy">{avgScore}</td>
              <td className="px-4 py-2 text-center">
                <span className="rounded-full bg-brand-gold/20 px-2.5 py-0.5 text-xs font-medium text-brand-gold">{overallGrade}</span>
              </td>
              <td className="px-4 py-2 text-left text-text-muted" dir="ltr">Overall</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="grid grid-cols-3 gap-4 border-t border-surface-border pt-5 pb-4">
        <div className="rounded-lg border border-surface-border p-3">
          <p className="text-[10px] font-semibold text-brand-gold uppercase tracking-wider mb-1">الحضور</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between"><span className="text-text-muted">حاضر</span><span className="font-medium text-status-success">{data.attendance.present}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">غائب</span><span className="font-medium text-status-error">{data.attendance.absent}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">متأخر</span><span className="font-medium text-status-warning">{data.attendance.late}</span></div>
          </div>
        </div>
        <div className="rounded-lg border border-surface-border p-3">
          <p className="text-[10px] font-semibold text-brand-gold uppercase tracking-wider mb-1">السلوك</p>
          <p className="text-2xl font-bold text-center mt-2" style={{ color: data.behaviorPoints >= 0 ? "#10B981" : "#EF4444" }}>
            {data.behaviorPoints >= 0 ? "+" : ""}{data.behaviorPoints}
          </p>
          <p className="text-center text-[10px] text-text-muted">نقطة سلوك</p>
        </div>
        <div className="rounded-lg border border-surface-border p-3">
          <p className="text-[10px] font-semibold text-brand-gold uppercase tracking-wider mb-1">القرآن</p>
          <p className="mt-1 text-xs text-text-primary font-medium">{data.quranProgress.surahName}</p>
          <p className="text-[10px] text-text-muted">{data.quranProgress.ayahsMemorized} آية — {data.quranProgress.juzCompleted} أجزاء</p>
        </div>
      </div>

      {data.teacherNotes && (
        <div className="border-t border-surface-border pt-4 pb-4">
          <p className="text-xs font-semibold text-brand-navy mb-1">ملاحظات المعلم</p>
          <p className="text-sm text-text-primary leading-relaxed">{data.teacherNotes}</p>
        </div>
      )}

      <div className="border-t-2 border-brand-gold/30 pt-4 flex items-center justify-between text-xs text-text-muted">
        <div>
          <p className="font-semibold text-text-primary">{data.principalName}</p>
          <p>مدير المدرسة</p>
        </div>
        <div className="text-left">
          <p>تاريخ الإصدار: {data.issueDate}</p>
          <p className="text-[10px]">Document Ref: RC-{data.academicYear}-{String(Math.floor(Math.random() * 9000) + 1000)}</p>
        </div>
      </div>
    </div>
  );
}