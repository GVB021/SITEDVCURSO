import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mic, ArrowLeft, Mail, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { firebaseService } from '../services/firebaseService';

export function Login({ onLogin, onBack }: { onLogin: (user: any) => void, onBack: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const result = await firebaseService.signIn(email, password);
      if (result.user) {
        onLogin(result.user);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Image/Branding */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-background z-10" />
        <img 
          src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop" 
          alt="Studio" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 text-center px-12">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Mic className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-black text-white mb-6 font-display tracking-tight">Escola Dublagem</h1>
          <p className="text-xl text-blue-100/80 font-light">Onde a sua voz ganha vida e o seu talento encontra o mercado.</p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 relative">
        <button 
          onClick={onBack}
          className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao site
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full mx-auto"
        >
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-2 font-display">Portal do Aluno</h2>
            <p className="text-muted-foreground">Acesse sua conta para continuar seus estudos.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">Senha</label>
                <a href="#" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">Esqueceu a senha?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-6 text-lg rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all whimsy-hover"
            >
              {isLoading ? 'Entrando...' : 'Entrar na Plataforma'}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
