import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { loadStripe } from '@stripe/stripe-js';
import { 
  LayoutDashboard, FileText, CreditCard, 
  HelpCircle, LogOut, Bell, Search, 
  Clock, Award, ChevronRight, Mic,
  FileSignature, Calendar, AlertCircle,
  Download, CheckCircle, XCircle, UploadCloud,
  MessageSquare, ExternalLink, ShieldCheck,
  PartyPopper, Sparkles, PlayCircle, Trophy,
  Star, BookOpen, Video
} from 'lucide-react';
import { Button } from './ui/button';

// TODO: Configure Stripe Public Key when ready
// const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

export function StudentDashboard({ onLogout, onHome, data, studentData }: any) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCelebrating, setIsCelebrating] = useState(false);

  const profile = studentData?.profile;
  const enrollments = studentData?.enrollments || [];
  const activity = studentData?.activity || [];

  const menuItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard },
    { id: 'cursos', label: 'Meus Cursos', icon: BookOpen },
    { id: 'conquistas', label: 'Conquistas', icon: Trophy },
    { id: 'financeiro', label: 'Financeiro', icon: CreditCard },
    { id: 'suporte', label: 'Suporte', icon: HelpCircle },
  ];

  const handleStripePayment = async (invoiceId: string) => {
    setIsCelebrating(true);
    setTimeout(() => setIsCelebrating(false), 3000);
    console.log('Iniciando pagamento via Stripe para a fatura:', invoiceId);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView setActiveTab={setActiveTab} data={data} studentData={studentData} />;
      case 'cursos':
        return <CursosView data={data} studentData={studentData} />;
      case 'conquistas':
        return <ConquistasView />;
      case 'financeiro':
        return <FinanceiroView onPay={handleStripePayment} />;
      case 'suporte':
        return <SuporteView />;
      default:
        return <DashboardView setActiveTab={setActiveTab} data={data} studentData={studentData} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex text-foreground font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0a0a0a] border-r border-white/5 flex flex-col hidden md:flex relative z-20 shadow-2xl">
        <div className="p-8 flex items-center gap-3 cursor-pointer group" onClick={onHome}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-black text-xl tracking-tighter font-display text-white block leading-none">Escola</span>
            <span className="font-bold text-sm tracking-widest text-cyan-400 uppercase">Dublagem</span>
          </div>
        </div>

        <div className="px-6 mb-8">
          <div className="glass-panel p-4 rounded-2xl border-white/5 flex items-center gap-4">
            <img src={profile?.avatar_url || "https://i.pravatar.cc/150?u=1"} alt="User" className="w-12 h-12 rounded-full border-2 border-cyan-500/30" />
            <div>
              <p className="text-sm font-bold text-white">{profile?.full_name || 'Aluno'}</p>
              <p className="text-xs text-cyan-400">{profile?.role === 'admin' ? 'Administrador' : 'Aluno Pro'}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium text-left relative group ${
                  isActive ? 'text-cyan-400' : 'text-muted-foreground hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeStudentTab" 
                    className="absolute inset-0 bg-cyan-500/10 border border-cyan-500/20 rounded-xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-cyan-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                <span className="relative z-10">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-6 border-t border-white/5 bg-black/20">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" /> Sair da conta
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[#0a0a0a]">
        {/* Ambient Background */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none"></div>
        
        {/* Celebration Overlay */}
        <AnimatePresence>
          {isCelebrating && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none"
            >
              <motion.div 
                initial={{ scale: 0.5, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="bg-gradient-to-br from-green-400 to-emerald-600 p-8 rounded-3xl text-center shadow-[0_0_100px_rgba(16,185,129,0.4)]"
              >
                <PartyPopper className="w-20 h-20 text-white mx-auto mb-4" />
                <h2 className="text-3xl font-black text-white font-display mb-2">Pagamento Confirmado!</h2>
                <p className="text-green-50 font-medium">Sua matrícula está ativa. Bons estudos!</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Header */}
        <header className="md:hidden h-20 border-b border-white/5 bg-black/20 backdrop-blur-md flex items-center justify-between px-6 relative z-10">
          <div className="flex items-center gap-3 cursor-pointer" onClick={onHome}>
            <Mic className="w-6 h-6 text-cyan-400" />
            <span className="font-black text-lg font-display text-white">Escola Dublagem</span>
          </div>
          <button onClick={onLogout} className="p-2 text-muted-foreground hover:text-white">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        {/* Topbar Desktop */}
        <header className="hidden md:flex h-20 border-b border-white/5 bg-black/20 backdrop-blur-md items-center justify-between px-10 relative z-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Portal do Aluno</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white capitalize">{activeTab}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Buscar aulas..." 
                className="bg-black/50 border border-white/10 rounded-full pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors w-64"
              />
            </div>
            <button className="relative p-2 text-muted-foreground hover:text-white transition-colors rounded-full hover:bg-white/5">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 relative z-10">
          <div className="max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

function DashboardView({ setActiveTab, data, studentData }: any) {
  const profile = studentData?.profile;
  const enrollments = studentData?.enrollments || [];
  
  // Calculate overall progress
  const totalProgress = enrollments.length > 0 
    ? Math.round(enrollments.reduce((acc: number, curr: any) => acc + (curr.progress || 0), 0) / enrollments.length)
    : 0;

  const mainEnrollment = enrollments[0];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="glass-panel p-8 md:p-10 rounded-[2rem] border-white/5 bg-gradient-to-br from-blue-900/20 to-cyan-900/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-white font-display mb-2">Bem-vindo de volta, {profile?.full_name?.split(' ')[0] || 'Aluno'}!</h2>
            <p className="text-blue-200/70 text-lg">Você está indo muito bem. Continue assim!</p>
          </div>
          
          <div className="flex items-center gap-6 bg-black/40 p-6 rounded-2xl border border-white/5 backdrop-blur-md">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#22d3ee" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * totalProgress / 100)} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-white">{totalProgress}%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-1">Progresso Geral</p>
              <p className="text-white font-bold">{mainEnrollment ? mainEnrollment.module_slug : 'Nenhuma matrícula'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Continue Learning */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white font-display">Continue de onde parou</h3>
              <button onClick={() => setActiveTab('cursos')} className="text-sm text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1">
                Ver todos <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="glass-panel p-4 rounded-3xl border-white/5 group cursor-pointer hover:border-cyan-500/30 transition-colors">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-full sm:w-64 h-40 rounded-2xl bg-gray-800 relative overflow-hidden shrink-0">
                  <img src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=800&auto=format&fit=crop" alt="Thumbnail" className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-cyan-500/90 text-black flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.5)] group-hover:scale-110 transition-transform">
                      <PlayCircle className="w-6 h-6 ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-white">
                    12:45
                  </div>
                </div>
                <div className="flex-1 py-2 flex flex-col justify-center">
                  <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Módulo Iniciante • Aula 04</div>
                  <h4 className="text-xl font-bold text-white mb-2 line-clamp-2">Leitura Dinâmica de Roteiros e Marcações</h4>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">Aprenda a fazer as marcações corretas no seu roteiro antes de entrar no estúdio para gravar.</p>
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400 rounded-full w-[60%]"></div>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">60% concluído</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-white font-display mb-6">Próximas Aulas ao Vivo</h3>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="glass-panel p-5 rounded-2xl border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-blue-500/10 border border-blue-500/20 flex flex-col items-center justify-center shrink-0">
                      <span className="text-xs text-blue-400 font-bold uppercase">OUT</span>
                      <span className="text-lg font-black text-white leading-none">15</span>
                    </div>
                    <div>
                      <h5 className="font-bold text-white text-lg">Masterclass: Interpretação para Games</h5>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3" /> 19:00 - 21:00 • Prof. Ettore Zuim
                      </p>
                    </div>
                  </div>
                  <Button className="bg-white/10 hover:bg-white/20 text-white rounded-xl shrink-0">
                    Definir Lembrete
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Stats & Badges */}
        <div className="space-y-8">
          <div className="glass-panel p-6 rounded-3xl border-white/5">
            <h3 className="text-lg font-bold text-white font-display mb-6 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" /> Suas Conquistas
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-14 h-14 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                  <Star className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-gray-300">Primeiro Play</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-14 h-14 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                  <Mic className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-gray-300">Voz Aquecida</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2 opacity-40 grayscale">
                <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white">
                  <Award className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-gray-500">Mestre Lip-Sync</span>
              </div>
            </div>
            <button onClick={() => setActiveTab('conquistas')} className="w-full mt-6 py-2 text-sm text-cyan-400 font-medium hover:bg-cyan-500/10 rounded-lg transition-colors">
              Ver todas as conquistas
            </button>
          </div>

          <div className="glass-panel p-6 rounded-3xl border-white/5">
            <h3 className="text-lg font-bold text-white font-display mb-6">Resumo de Estudo</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <Video className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-gray-300">Aulas Assistidas</span>
                </div>
                <span className="font-bold text-white">24</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-gray-300">Horas de Estudo</span>
                </div>
                <span className="font-bold text-white">18h</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-gray-300">Exercícios Entregues</span>
                </div>
                <span className="font-bold text-white">5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CursosView({ data, studentData }: any) {
  const enrollments = studentData?.enrollments || [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white mb-2 font-display">Meus Cursos</h2>
        <p className="text-muted-foreground">Acompanhe seu progresso em cada módulo da formação.</p>
      </div>

      <div className="space-y-6">
        {data.modules?.map((mod: any, i: number) => {
          const enrollment = enrollments.find((e: any) => e.module_slug === mod.slug);
          const progress = enrollment ? enrollment.progress : 0;
          const isEnrolled = !!enrollment;

          return (
            <div key={i} className="glass-panel p-6 md:p-8 rounded-3xl border-white/5 flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/3 flex flex-col justify-center">
                <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Módulo {mod.num}</div>
                <h3 className="text-2xl font-bold text-white font-display mb-4">{mod.title}</h3>
                <p className="text-sm text-muted-foreground mb-6">{mod.desc}</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progresso</span>
                    <span className="text-white font-bold">{progress}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${progress === 100 ? 'bg-green-400' : progress > 0 ? 'bg-cyan-400' : 'bg-transparent'}`} style={{ width: `${progress}%` }}></div>
                  </div>
                </div>

                <Button className={`w-full rounded-xl py-6 ${!isEnrolled ? 'bg-white/5 text-gray-500 cursor-not-allowed' : progress === 100 ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-cyan-500 text-black hover:bg-cyan-400 whimsy-hover'}`}>
                  {!isEnrolled ? 'Bloqueado' : progress === 100 ? 'Revisar Módulo' : 'Continuar Módulo'}
                </Button>
              </div>

              <div className="w-full md:w-2/3 bg-black/40 rounded-2xl p-6 border border-white/5">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Aulas do Módulo</h4>
                <div className="space-y-3">
                  {mod.details.lessons.map((lesson: string, j: number) => {
                    const isCompleted = isEnrolled && (progress === 100 || j < Math.floor(progress / 20));
                    const isCurrent = isEnrolled && progress < 100 && j === Math.floor(progress / 20);
                    const isLocked = !isEnrolled || (!isCompleted && !isCurrent);

                    return (
                      <div key={j} className={`flex items-center justify-between p-4 rounded-xl border ${isCurrent ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-white/5 border-transparent'} transition-colors`}>
                        <div className="flex items-center gap-4">
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                          ) : isCurrent ? (
                            <PlayCircle className="w-5 h-5 text-cyan-400 shrink-0" />
                          ) : (
                            <Lock className="w-5 h-5 text-gray-600 shrink-0" />
                          )}
                          <span className={`font-medium ${isCompleted ? 'text-gray-300' : isCurrent ? 'text-white' : 'text-gray-500'}`}>
                            {j + 1}. {lesson}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground hidden sm:block">15:00</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ConquistasView() {
  const badges = [
    { id: 1, title: 'Primeiro Play', desc: 'Assistiu a primeira aula', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', unlocked: true },
    { id: 2, title: 'Voz Aquecida', desc: 'Completou exercícios de respiração', icon: Mic, color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/30', unlocked: true },
    { id: 3, title: 'Módulo 1 Concluído', desc: 'Finalizou o módulo iniciante', icon: Award, color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30', unlocked: true },
    { id: 4, title: 'Mestre Lip-Sync', desc: 'Acertou 90% no exercício de sync', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30', unlocked: false },
    { id: 5, title: 'Ator de Voz', desc: 'Gravou o primeiro personagem', icon: Video, color: 'text-pink-400', bg: 'bg-pink-500/20', border: 'border-pink-500/30', unlocked: false },
    { id: 6, title: 'Formação Completa', desc: 'Concluiu todo o curso', icon: Trophy, color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30', unlocked: false },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white mb-2 font-display">Conquistas</h2>
        <p className="text-muted-foreground">Desbloqueie medalhas ao progredir no curso e completar desafios.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {badges.map((badge) => {
          const Icon = badge.icon;
          return (
            <div key={badge.id} className={`glass-panel p-6 rounded-3xl border-white/5 flex flex-col items-center text-center transition-all ${badge.unlocked ? 'hover:scale-105' : 'opacity-50 grayscale'}`}>
              <div className={`w-20 h-20 rounded-full ${badge.bg} border ${badge.border} flex items-center justify-center ${badge.color} mb-4 shadow-lg`}>
                <Icon className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-bold text-white mb-1">{badge.title}</h4>
              <p className="text-sm text-muted-foreground">{badge.desc}</p>
              {!badge.unlocked && (
                <div className="mt-4 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-gray-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Bloqueado
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FinanceiroView({ onPay }: { onPay: (id: string) => void }) {
  const invoices = [
    { id: 'FAT-001', desc: 'Mensalidade - Módulo Iniciante', date: '05/10/2026', amount: 'R$ 450,00', status: 'paid' },
    { id: 'FAT-002', desc: 'Mensalidade - Módulo Iniciante', date: '05/11/2026', amount: 'R$ 450,00', status: 'pending' },
    { id: 'FAT-003', desc: 'Mensalidade - Módulo Iniciante', date: '05/12/2026', amount: 'R$ 450,00', status: 'future' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white mb-2 font-display">Financeiro</h2>
        <p className="text-muted-foreground">Gerencie suas mensalidades e histórico de pagamentos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl border-white/5 flex flex-col justify-center">
          <p className="text-sm text-muted-foreground mb-1">Próximo Vencimento</p>
          <h3 className="text-3xl font-bold text-white mb-4">R$ 450,00</h3>
          <p className="text-sm text-cyan-400 font-medium mb-6">Vence em 05/11/2026</p>
          <Button onClick={() => onPay('FAT-002')} className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl whimsy-hover">
            Pagar Agora
          </Button>
        </div>
        <div className="md:col-span-2 glass-panel p-6 rounded-3xl border-white/5">
          <h4 className="text-lg font-bold text-white mb-6">Histórico de Faturas</h4>
          <div className="space-y-4">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    inv.status === 'paid' ? 'bg-green-500/20 text-green-400' : 
                    inv.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {inv.status === 'paid' ? <CheckCircle className="w-5 h-5" /> : 
                     inv.status === 'pending' ? <AlertCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-bold text-white">{inv.desc}</p>
                    <p className="text-sm text-muted-foreground">Vencimento: {inv.date}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  <span className="font-bold text-white">{inv.amount}</span>
                  {inv.status === 'paid' ? (
                    <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold uppercase">Pago</span>
                  ) : inv.status === 'pending' ? (
                    <Button onClick={() => onPay(inv.id)} size="sm" className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg">Pagar</Button>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-gray-500/10 text-gray-400 text-xs font-bold uppercase">A Vencer</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SuporteView() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white mb-2 font-display">Suporte ao Aluno</h2>
        <p className="text-muted-foreground">Precisa de ajuda? Nossa equipe está pronta para te atender.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel p-8 rounded-3xl border-white/5">
          <h3 className="text-xl font-bold text-white mb-6">Abrir um Chamado</h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Assunto</label>
              <select className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors appearance-none">
                <option>Dúvida sobre aulas</option>
                <option>Problema técnico na plataforma</option>
                <option>Questões financeiras</option>
                <option>Outros</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Mensagem</label>
              <textarea 
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white h-32 focus:outline-none focus:border-cyan-400 transition-colors resize-none"
                placeholder="Descreva seu problema ou dúvida em detalhes..."
              ></textarea>
            </div>
            <Button className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl py-6 whimsy-hover">
              Enviar Mensagem
            </Button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border-white/5 flex items-center gap-4 group cursor-pointer hover:border-cyan-500/30 transition-colors">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-lg">Comunidade no Discord</h4>
              <p className="text-sm text-muted-foreground">Tire dúvidas com outros alunos e professores.</p>
            </div>
            <ExternalLink className="w-5 h-5 text-gray-500 ml-auto group-hover:text-cyan-400 transition-colors" />
          </div>
          
          <div className="glass-panel p-6 rounded-3xl border-white/5 flex items-center gap-4 group cursor-pointer hover:border-cyan-500/30 transition-colors">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-lg">Central de Ajuda (FAQ)</h4>
              <p className="text-sm text-muted-foreground">Respostas para as dúvidas mais comuns.</p>
            </div>
            <ExternalLink className="w-5 h-5 text-gray-500 ml-auto group-hover:text-cyan-400 transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
}
