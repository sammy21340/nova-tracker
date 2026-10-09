import { usePortfolio } from "../hooks/usePortfolio";
import AddHoldingForm from "./AddHoldingForm";
import "../styles/Portfolio.css";

// Keyed to coinId, not array position — so a coin's color stays
// the same regardless of what order holdings were added in.
const COIN_COLORS = {
  bitcoin: "#0F0D0B",
  ethereum: "#C98A4B",
  solana: "#4E7A5C",
  ripple: "#7A8CA3",
  tether: "#71706B",
};
const FALLBACK_COLOR = "#A9A79F";

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
  } = usePortfolio();

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
                    background: COIN_COLORS[h.coinId] || FALLBACK_COLOR,
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
                      background: COIN_COLORS[h.coinId] || FALLBACK_COLOR,
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
          <li key={h.id}>
            <div className="holding-main">
              <span className="holding-name">
                {h.name} <span className="holding-symbol">{h.symbol}</span>
              </span>
              <span className="holding-value">
                {h.value !== null ? `$${h.value.toFixed(2)}` : "—"}
              </span>
            </div>

            <div className="holding-details">
              <span>
                {h.quantity} {h.symbol} · {h.allocationPct.toFixed(1)}%
              </span>

              {h.change24h !== null && (
                <span className={h.change24h >= 0 ? "holding-up" : "holding-down"}>
                  {h.change24h >= 0 ? "+" : ""}
                  {h.change24h.toFixed(2)}% (24h)
                </span>
              )}

              {h.profitLoss !== null && (
                <span className={h.profitLoss >= 0 ? "holding-up" : "holding-down"}>
                  {h.profitLoss >= 0 ? "+" : ""}${h.profitLoss.toFixed(2)} P/L
                </span>
              )}
            </div>

            <button onClick={() => removeHolding(h.id)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Portfolio;