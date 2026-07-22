import { Link, useNavigate } from "react-router-dom";
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

export const NAVBAR_HEIGHT = 64;

export function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav
      style={{
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

      <Link to="/map" style={navLinkStyle}>
        지도
      </Link>
      <Link to="/report" style={navLinkStyle}>
        놀이터 제보
      </Link>
      <ReporterRankingButton />

      <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
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
    </nav>
  );
}
