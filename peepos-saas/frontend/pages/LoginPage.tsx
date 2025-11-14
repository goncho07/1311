import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import Button from '@/ui/Button';
import Input from '@/ui/Input';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const { loginLogoUrl, loginImageUrl } = useSettingsStore();

  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const success = await login(dni, password);
    if (success) {
      navigate('/');
    } else {
      setError('Credenciales incorrectas. Intente de nuevo.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[var(--color-background)]">
      <div className="w-full lg:w-3/5 h-screen relative hidden lg:block">
        <img src={loginImageUrl} alt="School background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50 flex flex-col justify-end p-8 md:p-12">
        </div>
      </div>
      <div className="w-full lg:w-2/5 h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <img src={loginLogoUrl} alt="Logo" className="w-full max-w-56 h-auto mx-auto mb-6" />
            <h1 className="text-3xl font-extrabold text-[var(--color-text-primary)]">Bienvenido</h1>
            <p className="text-[var(--color-text-secondary)] text-lg mt-2">Ingrese sus credenciales para acceder.</p>
          </div>

          <div className="bg-[var(--color-surface)] p-7 rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] border border-[var(--color-border)]">
            <form onSubmit={handleLogin} className="space-y-5">
              <Input
                label="DNI o Usuario"
                id="dni"
                type="text"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                placeholder="Usuario: director / docente"
                aria-label="DNI o Usuario"
                required
                disabled={isLoading}
              />
              <Input
                label="Contraseña"
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña: password"
                aria-label="Contraseña"
                required
                disabled={isLoading}
              />

              {error && <p className="text-sm text-center text-[var(--color-danger)]">{error}</p>}

              <Button 
                type="submit" 
                variant="filled" 
                className="w-full !text-lg" 
                icon={isLoading ? () => <Loader2 className="animate-spin" /> : LogIn}
                aria-label="Ingresar al sistema"
                disabled={isLoading}
               >
                <span>{isLoading ? 'Ingresando...' : 'Ingresar'}</span>
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
