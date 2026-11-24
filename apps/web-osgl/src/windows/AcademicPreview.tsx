import type { JSX } from "react";
import { Badge, Card } from "truncgil-uxigl";

export function AcademicPreview({
  title,
  detail,
  tone,
}: {
  readonly title: string;
  readonly detail: string;
  readonly tone: string;
}): JSX.Element {
  return (
    <div className="osgl-preview-grid">
      <Card padding="md">
        <Badge size="sm" variant="tonal">
          {tone}
        </Badge>
        <h2>{title}</h2>
        <p>{detail}</p>
      </Card>
      <Card padding="md">
        <Badge size="sm" variant="filled">
          Canlı
        </Badge>
        <h2>Kurum durumu</h2>
        <p>Örnek Fen ve Teknoloji Koleji bağlı. KVKK izolasyonu açık.</p>
      </Card>
    </div>
  );
}
