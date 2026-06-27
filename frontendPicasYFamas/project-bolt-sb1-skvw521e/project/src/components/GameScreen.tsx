import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, LogOut, Trophy, Target, Zap, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { api, ApiError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { Attempt } from '../types';

interface GameScreenProps {
  onLogout: () => void;
}

export function GameScreen({ onLogout }: GameScreenProps) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [gameId, setGameId] = useState<string | null>(null);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const guessInputRef = useRef<HTMLInputElement>(null);

  const validateGuess = (value: string): boolean => {
    if (value.length !== 4) {
      setValidationError('Debe tener exactamente 4 digitos');
      return false;
    }
    if (!/^\d{4}$/.test(value)) {
      setValidationError('Solo se permiten digitos');
      return false;
    }
    const digits = value.split('');
    const uniqueDigits = new Set(digits);
    if (uniqueDigits.size !== 4) {
      setValidationError('Los digitos no pueden repetirse');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleGuessChange = (value: string) => {
    const sanitized = value.replace(/\D/g, '').slice(0, 4);
    setGuess(sanitized);
    if (sanitized.length === 4) {
      validateGuess(sanitized);
    } else {
      setValidationError('');
    }
  };

  const handleStartGame = async () => {
    setIsStarting(true);
    try {
      const response = await api.startGame();
      setGameId(response.gameId);
      setAttempts([]);
      setIsWinner(false);
      setGuess('');
      setValidationError('');
      addToast('success', 'Nuevo juego iniciado');
      guessInputRef.current?.focus();
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          addToast('error', 'Sesion expirada');
          onLogout();
        } else {
          addToast('error', error.message);
        }
      } else {
        addToast('error', 'Error al iniciar el juego');
      }
    } finally {
      setIsStarting(false);
    }
  };

  const handleGuess = useCallback(async () => {
    if (!gameId || !validateGuess(guess)) return;

    setIsLoading(true);
    try {
      const response = await api.guess(gameId, guess);
      const newAttempt: Attempt = {
        attemptNumber: response.attemptNumber,
        attemptedNumber: response.attemptedNumber,
        picas: response.picas,
        famas: response.famas,
        message: response.message,
      };
      setAttempts((prev) => [...prev, newAttempt]);

      if (response.isWinner || response.message.toLowerCase().includes('felicidades')) {
        setIsWinner(true);
        setShowConfetti(true);
        addToast('success', 'Felicidades! Has ganado!');
      }

      setGuess('');
      guessInputRef.current?.focus();
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          addToast('error', 'Sesion expirada');
          onLogout();
        } else {
          addToast('error', error.message);
        }
      } else {
        addToast('error', 'Error al procesar el intento');
      }
    } finally {
      setIsLoading(false);
    }
  }, [gameId, guess, addToast, onLogout]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && gameId && !isWinner && guess.length === 4 && !isLoading) {
        handleGuess();
      }
    };
    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [gameId, guess, isWinner, isLoading, handleGuess]);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  return (
    <div className="min-h-screen cyber-grid">
      {showConfetti && <Confetti />}

      <header className="glass-card border-b border-neon-violet/20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-neon-violet" />
            <h1 className="font-display text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-violet to-neon-cyan">
              PICAS Y FAMAS
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm hidden sm:block">
              {user?.email}
            </span>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-dark-700"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {!gameId ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
            <div className="glass-card rounded-2xl p-8 md:p-12 text-center max-w-lg">
              <Trophy className="w-20 h-20 text-neon-violet mx-auto mb-6 animate-bounce" />
              <h2 className="font-display text-3xl font-bold text-white mb-4">
                Listo para jugar?
              </h2>
              <p className="text-gray-400 mb-8">
                Adivina el numero secreto de 4 digitos. Cada intento te dara pistas.
              </p>
              <button
                onClick={handleStartGame}
                disabled={isStarting}
                className="btn-success text-lg px-10 py-4"
              >
                {isStarting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Iniciando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Play className="w-6 h-6" />
                    Nuevo Juego
                  </span>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            <div className="lg:col-span-2 order-2 lg:order-1">
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="border-b border-dark-500 px-6 py-4 flex items-center justify-between">
                  <h2 className="font-display text-lg text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-neon-cyan" />
                    Historial de Intentos
                  </h2>
                  <span className="text-neon-violet font-mono text-sm">
                    {attempts.length} intentos
                  </span>
                </div>

                {attempts.length === 0 ? (
                  <div className="p-12 text-center">
                    <Zap className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500">Ingresa tu primer intento</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-dark-700 text-left">
                          <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            #
                          </th>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Numero
                          </th>
                          <th className="px-4 py-3 text-xs font-semibold text-neon-green uppercase tracking-wider text-center">
                            Famas
                          </th>
                          <th className="px-4 py-3 text-xs font-semibold text-neon-violet uppercase tracking-wider text-center">
                            Picas
                          </th>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Mensaje
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dark-600">
                        {attempts.map((attempt, index) => (
                          <tr
                            key={attempt.attemptNumber}
                            className="hover:bg-dark-700/50 transition-colors animate-slide-in"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                              {attempt.attemptNumber}
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-mono text-lg text-white tracking-widest">
                                {attempt.attemptedNumber.split('').map((digit, i) => (
                                  <span
                                    key={i}
                                    className={`inline-block w-8 h-10 leading-10 text-center mx-0.5 rounded bg-dark-600 ${
                                      isWinner && index === attempts.length - 1
                                        ? 'bg-neon-green/20 neon-text-green'
                                        : ''
                                    }`}
                                  >
                                    {digit}
                                  </span>
                                ))}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-neon-green/20 text-neon-green font-bold">
                                {attempt.famas}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-neon-violet/20 text-neon-violet font-bold">
                                {attempt.picas}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span
                                className={`${
                                  attempt.message.toLowerCase().includes('felicidades')
                                    ? 'text-neon-green font-semibold neon-text-green'
                                    : 'text-gray-400'
                                }`}
                              >
                                {attempt.message}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1 order-1 lg:order-2">
              <div className="glass-card rounded-2xl p-6 sticky top-6">
                {isWinner ? (
                  <div className="text-center py-8 animate-bounce-in">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-green to-emerald-600 mx-auto mb-6 flex items-center justify-center">
                      <Trophy className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-neon-green mb-2 neon-text-green">
                      VICTORIA!
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Ganaste en {attempts.length} intentos
                    </p>
                    <button
                      onClick={handleStartGame}
                      disabled={isStarting}
                      className="btn-success w-full"
                    >
                      <Play className="w-5 h-5 mr-2 inline" />
                      Nuevo Juego
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="font-display text-lg text-white mb-6 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-neon-violet" />
                      Tu Intento
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">
                          Numero de 4 digitos (sin repetir)
                        </label>
                        <input
                          ref={guessInputRef}
                          type="text"
                          inputMode="numeric"
                          value={guess}
                          onChange={(e) => handleGuessChange(e.target.value)}
                          placeholder="0000"
                          className="input-cyber w-full text-center text-2xl tracking-[1em] font-mono"
                          maxLength={4}
                        />
                        {validationError && (
                          <p className="text-red-500 text-xs mt-2">{validationError}</p>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={handleGuess}
                          disabled={isLoading || guess.length !== 4 || !!validationError}
                          className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Procesando
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <CheckCircle className="w-5 h-5" />
                              Adivinar
                            </span>
                          )}
                        </button>
                      </div>

                      <div className="pt-4 border-t border-dark-500">
                        <button
                          onClick={handleStartGame}
                          disabled={isStarting}
                          className="btn-secondary w-full"
                        >
                          <XCircle className="w-5 h-5 mr-2 inline" />
                          Reiniciar Juego
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-dark-500">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 rounded-lg bg-neon-green/10 border border-neon-green/30">
                          <div className="text-2xl font-bold text-neon-green">
                            {attempts.length > 0 ? attempts[attempts.length - 1].famas : 0}
                          </div>
                          <div className="text-xs text-gray-400">Famas</div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-neon-violet/10 border border-neon-violet/30">
                          <div className="text-2xl font-bold text-neon-violet">
                            {attempts.length > 0 ? attempts[attempts.length - 1].picas : 0}
                          </div>
                          <div className="text-xs text-gray-400">Picas</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Confetti() {
  const colors = ['#a855f7', '#22d3ee', '#22c55e', '#ec4899', '#f59e0b'];
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 0.5,
    size: Math.random() * 10 + 5,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti"
          style={{
            left: `${piece.left}%`,
            top: '-20px',
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
            animationDelay: `${piece.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
