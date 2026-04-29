"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatDataQualityLabel, formatMarketCap, formatPercent, formatScore } from "@/lib/formatters";
import type { RankingRow } from "@/lib/types";

type Props = {
  rows: RankingRow[];
};

type SortKey = "rank" | "magicFormulaScore" | "roc" | "ebitEv" | "qualityScore" | "marketCap";
type ValidationFilter = "all" | "clean" | "warnings";
type MarketCapFilter = "all" | "over50m" | "over100m";

const sortLabels: Record<SortKey, string> = {
  rank: "Magic Formula -sijoitus",
  magicFormulaScore: "Magic Formula -piste",
  roc: "ROC",
  ebitEv: "EBIT/EV",
  qualityScore: "Laatupiste",
  marketCap: "Markkina-arvo"
};

function marketCapValue(row: RankingRow): number {
  return row.financialSnapshot.marketCap ?? -1;
}

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

    if (sortKey === "qualityScore") {
      return b.qualityScore - a.qualityScore || a.ticker.localeCompare(b.ticker);
    }

    return marketCapValue(b) - marketCapValue(a) || a.ticker.localeCompare(b.ticker);
  });
}

function passesMarketCapFilter(row: RankingRow, filter: MarketCapFilter): boolean {
  const marketCap = row.financialSnapshot.marketCap;
  if (filter === "all") {
    return true;
  }

  if (marketCap === null) {
    return false;
  }

  if (filter === "over50m") {
    return marketCap > 50_000_000;
  }

  return marketCap > 100_000_000;
}

export function RankingTable({ rows }: Props) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [validationFilter, setValidationFilter] = useState<ValidationFilter>("all");
  const [marketCapFilter, setMarketCapFilter] = useState<MarketCapFilter>("all");
  const [exchangeFilter, setExchangeFilter] = useState<string>("all");
  const exchangeOptions = useMemo(() => {
    return [...new Set(rows.map((row) => row.exchange))].sort();
  }, [rows]);

  const visibleRows = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = rows.filter((row) => {
      const matchesQuery =
        q.length === 0 || row.ticker.toLowerCase().includes(q) || row.company.toLowerCase().includes(q);

      const matchesExchange = exchangeFilter === "all" || row.exchange === exchangeFilter;
      if (!matchesQuery || !passesMarketCapFilter(row, marketCapFilter) || !matchesExchange) {
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
  }, [exchangeFilter, marketCapFilter, query, rows, sortKey, validationFilter]);

  const warningRows = rows.filter((row) => row.validationWarnings.length > 0).length;

  return (
    <section className="tablePanel">
      <div className="tablePanelHeader">
        <div>
          <p className="eyebrow">Ranking</p>
          <h2>Arvoseulonnan tulokset</h2>
          <p className="sectionLead">Hae yhtiöitä, rajaa markkina-arvon mukaan ja avaa tarkempi yrityssivu.</p>
        </div>
        <Link href="/metodologia" className="textLink">
          Metodologia ja rajaukset
        </Link>
      </div>

      <div className="controlBar controlBarWide">
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
          <span>Markkina-arvo</span>
          <select
            value={marketCapFilter}
            onChange={(event) => setMarketCapFilter(event.target.value as MarketCapFilter)}
          >
            <option value="all">Kaikki</option>
            <option value="over50m">Yli 50 M€</option>
            <option value="over100m">Yli 100 M€</option>
          </select>
        </label>

        <label className="fieldGroup">
          <span>Pörssi</span>
          <select value={exchangeFilter} onChange={(event) => setExchangeFilter(event.target.value)}>
            <option value="all">Kaikki</option>
            {exchangeOptions.map((exchange) => (
              <option key={exchange} value={exchange}>
                {exchange}
              </option>
            ))}
          </select>
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
          <span>Datan laatu</span>
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
          <p>Laajenna hakua tai palauta markkina-arvo- ja datalaatusuodattimet.</p>
        </div>
      ) : (
        <div className="tableSurface">
          <table className="rankingTable">
            <thead>
              <tr>
                <th>Sijoitus</th>
                <th>Yhtiö</th>
                <th className="numberCell">Markkina-arvo</th>
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
                    <td className="numberCell">{formatMarketCap(row.financialSnapshot.marketCap)}</td>
                    <td className="numberCell">{row.magicFormulaScore}</td>
                    <td className="numberCell">{formatPercent(row.roc)}</td>
                    <td className="numberCell">{formatPercent(row.ebitEv)}</td>
                    <td className="numberCell">{formatScore(row.qualityScore)}</td>
                    <td>
                      {isClean ? (
                        <span className="statusBadge statusBadgeOk">Puhdas</span>
                      ) : (
                        <div className="statusStack">
                          <span className="statusBadge statusBadgeWarn">{formatDataQualityLabel(row.validationWarnings)}</span>
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
