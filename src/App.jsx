import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from "./Home";
import MarketplaceView from "./components/MarketplaceView";
import Lobby from "./Lobby";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/market" element={<MarketplaceView />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
