import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/nolitour_logo.png";
import { colors, radius } from "../styles/theme";
import { ReporterRankingButton } from "./ReporterRankingButton";

const navLinkStyle = {
  color: colors.brown,
  textDecoration: "none",
  fontFamily: "'Jua', sans-serif",
  fontSize: 15,
  padding: "6px 14px",
  borderRadius: radius.pill,
};

const mobileNavLinkStyle = {
  ...navLinkStyle,
  padding: "12px 6px",
  fontSize: 16,
  width: "100%",
  boxSizing: "border-box" as const,
};

export const NAVBAR_HEIGHT = 64;

export function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0 24px",
        height: NAVBAR_HEIGHT,
        boxSizing: "border-box",
        background: "#fff",
        borderBottom: `3px solid ${colors.creamDeep}`,
      }}
    >
      <Link
        to="/"
        style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}
      >
        <img src={logo} alt="놀이투어" style={{ height: 40, width: 40, objectFit: "contain" }} />
        <span style={{ fontFamily: "'Jua', sans-serif", fontSize: 20, color: colors.brown }}>
          놀이투어
        </span>
      </Link>

      <div className="navbar-links" style={{ marginLeft: 8 }}>
        <Link to="/map" style={navLinkStyle}>
          지도
        </Link>
        <Link to="/report" style={navLinkStyle}>
          놀이터 제보
        </Link>
        <ReporterRankingButton />
      </div>

      <div className="navbar-links" style={{ marginLeft: "auto", gap: 12 }}>
        {user ? (
          <>
            <Link to="/mypage" style={navLinkStyle}>
              마이페이지
            </Link>
            {user.is_admin && (
              <Link to="/admin" style={navLinkStyle}>
                🛠 관리자
              </Link>
            )}
            <span style={{ color: colors.textMuted, fontSize: 14 }}>{user.nickname}님</span>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate("/");
              }}
              style={{
                border: "none",
                background: colors.cream,
                color: colors.brown,
                borderRadius: radius.pill,
                padding: "6px 14px",
                fontFamily: "'Jua', sans-serif",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              로그아웃
            </button>
          </>
        ) : (
          <Link to="/login" style={navLinkStyle}>
            로그인
          </Link>
        )}
      </div>

      <button
        type="button"
        className="navbar-toggle"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="메뉴 열기"
        style={{
          marginLeft: "auto",
          border: "none",
          background: "transparent",
          fontSize: 22,
          color: colors.brown,
          cursor: "pointer",
          padding: 8,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      <div
        className={`navbar-mobile-menu${menuOpen ? " open" : ""}`}
        style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          background: "#fff",
          borderBottom: `3px solid ${colors.creamDeep}`,
          boxShadow: "0 8px 14px rgba(92, 61, 38, 0.12)",
          flexDirection: "column",
          padding: "8px 20px 16px",
          zIndex: 30,
        }}
      >
        <Link to="/map" style={mobileNavLinkStyle}>
          지도
        </Link>
        <Link to="/report" style={mobileNavLinkStyle}>
          놀이터 제보
        </Link>
        <div style={{ padding: "12px 6px 12px 0" }}>
          <ReporterRankingButton />
        </div>
        {user ? (
          <>
            <Link to="/mypage" style={mobileNavLinkStyle}>
              마이페이지
            </Link>
            {user.is_admin && (
              <Link to="/admin" style={mobileNavLinkStyle}>
                🛠 관리자
              </Link>
            )}
            <span style={{ color: colors.textMuted, fontSize: 14, padding: "8px 6px" }}>
              {user.nickname}님
            </span>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate("/");
              }}
              style={{
                border: "none",
                background: colors.cream,
                color: colors.brown,
                borderRadius: radius.pill,
                padding: "10px 16px",
                fontFamily: "'Jua', sans-serif",
                fontSize: 15,
                cursor: "pointer",
                marginTop: 8,
                width: "fit-content",
              }}
            >
              로그아웃
            </button>
          </>
        ) : (
          <Link to="/login" style={mobileNavLinkStyle}>
            로그인
          </Link>
        )}
      </div>
    </nav>
  );
}
