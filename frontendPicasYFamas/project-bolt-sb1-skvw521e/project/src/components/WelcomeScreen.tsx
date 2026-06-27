import { User, LogIn, Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  onRegister: () => void;
  onLogin: () => void;
}

export function WelcomeScreen({ onRegister, onLogin }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 cyber-grid">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="animate-fade-in">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Sparkles className="w-16 h-16 text-neon-violet animate-pulse" />
              <div className="absolute inset-0 blur-xl bg-neon-violet/30 rounded-full" />
            </div>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-violet via-neon-cyan to-neon-green mb-4">
            PICAS Y FAMAS
          </h1>
          <p className="text-gray-400 text-lg font-mono">
            Descifra el codigo secreto
          </p>
        </div>

        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <button
            onClick={onRegister}
            className="btn-primary w-full flex items-center justify-center gap-3 group"
          >
            <User className="w-5 h-5 group-hover:animate-bounce" />
            <span>Registrarse</span>
          </button>

          <button
            onClick={onLogin}
            className="btn-secondary w-full flex items-center justify-center gap-3 group"
          >
            <LogIn className="w-5 h-5 group-hover:animate-bounce" />
            <span>Iniciar Sesion</span>
          </button>
        </div>

        <div className="pt-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="glass-card rounded-xl p-6 text-left">
            <h3 className="font-display text-neon-cyan text-lg mb-3">Como jugar</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-neon-green font-bold">?</span>
                <span>El sistema genera un numero de 4 digitos sin repetir</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neon-violet font-bold">P</span>
                <span><strong className="text-neon-violet">Picas:</strong> Digito correcto en posicion incorrecta</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neon-green font-bold">F</span>
                <span><strong className="text-neon-green">Famas:</strong> Digito correcto en posicion correcta</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neon-cyan font-bold">*</span>
                <span>Gana quien logre 4 famas primero</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
