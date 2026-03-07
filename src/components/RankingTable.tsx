"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatPercent, formatScore } from "@/lib/formatters";
import type { RankingRow } from "@/lib/types";

type Props = {
  rows: RankingRow[];
};

type SortKey = "rank" | "magicFormulaScore" | "roc" | "ebitEv" | "qualityScore";
type ValidationFilter = "all" | "clean" | "warnings";

const sortLabels: Record<SortKey, string> = {
  rank: "Magic Formula -sijoitus",
  magicFormulaScore: "Magic Formula -piste",
  roc: "ROC",
  ebitEv: "EBIT/EV",
  qualityScore: "Laatupiste"
};

function sortRows(rows: RankingRow[], sortKey: SortKey): RankingRow[] {
  return [...rows].sort((a, b) => {
    if (sortKey === "rank") {
      return a.rank - b.rank || a.ticker.localeCompare(b.ticker);
    }

    if (sortKey === "magicFormulaScore") {
      return a.magicFormulaScore - b.magicFormulaScore || a.ticker.localeCompare(b.ticker);
    }

    if (sortKey === "roc") {
      return b.roc - a.roc || a.ticker.localeCompare(b.ticker);
    }

    if (sortKey === "ebitEv") {
      return b.ebitEv - a.ebitEv || a.ticker.localeCompare(b.ticker);
    }

    return b.qualityScore - a.qualityScore || a.ticker.localeCompare(b.ticker);
  });
}

export function RankingTable({ rows }: Props) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [validationFilter, setValidationFilter] = useState<ValidationFilter>("all");

  const visibleRows = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = rows.filter((row) => {
      const matchesQuery =
        q.length === 0 || row.ticker.toLowerCase().includes(q) || row.company.toLowerCase().includes(q);

      if (!matchesQuery) {
        return false;
      }

      if (validationFilter === "clean") {
        return row.validationWarnings.length === 0;
      }

      if (validationFilter === "warnings") {
        return row.validationWarnings.length > 0;
      }

      return true;
    });

    return sortRows(filtered, sortKey);
  }, [query, rows, sortKey, validationFilter]);

  const warningRows = rows.filter((row) => row.validationWarnings.length > 0).length;

  return (
    <section className="tablePanel">
      <div className="tablePanelHeader">
        <div>
          <p className="eyebrow">Ranking</p>
          <h2>Arvoseulonnan tulokset</h2>
          <p className="sectionLead">
            Suodata yhtiöitä nimen tai tickerin perusteella, järjestä rivejä halutun mittarin mukaan ja avaa
            yhtiökohtainen näkymä yhdellä klikkauksella.
          </p>
        </div>
        <Link href="/metodologia" className="textLink">
          Metodologia ja rajaukset
        </Link>
      </div>

      <div className="controlBar">
        <label className="fieldGroup fieldGroupWide">
          <span>Hae yhtiötä</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ticker tai yhtiön nimi"
            className="searchInput"
            aria-label="Suodata yhtiöitä"
          />
        </label>

        <label className="fieldGroup">
          <span>Järjestä</span>
          <select value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)}>
            {Object.entries(sortLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="fieldGroup">
          <span>Validointi</span>
          <select
            value={validationFilter}
            onChange={(event) => setValidationFilter(event.target.value as ValidationFilter)}
          >
            <option value="all">Kaikki rivit</option>
            <option value="clean">Vain puhtaat rivit</option>
            <option value="warnings">Vain huomiorivit</option>
          </select>
        </label>
      </div>

      <div className="tableMetaBar">
        <span>{visibleRows.length} / {rows.length} riviä näkyvissä</span>
        <span>{warningRows} rivillä on datalaadun huomio</span>
      </div>

      {visibleRows.length === 0 ? (
        <div className="emptyState">
          <p className="eyebrow">Ei tuloksia</p>
          <h3>Nykyinen suodatus ei palauttanut rivejä</h3>
          <p>Laajenna hakua tai palauta validointisuodatin kohtaan Kaikki rivit.</p>
        </div>
      ) : (
        <div className="tableSurface">
          <table className="rankingTable">
            <thead>
              <tr>
                <th>Sijoitus</th>
                <th>Yhtiö</th>
                <th className="numberCell">MF-piste</th>
                <th className="numberCell">ROC</th>
                <th className="numberCell">EBIT/EV</th>
                <th className="numberCell">Laatu</th>
                <th>Datan laatu</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => {
                const isClean = row.validationWarnings.length === 0;

                return (
                  <tr key={row.ticker} className={row.rank <= 3 ? "topRankRow" : undefined}>
                    <td>
                      <span className="rankPill">#{row.rank}</span>
                    </td>
                    <td>
                      <Link href={`/yhtio/${row.ticker}`} className="companyLink">
                        {row.company}
                      </Link>
                      <div className="tableSubline">{row.ticker}</div>
                    </td>
                    <td className="numberCell">{row.magicFormulaScore}</td>
                    <td className="numberCell">{formatPercent(row.roc)}</td>
                    <td className="numberCell">{formatPercent(row.ebitEv)}</td>
                    <td className="numberCell">{formatScore(row.qualityScore)}</td>
                    <td>
                      {isClean ? (
                        <span className="statusBadge statusBadgeOk">Läpäissyt</span>
                      ) : (
                        <div className="statusStack">
                          <span className="statusBadge statusBadgeWarn">Huomio</span>
                          <span>{row.validationWarnings.join(", ")}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}