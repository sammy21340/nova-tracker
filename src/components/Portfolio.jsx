import { usePortfolio } from "../hooks/usePortfolio";
import AddHoldingForm from "./AddHoldingForm";
import HoldingRow from "./HoldingRow";
import { CURRENCIES, formatMoney } from "../Utils/format";
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
    currency,
    setCurrency,
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
      <div className="portfolio-header">
        <h1>Your Portfolio</h1>
        <div className="currency-toggle" role="group" aria-label="Display currency">
          {CURRENCIES.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={currency === c}
              onClick={() => setCurrency(c)}
            >
              {c.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="total-value">
        <p className="total-value-label">Total value</p>
        <p className="total-value-amount">{formatMoney(totalValue, currency)}</p>

        {totalProfitLoss !== null && (
          <p
            className={`total-value-pl ${
              totalProfitLoss >= 0 ? "holding-up" : "holding-down"
            }`}
          >
            {formatMoney(totalProfitLoss, currency, { signed: true })}
            {totalProfitLossPct !== null &&
              ` (${totalProfitLossPct >= 0 ? "+" : ""}${totalProfitLossPct.toFixed(1)}%)`}{" "}
            overall
          </p>
        )}

        {currency === "ngn" && (
          <p className="currency-note">
            Naira values use CoinGecko's USD/NGN rate, which can differ from the
            rate you'd get on P2P platforms.
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

      <AddHoldingForm onAdd={addHolding} currency={currency} />

      {loading && <p className="loading-text">Loading prices...</p>}
      {error && <p className="page-error">{error}</p>}

      <ul>
        {holdings.map((h) => (
          <HoldingRow
            key={h.id}
            holding={h}
            currency={currency}
            onRemove={removeHolding}
            onUpdate={updateHolding}
          />
        ))}
      </ul>
    </div>
  );
}

export default Portfolio;