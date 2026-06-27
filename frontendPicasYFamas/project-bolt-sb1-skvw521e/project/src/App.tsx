import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { WelcomeScreen } from './components/WelcomeScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { LoginScreen } from './components/LoginScreen';
import { GameScreen } from './components/GameScreen';
import { ToastContainer } from './components/ToastContainer';

type Screen = 'welcome' | 'register' | 'login' | 'game';

function AppContent() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const [screen, setScreen] = useState<Screen>('welcome');

  useEffect(() => {
    if (!isLoading) {
      setScreen(isAuthenticated ? 'game' : 'welcome');
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-dark-600 border-t-neon-violet rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-dark-600 border-t-neon-cyan rounded-full animate-spin" style={{ animationDirection: 'reverse' }} />
            </div>
          </div>
          <p className="text-gray-400 mt-4 font-mono text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    setScreen('welcome');
  };

  switch (screen) {
    case 'welcome':
      return (
        <WelcomeScreen
          onRegister={() => setScreen('register')}
          onLogin={() => setScreen('login')}
        />
      );
    case 'register':
      return (
        <RegisterScreen
          onBack={() => setScreen('welcome')}
          onSuccess={() => setScreen('game')}
        />
      );
    case 'login':
      return (
        <LoginScreen
          onBack={() => setScreen('welcome')}
          onSuccess={() => setScreen('game')}
        />
      );
    case 'game':
      return <GameScreen onLogout={handleLogout} />;
    default:
      return null;
  }
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
        <ToastContainer />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
