import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/nolitour_logo.png";
import { colors, fonts, radius } from "../styles/theme";
import { IconCalendarDays, IconFlame, IconFootprints, IconTrophy, IconWrench } from "./Shared";

function NavLabel({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      {icon}
      {children}
    </span>
  );
}

const navLinkStyle = {
  color: colors.brown,
  textDecoration: "none",
  fontFamily: fonts.ui,
  fontSize: 15,
  padding: "6px 14px",
  borderRadius: radius.pill,
  transition: "background 0.15s ease, color 0.15s ease",
};

const navLinkActiveStyle = {
  background: colors.cream,
  color: colors.greenDark,
};

const mobileNavLinkStyle = {
  ...navLinkStyle,
  padding: "12px 6px",
  fontSize: 16,
  width: "100%",
  boxSizing: "border-box" as const,
};

const NAV_ITEMS: { to: string; label: ReactNode }[] = [
  { to: "/map", label: "지도" },
  { to: "/report", label: "놀이터 제보" },
  {
    to: "/rankings/reporters",
    label: (
      <NavLabel icon={<IconTrophy />}>제보왕</NavLabel>
    ),
  },
  {
    to: "/rankings/visitors",
    label: (
      <NavLabel icon={<IconFootprints />}>왔다감왕</NavLabel>
    ),
  },
  {
    to: "/rankings/playgrounds",
    label: (
      <NavLabel icon={<IconFlame />}>인기 놀이터</NavLabel>
    ),
  },
  {
    to: "/calendar",
    label: (
      <NavLabel icon={<IconCalendarDays />}>놀이터린더</NavLabel>
    ),
  },
];

export const NAVBAR_HEIGHT = 64;

export function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

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
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 3,
          backgroundImage: `repeating-linear-gradient(90deg, ${colors.yellow} 0 16px, ${colors.green} 16px 32px)`,
          opacity: 0.85,
        }}
      />

      <Link
        to="/"
        style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}
      >
        <img src={logo} alt="놀이투어" style={{ height: 40, width: 40, objectFit: "contain" }} />
        <span style={{ fontFamily: fonts.display, fontSize: 20, color: colors.brown }}>
          놀이투어
        </span>
      </Link>

      <div className="navbar-links" style={{ marginLeft: 8 }}>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            style={isActive(item.to) ? { ...navLinkStyle, ...navLinkActiveStyle } : navLinkStyle}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="navbar-links" style={{ marginLeft: "auto", gap: 12 }}>
        {user ? (
          <>
            <Link
              to="/mypage"
              style={isActive("/mypage") ? { ...navLinkStyle, ...navLinkActiveStyle } : navLinkStyle}
            >
              마이페이지
            </Link>
            {user.is_admin && (
              <Link
                to="/admin"
                style={isActive("/admin") ? { ...navLinkStyle, ...navLinkActiveStyle } : navLinkStyle}
              >
                <NavLabel icon={<IconWrench />}>관리자</NavLabel>
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
                fontFamily: fonts.ui,
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
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            style={
              isActive(item.to)
                ? { ...mobileNavLinkStyle, ...navLinkActiveStyle }
                : mobileNavLinkStyle
            }
          >
            {item.label}
          </Link>
        ))}
        {user ? (
          <>
            <Link
              to="/mypage"
              style={
                isActive("/mypage")
                  ? { ...mobileNavLinkStyle, ...navLinkActiveStyle }
                  : mobileNavLinkStyle
              }
            >
              마이페이지
            </Link>
            {user.is_admin && (
              <Link
                to="/admin"
                style={
                  isActive("/admin")
                    ? { ...mobileNavLinkStyle, ...navLinkActiveStyle }
                    : mobileNavLinkStyle
                }
              >
                <NavLabel icon={<IconWrench />}>관리자</NavLabel>
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
                fontFamily: fonts.ui,
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
