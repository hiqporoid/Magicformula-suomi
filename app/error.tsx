"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="shellContainer pageStack pageOffset">
      <section className="heroSurface heroSurfaceCompact">
        <div className="heroMainCard emptyState">
          <p className="eyebrow">Virhetila</p>
          <h1>Rankingdatan lataus epäonnistui</h1>
          <p>JSON-vienti ei vastannut odotettua muotoa tai sivun renderöinti keskeytyi.</p>
          <button type="button" onClick={() => reset()} className="buttonPrimary">
            Yritä uudelleen
          </button>
        </div>
      </section>
    </main>
  );
}