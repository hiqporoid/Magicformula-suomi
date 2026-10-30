"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ExcludedCompany } from "@/lib/types";

type Props = {
  excluded: ExcludedCompany[];
};

type Filter = "all" | "methodology" | "data";

export function ExclusionList({ excluded }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [exchange, setExchange] = useState("all");
  const [query, setQuery] = useState("");

  const visibleRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return excluded.filter((company) =>
      (filter === "all" || company.exclusionCategory === filter) &&
      (exchange === "all" || company.exchange === exchange) &&
      (!q || `${company.company} ${company.listingId}`.toLowerCase().includes(q))
    );
  }, [excluded, filter, exchange, query]);

  return (
    <section className="sidePanel mutedPanel">
      <div className="tablePanelHeader compactHeader">
        <div>
          <p className="eyebrow">Poissulut</p>
          <h2>Miksi kaikki eivät rankkaudu?</h2>
          <p className="sectionLead">Metodologinen poissulku ja datan estämä laskenta erotellaan. Kaikkien listausten luvut ja syyt voi avata yhtiösivulta.</p>
        </div>
      </div>

      <label className="fieldGroup">
        <span>Näkymä</span>
        <select value={filter} onChange={(event) => setFilter(event.target.value as Filter)}>
          <option value="all">Kaikki poissuljetut</option>
          <option value="methodology">Metodologiset poissulut</option>
          <option value="data">Datan estämä laskenta</option>
        </select>
      </label>

      <label className="fieldGroup">
        <span>Poissulkujen markkina</span>
        <select value={exchange} onChange={(event) => setExchange(event.target.value)}>
          <option value="all">Suomi ja Ruotsi</option>
          <option value="HEL">Suomi (Helsinki)</option>
          <option value="STO">Ruotsi (Tukholma)</option>
        </select>
      </label>
      <label className="fieldGroup">
        <span>Hae poissuljettua yhtiötä</span>
        <input type="search" className="searchInput" value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>

      <p className="sideNote">{visibleRows.length} / {excluded.length} poissuljettua yhtiötä näkyvissä.</p>

      {visibleRows.length === 0 ? (
        <p className="sideNote">Nykyinen suodatus ei jätä näkyviin poissuljettuja yhtiöitä.</p>
      ) : (
        <ul className="plainList compactList exclusionList">
          {visibleRows.map((company) => (
            <li key={company.listingId}>
              <Link className="companyLink" href={`/yhtio/${encodeURIComponent(company.listingId)}`}>{company.company}</Link> ({company.listingId})
              <div className="tableSubline">{company.exclusionCategory === "methodology" ? "Metodologinen poissulku" : company.exclusionCategory === "data" ? "Datan estämä laskenta" : "Poissulku"}</div>
              <div>{company.reasons.join(" ")}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
