import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { NavBar } from "./components/NavBar";
import { HomePage } from "./pages/HomePage";
import { FeedPage } from "./pages/FeedPage";
import { MapPage } from "./pages/MapPage";
import { ReportPage } from "./pages/ReportPage";
import { EditPlaygroundPage } from "./pages/EditPlaygroundPage";
import { EditHistoryPage } from "./pages/EditHistoryPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { MyPage } from "./pages/MyPage";
import { AdminPage } from "./pages/AdminPage";
import { AdminUserDetailPage } from "./pages/AdminUserDetailPage";
import { ReporterRankingPage } from "./pages/ReporterRankingPage";
import { VisitorRankingPage } from "./pages/VisitorRankingPage";
import { PlaygroundRankingPage } from "./pages/PlaygroundRankingPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/playgrounds/:id/edit" element={<EditPlaygroundPage />} />
          <Route path="/playgrounds/:id/edits" element={<EditHistoryPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/rankings/reporters" element={<ReporterRankingPage />} />
          <Route path="/rankings/visitors" element={<VisitorRankingPage />} />
          <Route path="/rankings/playgrounds" element={<PlaygroundRankingPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/users/:id" element={<AdminUserDetailPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
