import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/nolitour_logo.png";
import { cardStyle, colors, inputStyle, primaryButtonStyle } from "../styles/theme";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ phone, password });
      navigate("/");
    } catch {
      setError("휴대폰 번호 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ background: colors.cream, flex: 1, display: "flex" }}>
      <div style={{ ...cardStyle(), maxWidth: 360, margin: "72px auto", padding: 32, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <img src={logo} alt="놀이투어" style={{ width: 72, height: 72, objectFit: "contain" }} />
        </div>
        <h1 style={{ textAlign: "center", fontSize: 26 }}>로그인</h1>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            style={inputStyle()}
            type="tel"
            placeholder="휴대폰 번호"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <input
            style={inputStyle()}
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p style={{ color: colors.pink }}>{error}</p>}
          <button type="submit" disabled={submitting} style={primaryButtonStyle(submitting)}>
            {submitting ? "로그인 중..." : "로그인"}
          </button>
        </form>
        <p style={{ marginTop: 16, textAlign: "center", fontSize: 14 }}>
          계정이 없으신가요? <Link to="/register">회원가입</Link>
        </p>
      </div>
    </div>
  );
}
