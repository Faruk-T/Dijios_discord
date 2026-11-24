import type { JSX } from "react";
import { lazy, Suspense } from "react";

const LiveSheet = lazy(() =>
  import("./sheetgl-live.js").then((mod) => ({ default: mod.SheetGlLive })),
);

export function SheetGlAnalysisWindow(): JSX.Element {
  const live = import.meta.env.MODE !== "test";
  return (
    <section className="academic-fill">
      <header className="academic-ribbon">
        <strong>11. Sınıflar Matematik Deneme Analiz Matrisi</strong>
        <span>SheetGL</span>
      </header>
      <div className="academic-engine">
        {live ? (
          <Suspense fallback={<p>Analiz tablosu hazırlanıyor</p>}>
            <LiveSheet />
          </Suspense>
        ) : (
          <p>Analiz tablosu hazırlanıyor</p>
        )}
      </div>
    </section>
  );
}
