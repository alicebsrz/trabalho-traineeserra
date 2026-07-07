import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { Home } from './pages/Home';
import { Results } from './pages/Results';
import { Login } from './pages/Login'; 
import { Profile } from './pages/Profile';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';


function AuthGuard({ children }: { children: ReactNode }) {
  const token = localStorage.getItem('@BibliotecaVirtual:token');
  
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        {}
        <Route path="/login" element={<Login />} />

        {}
        <Route 
          path="/" 
          element={<AuthGuard><Home /></AuthGuard>} 
        />
        <Route 
          path="/results" 
          element={<AuthGuard><Results /></AuthGuard>} 
        />
        <Route 
          path="/profile" 
          element={<AuthGuard><Profile /></AuthGuard>} 
        />

        {}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}