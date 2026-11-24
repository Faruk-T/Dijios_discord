import type { AcademicSystemRole, Student360Summary } from "@dijios-connect/contracts";
import { useAuthStore } from "../auth/auth.store.js";

interface StudentRow {
  readonly studentCode: string;
  readonly fullName: string;
  readonly gradeLabel: string;
  readonly gpa: number;
  readonly attendanceRate: number;
  readonly examTrend: string;
  readonly academicAlert: string | null;
  readonly note: string;
}

const ROWS: readonly StudentRow[] = [
  {
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

export function lookupStudent(code: string, role: AcademicSystemRole): Student360Summary | null {
  const student = ROWS.find((item) => item.studentCode === code.trim());
  if (student === undefined) {
    return null;
  }
  return {
    studentCode: student.studentCode,
    fullName: student.fullName,
    gradeLabel: student.gradeLabel,
    gpa: student.gpa,
    attendanceRate: student.attendanceRate,
    examTrend: student.examTrend,
    academicAlert: student.academicAlert,
    pdrConfidentialNote: role === "COUNSELOR" ? student.note : null,
  };
}

export async function loadStudent(
  code: string,
  role: AcademicSystemRole,
): Promise<Student360Summary | null> {
  if (import.meta.env.VITE_AUTH_CLIENT === "simulated" || import.meta.env.MODE === "test") {
    return lookupStudent(code, role);
  }
  const base = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";
  const token = useAuthStore.getState().session?.accessToken;
  const response = await fetch(
    `${base}/api/v1/dijios-bridge/students/${encodeURIComponent(code)}`,
    {
      headers: token === undefined ? {} : { authorization: `Bearer ${token}` },
    },
  );
  if (response.status === 404 || response.status === 400) {
    return null;
  }
  const body: unknown = await response.json();
  return isSummary(body) ? body : null;
}

function isSummary(value: unknown): value is Student360Summary {
  return (
    typeof value === "object" &&
    value !== null &&
    "studentCode" in value &&
    "fullName" in value &&
    "pdrConfidentialNote" in value
  );
}
