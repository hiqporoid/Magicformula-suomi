"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { RankingRow } from "@/lib/types";

type Props = {
  rows: RankingRow[];
};

type SortKey = "rank" | "ebitEv" | "qualityScore";

export function RankingTable({ rows }: Props) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("rank");

  const visibleRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = rows.filter((row) => {
      if (!q) {
        return true;
      }
      return row.ticker.toLowerCase().includes(q) || row.company.toLowerCase().includes(q);
    });

    return [...filtered].sort((a, b) => {
      if (sortKey === "rank") {
        return a.rank - b.rank || a.ticker.localeCompare(b.ticker);
      }
      if (sortKey === "ebitEv") {
        return b.ebitEv - a.ebitEv || a.ticker.localeCompare(b.ticker);
      }
      return b.qualityScore - a.qualityScore || a.ticker.localeCompare(b.ticker);
    });
  }, [query, rows, sortKey]);

  return (
    <div>
      <div className="toolbar">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Suodata tickerillä tai nimellä"
          className="searchInput"
          aria-label="Suodata yhtiöitä"
        />
        <label>
          Järjestä:
          <select value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)}>
            <option value="rank">Magic Formula -sijoitus</option>
            <option value="ebitEv">EBIT/EV (suurin ensin)</option>
            <option value="qualityScore">Laatupisteet (suurin ensin)</option>
          </select>
        </label>
      </div>

      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>Sijoitus</th>
              <th>Ticker</th>
              <th>Yhtiö</th>
              <th>Magic Formula -piste</th>
              <th>ROC</th>
              <th>EBIT/EV</th>
              <th>Laatu</th>
              <th>Datan laatu</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.ticker}>
                <td>{row.rank}</td>
                <td>
                  <Link href={`/yhtio/${row.ticker}`}>{row.ticker}</Link>
                </td>
                <td>{row.company}</td>
                <td>{row.magicFormulaScore}</td>
                <td>{row.roc.toFixed(4)}</td>
                <td>{row.ebitEv.toFixed(4)}</td>
                <td>{row.qualityScore.toFixed(2)}</td>
                <td>{row.validationWarnings.length === 0 ? "OK" : row.validationWarnings.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
