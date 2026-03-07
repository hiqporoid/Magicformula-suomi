import type { RankingRow } from "@/lib/types";

type Props = {
  rows: RankingRow[];
};

export function RankingTable({ rows }: Props) {
  return (
    <div className="tableWrap">
      <table>
        <thead>
          <tr>
            <th>Sijoitus</th>
            <th>Ticker</th>
            <th>Yhtiö</th>
            <th>Magic Formula</th>
            <th>EBIT/EV</th>
            <th>Laatu</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.ticker}>
              <td>{row.rank}</td>
              <td>{row.ticker}</td>
              <td>{row.company}</td>
              <td>{row.magicFormulaScore.toFixed(2)}</td>
              <td>{row.ebitEv.toFixed(4)}</td>
              <td>{row.qualityScore.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
