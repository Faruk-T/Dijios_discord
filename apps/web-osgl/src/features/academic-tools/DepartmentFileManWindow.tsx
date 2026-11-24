import type { JSX } from "react";
import { lazy, Suspense } from "react";

const LiveFileMan = lazy(() =>
  import("./fileman-live.js").then((mod) => ({ default: mod.FileManLive })),
);

export function DepartmentFileManWindow(): JSX.Element {
  const live = import.meta.env.MODE !== "test";
  return (
    <section className="academic-fill">
      <header className="academic-ribbon">
        <strong>Matematik Zümresi Arşivi</strong>
        <span>Kurum içi sanal sürücü · KVKK</span>
      </header>
      <div className="academic-engine">
        {live ? (
          <Suspense fallback={<p>Dosya gezgini hazırlanıyor</p>}>
            <LiveFileMan />
          </Suspense>
        ) : (
          <p>Dosya gezgini hazırlanıyor</p>
        )}
      </div>
    </section>
  );
}
