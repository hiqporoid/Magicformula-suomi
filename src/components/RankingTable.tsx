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
    <section className="panel panelSpacious">
      <div className="sectionHeader">
        <div>
          <p className="eyebrow">Ranking</p>
          <h2>Arvoseulonnan tulokset</h2>
          <p className="sectionLead">
            Lajittele ja suodata riveja ilman sampledatan fallbackeja. Jokainen linkki avaa saman exportin pohjalta
            rakennetun yhtionakyvan.
          </p>
        </div>
        <Link href="/metodologia" className="textLink">
          Lue metodologia
        </Link>
      </div>

      <div className="toolbarCard">
        <label className="fieldGroup fieldGrow">
          <span>Hae yhtiota</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ticker tai nimi"
            className="searchInput"
            aria-label="Suodata yhtiota"
          />
        </label>

        <label className="fieldGroup">
          <span>Jarjesta</span>
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
            <option value="warnings">Vain varoitukset</option>
          </select>
        </label>
      </div>

      <div className="inlineMeta">
        <span>{visibleRows.length} / {rows.length} rivia nakyvilla</span>
        <span>{warningRows} rivia sisaltaa validointivaroituksia</span>
      </div>

      {visibleRows.length === 0 ? (
        <div className="emptyState">
          <h3>Suodatus ei palauttanut riveja</h3>
          <p>Tarkenna hakua tai palauta validointisuodatin kohtaan Kaikki rivit.</p>
        </div>
      ) : (
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Sijoitus</th>
                <th>Ticker</th>
                <th>Yhtio</th>
                <th>MF-piste</th>
                <th>ROC</th>
                <th>EBIT/EV</th>
                <th>Laatu</th>
                <th>Datan laatu</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.ticker}>
                  <td>
                    <span className="rankBadge">#{row.rank}</span>
                  </td>
                  <td>
                    <Link href={`/yhtio/${row.ticker}`} className="tableLink">
                      {row.ticker}
                    </Link>
                  </td>
                  <td>
                    <div className="cellTitle">{row.company}</div>
                    <div className="cellSubtle">Avaa yhtion taustat ja datan laatu</div>
                  </td>
                  <td>{row.magicFormulaScore}</td>
                  <td>{formatPercent(row.roc)}</td>
                  <td>{formatPercent(row.ebitEv)}</td>
                  <td>{formatScore(row.qualityScore)}</td>
                  <td>
                    {row.validationWarnings.length === 0 ? (
                      <span className="statusBadge statusOk">Lapaisty</span>
                    ) : (
                      <div className="warningList">
                        <span className="statusBadge statusWarn">Varoitus</span>
                        <span>{row.validationWarnings.join(", ")}</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}


