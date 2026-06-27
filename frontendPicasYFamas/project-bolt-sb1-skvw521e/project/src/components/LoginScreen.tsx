import { useState, type FormEvent } from 'react';
import { ArrowLeft, Mail, Lock, LogIn } from 'lucide-react';
import { useAuth, ApiError } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface LoginScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function LoginScreen({ onBack, onSuccess }: LoginScreenProps) {
  const { login } = useAuth();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) newErrors.email = 'El email es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalido';
    }

    if (!formData.password) newErrors.password = 'La contrasena es requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await login(formData.email.trim().toLowerCase(), formData.password);
      addToast('success', 'Sesion iniciada correctamente');
      onSuccess();
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          addToast('error', 'Credenciales incorrectas');
        } else {
          addToast('error', error.message);
        }
      } else {
        addToast('error', 'Error al iniciar sesion. Intenta de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 cyber-grid">
      <div className="max-w-md w-full animate-scale-in">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-neon-cyan transition-colors mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Volver</span>
        </button>

        <div className="glass-card rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-neon-cyan to-blue-600 mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display text-3xl font-bold text-white mb-2">Bienvenido</h1>
            <p className="text-gray-400 text-sm">Inicia sesion para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`input-cyber w-full pl-10 ${
                    errors.email ? 'border-red-500' : ''
                  }`}
                  placeholder="correo@ejemplo.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Contrasena</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className={`input-cyber w-full pl-10 ${
                    errors.password ? 'border-red-500' : ''
                  }`}
                  placeholder="*******"
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-secondary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 2.211.896 4.208 2.352 5.657l2.03-2.03A4.94 4.94 0 014 12h2a6.98 6.98 0 01-.352 2.357l1.414-1.414"
                    />
                  </svg>
                  Iniciando...
                </span>
              ) : (
                'Iniciar Sesion'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
