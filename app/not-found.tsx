import Link from "next/link";

export default function NotFound() {
  return (
    <main className="shellContainer pageStack pageOffset">
      <section className="heroSurface heroSurfaceCompact">
        <div className="heroMainCard emptyState">
          <p className="eyebrow">404</p>
          <h1>Yhtiötä ei löytynyt tästä viennistä</h1>
          <p>Tarkista ticker tai palaa rankingnäkymään valitsemaan yksi julkaistuista riveistä.</p>
          <Link href="/" className="buttonPrimary">
            Takaisin rankingiin
          </Link>
        </div>
      </section>
    </main>
  );
}