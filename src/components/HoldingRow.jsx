import { useState } from "react";
import { formatMoney } from "../Utils/format";

// One row in the holdings list. It's its own component because each row
// needs its own "am I being edited?" state — and hooks like useState can't
// be called inside a .map() callback, only at the top of a component.
function HoldingRow({ holding: h, currency, onRemove, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [costBasis, setCostBasis] = useState("");

  // The cost field stays in the currency it was originally entered in, or in
  // the current display currency if this holding has no cost yet.
  const hasCost = h.costBasis !== null && h.costBasis !== undefined;
  const costCurrency = hasCost ? (h.costCurrency ?? "usd") : currency;

  function startEditing() {
    // Start the inputs from the holding's current values
    setQuantity(String(h.quantity));
    setCostBasis(String(h.costBasis ?? ""));
    setIsEditing(true);
  }

  function handleSave(e) {
    e.preventDefault();

    onUpdate(h.id, {
      quantity: Number(quantity),
      costBasis: costBasis ? Number(costBasis) : null,
      costCurrency,
    });
    setIsEditing(false);
  }

  const isValid = quantity !== "" && Number(quantity) > 0;

  return (
    <li>
      <div className="holding-main">
        <span className="holding-name">
          {h.name} <span className="holding-symbol">{h.symbol}</span>
        </span>
        <span className="holding-value">
          {h.value !== null ? formatMoney(h.value, currency) : "—"}
        </span>
      </div>

      {isEditing ? (
        <form className="holding-edit" onSubmit={handleSave}>
          <input
            type="number"
            step="any"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Quantity"
            aria-label="Quantity"
          />
          <input
            type="number"
            step="any"
            min="0"
            value={costBasis}
            onChange={(e) => setCostBasis(e.target.value)}
            placeholder={`Cost each (${costCurrency.toUpperCase()})`}
            aria-label={`Cost per coin in ${costCurrency.toUpperCase()}`}
          />
          <button type="submit" disabled={!isValid}>
            Save
          </button>
          <button type="button" onClick={() => setIsEditing(false)}>
            Cancel
          </button>
        </form>
      ) : (
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
              {formatMoney(h.profitLoss, currency, { signed: true })} P/L
            </span>
          )}

          <div className="holding-actions">
            <button type="button" onClick={startEditing}>
              Edit
            </button>
            <button
              type="button"
              className="holding-remove"
              onClick={() => onRemove(h.id)}
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

export default HoldingRow;