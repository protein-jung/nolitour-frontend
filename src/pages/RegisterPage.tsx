import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/nolitour_logo.png";
import { cardStyle, colors, inputStyle, primaryButtonStyle } from "../styles/theme";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register({ name, nickname, phone, password });
      navigate("/");
    } catch {
      setError("회원가입에 실패했습니다. 이미 등록된 휴대폰 번호이거나 닉네임일 수 있습니다.");
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
        <h1 style={{ textAlign: "center", fontSize: 26 }}>회원가입</h1>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            style={inputStyle()}
            type="text"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            style={inputStyle()}
            type="text"
            placeholder="닉네임 (서비스에 표시될 이름)"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={20}
            required
          />
          <input
            style={inputStyle()}
            type="tel"
            placeholder="휴대폰 번호 (- 없이 입력)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <input
            style={inputStyle()}
            type="password"
            placeholder="비밀번호 (8자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
          {error && <p style={{ color: colors.pink }}>{error}</p>}
          <button type="submit" disabled={submitting} style={primaryButtonStyle(submitting)}>
            {submitting ? "가입 중..." : "회원가입"}
          </button>
        </form>
        <p style={{ marginTop: 16, textAlign: "center", fontSize: 14 }}>
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </div>
    </div>
  );
}
