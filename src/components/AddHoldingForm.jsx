import { useState } from "react";

const AVAILABLE_COINS = [
  { coinId: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { coinId: "ethereum", symbol: "ETH", name: "Ethereum" },
  { coinId: "solana", symbol: "SOL", name: "Solana" },
  { coinId: "ripple", symbol: "XRP", name: "XRP" },
  { coinId: "tether", symbol: "USDT", name: "Tether" },
];

function AddHoldingForm({ onAdd }) {
  const [coinId, setCoinId] = useState(AVAILABLE_COINS[0].coinId);
  const [quantity, setQuantity] = useState("");
  const [costBasis, setCostBasis] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    const numericQuantity = Number(quantity);

    if (!quantity || numericQuantity <= 0) {
      setError("Enter a quantity greater than 0.");
      return;
    }

    const selectedCoin = AVAILABLE_COINS.find((c) => c.coinId === coinId);

    onAdd({
      coinId: selectedCoin.coinId,
      symbol: selectedCoin.symbol,
      name: selectedCoin.name,
      quantity: numericQuantity,
      costBasis: costBasis ? Number(costBasis) : null,
    });

    setQuantity("");
    setCostBasis("");
    setError("");
  }

  return (
    <form className="add-holding-form" onSubmit={handleSubmit}>
      <h3>Add a holding</h3>

      <div className="form-row">
        <label>Coin</label>
        <select value={coinId} onChange={(e) => setCoinId(e.target.value)}>
          {AVAILABLE_COINS.map((coin) => (
            <option key={coin.coinId} value={coin.coinId}>
              {coin.name} ({coin.symbol})
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <label>Quantity</label>
        <input
          type="number"
          step="any"
          min="0"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="0.00"
        />
      </div>

      <div className="form-row">
        <label>Cost per coin (optional)</label>
        <input
          type="number"
          step="any"
          min="0"
          value={costBasis}
          onChange={(e) => setCostBasis(e.target.value)}
          placeholder="What you paid, in USD"
        />
      </div>

      {error && <small className="error">{error}</small>}

      <button type="submit">Add Holding</button>
    </form>
  );
}

export default AddHoldingForm;