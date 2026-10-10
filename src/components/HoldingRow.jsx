import { useState } from "react";

// One row in the holdings list. It's its own component because each row
// needs its own "am I being edited?" state — and hooks like useState can't
// be called inside a .map() callback, only at the top of a component.
function HoldingRow({ holding: h, onRemove, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [costBasis, setCostBasis] = useState("");

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
          {h.value !== null ? `$${h.value.toFixed(2)}` : "—"}
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
            placeholder="Cost per coin"
            aria-label="Cost per coin"
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
              {h.profitLoss >= 0 ? "+" : ""}${h.profitLoss.toFixed(2)} P/L
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