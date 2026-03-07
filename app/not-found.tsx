import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container pageStack">
      <section className="panel emptyState">
        <p className="eyebrow">404</p>
        <h1>Yhtiota ei loytynyt taman exportin sisalta</h1>
        <p>Tarkista ticker tai palaa rankingnakymaan valitsemaan yksi julkaistuista riveista.</p>
        <Link href="/" className="buttonPrimary">
          Takaisin rankingiin
        </Link>
      </section>
    </main>
  );
}

