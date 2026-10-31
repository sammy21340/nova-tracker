import Brand from "./Brand";
import "../styles/Footer.css";

export default function Footer() {
  // Generated, so the year never goes stale
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-top">
        <Brand size={22} />
        <p className="site-footer-tagline">Every coin, in dollars and naira.</p>
      </div>

      <p className="site-footer-trust">
        Portiva never holds your funds or asks for your keys. Your portfolio is
        saved on this device only.
      </p>

      <p className="site-footer-small">
        Prices by{" "}
        <a href="https://www.coingecko.com/" target="_blank" rel="noopener noreferrer">
          CoinGecko
        </a>
        . Not financial advice. Prices may be delayed or inaccurate.
      </p>

      <p className="site-footer-small">&copy; {year} Portiva</p>
    </footer>
  );
}