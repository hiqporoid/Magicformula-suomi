"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="container pageStack">
      <section className="panel emptyState">
        <p className="eyebrow">Virhe</p>
        <h1>Rankingdatan lataus epaonnistui</h1>
        <p>
          JSON-export ei vastannut odotettua muotoa tai sivun renderointi keskeytyi. Paivita export ja yrita
          uudelleen.
        </p>
        <button type="button" onClick={() => reset()} className="buttonPrimary">
          Yrita uudelleen
        </button>
      </section>
    </main>
  );
}

