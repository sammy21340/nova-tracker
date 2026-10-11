import { usePortfolio } from "../hooks/usePortfolio";
import AddHoldingForm from "./AddHoldingForm";
import HoldingRow from "./HoldingRow";
import "../styles/Portfolio.css";

// Keyed to coinId, not array position — so a coin's color stays
// the same regardless of what order holdings were added in.
// The five original coins keep their hand-picked colors.
const COIN_COLORS = {
  bitcoin: "#0F0D0B",
  ethereum: "#C98A4B",
  solana: "#4E7A5C",
  ripple: "#7A8CA3",
  tether: "#71706B",
};

// Any other coin takes the next unused color in this list, in the order the
// coins appear — so two different coins never share a color (until the list
// runs out). The five coins above never change; extras can shift if you
// remove an earlier one.
const EXTRA_COLORS = [
  "#8B6F8E",
  "#B36B4F",
  "#5E8C8A",
  "#A89B5C",
  "#6B7A99",
  "#9A6B7A",
  "#7F9A6B",
  "#8C7A66",
];

function Portfolio() {
  const {
    holdings,
    totalValue,
    totalProfitLoss,
    totalProfitLossPct,
    loading,
    error,
    addHolding,
    removeHolding,
    updateHolding,
  } = usePortfolio();

  const colorById = {};
  let extraIndex = 0;
  for (const h of holdings) {
    if (colorById[h.coinId]) continue;
    colorById[h.coinId] =
      COIN_COLORS[h.coinId] ?? EXTRA_COLORS[extraIndex++ % EXTRA_COLORS.length];
  }

  return (
    <div className="portfolio-page">
      <h1>Your Portfolio</h1>
      <div className="total-value">
        <p className="total-value-amount">Total Value: ${totalValue.toFixed(2)}</p>
        {totalProfitLoss !== null && (
          <p
            className={`total-value-pl ${
              totalProfitLoss >= 0 ? "holding-up" : "holding-down"
            }`}
          >
            {totalProfitLoss >= 0 ? "+" : ""}${totalProfitLoss.toFixed(2)} (
            {totalProfitLossPct >= 0 ? "+" : ""}
            {totalProfitLossPct.toFixed(1)}%) overall
          </p>
        )}

        {holdings.length > 0 && (
          <div className="allocation-bar-wrap">
            <div className="allocation-bar">
              {holdings.map((h) => (
                <div
                  key={h.id}
                  style={{
                    width: `${h.allocationPct}%`,
                    background: colorById[h.coinId],
                  }}
                />
              ))}
            </div>
            <div className="allocation-legend">
              {holdings.map((h) => (
                <span key={h.id} className="allocation-legend-item">
                  <span
                    className="allocation-swatch"
                    style={{
                      background: colorById[h.coinId],
                    }}
                  />
                  {h.name} {h.allocationPct.toFixed(0)}%
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <AddHoldingForm onAdd={addHolding} />

      {loading && <p className="loading-text">Loading prices...</p>}
      {error && <p className="page-error">{error}</p>}

      <ul>
        {holdings.map((h) => (
          <HoldingRow
            key={h.id}
            holding={h}
            onRemove={removeHolding}
            onUpdate={updateHolding}
          />
        ))}
      </ul>
    </div>
  );
}

export default Portfolio;