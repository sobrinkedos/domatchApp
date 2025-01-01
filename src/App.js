import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import Competitions from './pages/Competitions';
import CompetitionDetails from './pages/CompetitionDetails';
import CompetitionStats from './pages/CompetitionStats';
import Players from './pages/Players';
import Statistics from './pages/Statistics';
import Login from './pages/Login';
import Register from './pages/Register';
import GameDetails from './pages/GameDetails';
import Dashboard from './pages/Dashboard';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  // Não mostrar drawer nas páginas de login e registro
  if (['/login', '/register'].includes(location.pathname)) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 relative pb-16 md:pb-0">
      {/* Overlay escuro quando o drawer está aberto */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleDrawer}
        ></div>
      )}

      {/* Drawer Mobile */}
      <div className={`fixed inset-y-0 left-0 transform ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'} w-64 bg-white shadow-lg z-50 transition-transform duration-300 ease-in-out md:hidden`}>
        <div className="h-16 flex items-center justify-between px-4 bg-gray-50">
          <div className="flex items-center">
            <img src="/logo.svg" alt="Domatch" className="h-8 w-8 mr-2" />
            <span className="text-xl font-bold text-gray-900">Domatch</span>
          </div>
          <button onClick={toggleDrawer} className="text-gray-600 hover:text-gray-900">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <div className="flex flex-col space-y-4">
            <Link to="/dashboard" onClick={toggleDrawer} className="text-gray-600 hover:text-gray-900">Dashboard</Link>
            <Link to="/competitions" onClick={toggleDrawer} className="text-gray-600 hover:text-gray-900">Competições</Link>
            <Link to="/players" onClick={toggleDrawer} className="text-gray-600 hover:text-gray-900">Jogadores</Link>
            <Link to="/statistics" onClick={toggleDrawer} className="text-gray-600 hover:text-gray-900">Estatísticas</Link>
            <button
              onClick={() => {
                logout();
                toggleDrawer();
              }}
              className="text-gray-600 hover:text-gray-900 text-left"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Barra de navegação */}
      <nav className="bg-white shadow-lg fixed w-full top-0 z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo e botão do menu */}
            <div className="flex items-center">
              <button onClick={toggleDrawer} className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Link to="/" className="flex items-center">
                <img src="/logo.svg" alt="Domatch" className="h-8 w-8 mr-2" />
                <span className="text-xl font-bold text-gray-900">Domatch</span>
              </Link>
            </div>

            {/* Menu de navegação */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 px-3 py-2">Dashboard</Link>
              <Link to="/competitions" className="text-gray-600 hover:text-gray-900 px-3 py-2">Competições</Link>
              <Link to="/players" className="text-gray-600 hover:text-gray-900 px-3 py-2">Jogadores</Link>
              <Link to="/statistics" className="text-gray-600 hover:text-gray-900 px-3 py-2">Estatísticas</Link>
            </div>

            {/* Perfil e logout */}
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-gray-600">{user?.name}</span>
              <button
                onClick={logout}
                className="text-gray-600 hover:text-gray-900 px-3 py-2"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="py-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/competitions"
              element={
                <PrivateRoute>
                  <Competitions />
                </PrivateRoute>
              }
            />
            <Route
              path="/competitions/:id"
              element={
                <PrivateRoute>
                  <CompetitionDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/competitions/:id/stats"
              element={
                <PrivateRoute>
                  <CompetitionStats />
                </PrivateRoute>
              }
            />
            <Route
              path="/games/:id"
              element={
                <PrivateRoute>
                  <GameDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/players"
              element={
                <PrivateRoute>
                  <Players />
                </PrivateRoute>
              }
            />
            <Route
              path="/statistics"
              element={
                <PrivateRoute>
                  <Statistics />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </main>

      {/* Bottom Navigation para Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
        <div className="flex justify-around items-center h-16">
          <Link 
            to="/dashboard"
            className={`flex flex-col items-center justify-center w-full h-full ${location.pathname === '/dashboard' ? 'text-blue-500' : 'text-gray-600'}`}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs">Dashboard</span>
          </Link>

          <Link 
            to="/competitions"
            className={`flex flex-col items-center justify-center w-full h-full ${location.pathname === '/competitions' ? 'text-blue-500' : 'text-gray-600'}`}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-xs mt-1">Competições</span>
          </Link>

          <Link 
            to="/statistics"
            className={`flex flex-col items-center justify-center w-full h-full ${location.pathname === '/statistics' ? 'text-blue-500' : 'text-gray-600'}`}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs mt-1">Estatísticas</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

export default App;
