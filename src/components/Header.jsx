import Brand from "./Brand";
import "../styles/Header.css";

// Top bar: logo on the left, whatever controls you pass in on the right.
export default function Header({ children }) {
  return (
    <header className="site-header">
      <Brand size={28} />
      <div className="site-header-actions">{children}</div>
    </header>
  );
}