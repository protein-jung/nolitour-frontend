import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "14px 24px",
        borderBottom: "1px solid #eee",
        height: 56,
        boxSizing: "border-box",
      }}
    >
      <Link to="/" style={{ fontWeight: 700, textDecoration: "none", color: "#111" }}>
        놀이투어
      </Link>
      <Link to="/map" style={{ color: "#333" }}>
        지도
      </Link>
      <Link to="/report" style={{ color: "#333" }}>
        놀이터 제보
      </Link>

      <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
        {user ? (
          <>
            <span>{user.name}님</span>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              로그아웃
            </button>
          </>
        ) : (
          <Link to="/login" style={{ color: "#333" }}>
            로그인
          </Link>
        )}
      </div>
    </nav>
  );
}
