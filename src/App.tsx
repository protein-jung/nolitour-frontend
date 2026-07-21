import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MapPage } from "./pages/MapPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MapPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
