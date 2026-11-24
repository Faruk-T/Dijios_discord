import { FEN_INSTITUTION_ID } from "../../../prisma/seed-data.js";

export interface CatalogStudent {
  readonly institutionId: string;
  readonly studentCode: string;
  readonly fullName: string;
  readonly gradeLabel: string;
  readonly gpa: number;
  readonly attendanceRate: number;
  readonly examTrend: string;
  readonly academicAlert: string | null;
  readonly note: string;
}

export const STUDENT_CATALOG: readonly CatalogStudent[] = [
  {
    institutionId: FEN_INSTITUTION_ID,
    studentCode: "2026-1042",
    fullName: "Kerem Yılmaz",
    gradeLabel: "11/A Fen",
    gpa: 87.4,
    attendanceRate: 96.2,
    examTrend: "Son üç denemede yükseliş",
    academicAlert: "Deneme neti yükselişte",
    note: "Sınav kaygısı için haftalık PDR görüşmesi sürüyor.",
  },
  {
    institutionId: FEN_INSTITUTION_ID,
    studentCode: "2026-1088",
    fullName: "Defne Kaya",
    gradeLabel: "10/B",
    gpa: 91.1,
    attendanceRate: 98.4,
    examTrend: "Stabil",
    academicAlert: null,
    note: "Aile görüşmesi notu yalnızca rehberlikte kalır.",
  },
];
