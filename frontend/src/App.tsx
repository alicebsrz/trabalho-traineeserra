import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Results } from './pages/Results';
import { Profile } from './pages/Profile';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-50 selection:bg-indigo-500/30">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/results" element={<Results />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}