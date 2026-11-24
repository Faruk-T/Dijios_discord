import type { Student360Summary } from "@dijios-connect/contracts";
import type { JSX } from "react";
import { useState } from "react";
import { Badge, Card } from "truncgil-uxigl";
import { useAuthStore } from "../auth/auth.store.js";
import { loadStudent } from "./student-summary.client.js";

export function Student360QuickWindow(): JSX.Element {
  const role = useAuthStore((state) => state.session?.systemRole ?? "TEACHER");
  const [code, setCode] = useState("2026-1042");
  const [summary, setSummary] = useState<Student360Summary | null>(null);
  const [missing, setMissing] = useState(false);
  return (
    <div className="student-window">
      <Card padding="md">
        <Badge size="sm" variant="tonal">
          KVKK
        </Badge>
        <h2>dijiOS Öğrenci 360°</h2>
        <label>
          Öğrenci numarası
          <input
            aria-label="Öğrenci numarası"
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
        </label>
        <button
          type="button"
          onClick={() => {
            void loadStudent(code, role).then((next) => {
              setSummary(next);
              setMissing(next === null);
            });
          }}
        >
          Ara
        </button>
        {missing ? <p>Öğrenci bulunamadı</p> : null}
        {summary === null ? null : <StudentKpis summary={summary} />}
      </Card>
    </div>
  );
}

function StudentKpis({ summary }: { readonly summary: Student360Summary }): JSX.Element {
  const note = summary.pdrConfidentialNote;
  return (
    <div>
      <p>
        {summary.fullName} · {summary.gradeLabel}
      </p>
      <div className="kpi-row">
        <Card padding="sm">
          <strong>Genel Ortalama</strong>
          <p>{summary.gpa}</p>
        </Card>
        <Card padding="sm">
          <strong>Devam Oranı</strong>
          <p>%{summary.attendanceRate}</p>
        </Card>
        <Card padding="sm">
          <strong>Son Deneme Eğilimi</strong>
          <p>{summary.examTrend}</p>
        </Card>
      </div>
      <p className="student-note">{note === null ? "PDR notu bu rol için gizli." : note}</p>
    </div>
  );
}
