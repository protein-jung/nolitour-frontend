import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { colors, inputStyle, primaryButtonStyle } from "../styles/theme";
import { extractApiErrorMessage } from "../lib/apiError";
import { AuthCard, Field } from "../components/Shared";

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
    } catch (e) {
      setError(extractApiErrorMessage(e, "회원가입에 실패했습니다. 잠시 후 다시 시도해주세요."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard heading="회원가입">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="이름">
          <input
            style={{ ...inputStyle(), width: "100%", boxSizing: "border-box" }}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Field>
        <Field label="닉네임 (서비스에 표시될 이름)">
          <input
            style={{ ...inputStyle(), width: "100%", boxSizing: "border-box" }}
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={20}
            required
          />
        </Field>
        <Field label="휴대폰 번호 (- 없이 입력)">
          <input
            style={{ ...inputStyle(), width: "100%", boxSizing: "border-box" }}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </Field>
        <Field label="비밀번호 (8자 이상)">
          <input
            style={{ ...inputStyle(), width: "100%", boxSizing: "border-box" }}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </Field>
        {error && <p style={{ color: colors.pink, fontSize: 13.5 }}>{error}</p>}
        <button type="submit" disabled={submitting} style={{ ...primaryButtonStyle(submitting), width: "100%" }}>
          {submitting ? "가입 중..." : "회원가입"}
        </button>
      </form>
      <p style={{ marginTop: 16, textAlign: "center", fontSize: 14 }}>
        이미 계정이 있으신가요? <Link to="/login">로그인</Link>
      </p>
    </AuthCard>
  );
}
