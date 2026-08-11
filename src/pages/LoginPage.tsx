import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { colors, inputStyle, primaryButtonStyle } from "../styles/theme";
import { AuthCard, Field } from "../components/Shared";

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
    <AuthCard heading="로그인">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="휴대폰 번호">
          <input
            style={{ ...inputStyle(), width: "100%", boxSizing: "border-box" }}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </Field>
        <Field label="비밀번호">
          <input
            style={{ ...inputStyle(), width: "100%", boxSizing: "border-box" }}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>
        {error && <p style={{ color: colors.pink, fontSize: 13.5 }}>{error}</p>}
        <button type="submit" disabled={submitting} style={{ ...primaryButtonStyle(submitting), width: "100%" }}>
          {submitting ? "로그인 중..." : "로그인"}
        </button>
      </form>
      <p style={{ marginTop: 16, textAlign: "center", fontSize: 14 }}>
        계정이 없으신가요? <Link to="/register">회원가입</Link>
      </p>
    </AuthCard>
  );
}
