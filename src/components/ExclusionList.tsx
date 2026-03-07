"use client";

import { useMemo, useState } from "react";
import type { ExcludedCompany } from "@/lib/types";

type Props = {
  excluded: ExcludedCompany[];
};

type Filter = "all" | "nonFinancial" | "financialOnly";

export function ExclusionList({ excluded }: Props) {
  const [filter, setFilter] = useState<Filter>("all");

  const visibleRows = useMemo(() => {
    if (filter === "financialOnly") {
      return excluded.filter((company) => company.isFinancial);
    }

    if (filter === "nonFinancial") {
      return excluded.filter((company) => !company.isFinancial);
    }

    return excluded;
  }, [excluded, filter]);

  return (
    <section className="sidePanel mutedPanel">
      <div className="tablePanelHeader compactHeader">
        <div>
          <p className="eyebrow">Poissulut</p>
          <h2>Miksi kaikki universen yhtiöt eivät rankkaudu?</h2>
          <p className="sectionLead">
            Finanssiyhtiöt suljetaan pois metodologisena valintana. Muut poissulut liittyvät puuttuviin tai
            vertailukelvottomiin talouslukuihin.
          </p>
        </div>
      </div>

      <label className="fieldGroup">
        <span>Poissulkunäkymä</span>
        <select value={filter} onChange={(event) => setFilter(event.target.value as Filter)}>
          <option value="all">Kaikki poissuljetut</option>
          <option value="nonFinancial">Piilota finanssipoissulut</option>
          <option value="financialOnly">Vain finanssipoissulut</option>
        </select>
      </label>

      <p className="sideNote">{visibleRows.length} / {excluded.length} poissuljettua yhtiötä näkyvissä.</p>

      {visibleRows.length === 0 ? (
        <p className="sideNote">Nykyinen suodatus ei jätä näkyviin poissuljettuja yhtiöitä.</p>
      ) : (
        <ul className="plainList compactList exclusionList">
          {visibleRows.map((company) => (
            <li key={company.ticker}>
              <strong>{company.company}</strong> ({company.ticker})
              <div>{company.reasons.join(" ")}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
