import "@/styles/components/navbar.scss";
export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar__brand">
        <span className="navbar__logo">⚡</span>
        TrabahoTrack
      </div>
      <div className="navbar__actions">
        {/* We will add Share/Settings buttons here later */}
      </div>
    </nav>
  );
}
