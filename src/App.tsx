import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { NavBar } from "./components/NavBar";
import { FeedPage } from "./pages/FeedPage";
import { MapPage } from "./pages/MapPage";
import { ReportPage } from "./pages/ReportPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { MyPage } from "./pages/MyPage";
import { AdminPage } from "./pages/AdminPage";
import { AdminUserDetailPage } from "./pages/AdminUserDetailPage";
import { ReporterRankingPage } from "./pages/ReporterRankingPage";
import { VisitorRankingPage } from "./pages/VisitorRankingPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/rankings/reporters" element={<ReporterRankingPage />} />
          <Route path="/rankings/visitors" element={<VisitorRankingPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/users/:id" element={<AdminUserDetailPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
