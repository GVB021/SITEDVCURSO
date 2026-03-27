import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { 
  Play, ChevronRight, Star, Users, Mic, 
  Headphones, Video, Award, ArrowRight,
  CheckCircle2, ShieldCheck, Zap, MessageSquare,
  ChevronDown
} from 'lucide-react';
import { Button } from './components/ui/button';
import { initialSiteData } from './data';
import { AdminPanel } from './components/AdminPanel';
import { Login } from './components/Login';
import { StudentDashboard } from './components/StudentDashboard';
import { Enrollment } from './components/Enrollment';
import { firebaseService } from './services/firebaseService';

const TeacherCard = ({ teacher, index }: any) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="perspective-1000 cursor-pointer h-[450px] max-w-[350px] mx-auto w-full"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        className="relative w-full h-full preserve-3d"
      >
        {/* Front */}
        <div 
          className="absolute inset-0 backface-hidden rounded-[2rem] overflow-hidden"
        >
          <img 
            src={teacher.photo} 
            alt={teacher.name} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full p-8">
            <p className="text-blue-400 font-bold text-sm uppercase tracking-wider mb-2 neon-text-blue">{teacher.role}</p>
            <h3 className="text-3xl font-black text-white font-display mb-4 neon-text-white">{teacher.name}</h3>
            <div className="flex flex-wrap gap-2">
              {teacher.specialties.map((spec: string, j: number) => (
                <span key={j} className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-white border border-white/10">
                  {spec}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Back */}
        <div 
          className="absolute inset-0 backface-hidden rounded-[2rem] overflow-hidden glass-panel p-8 flex flex-col justify-center items-center text-center"
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="w-20 h-20 rounded-full bg-blue-600/20 flex items-center justify-center mb-6 neon-glow-blue">
            <MessageSquare className="w-10 h-10 text-blue-400" />
          </div>
          <h3 className="text-2xl font-black text-white font-display mb-4 neon-text-white">{teacher.name}</h3>
          <p className="text-gray-300 leading-relaxed italic">"{teacher.bio}"</p>
          <div className="mt-8 pt-8 border-t border-white/10 w-full">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest neon-text-blue">Clique para voltar</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

function App() {
  const [siteData, setSiteData] = useState(initialSiteData);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isStudentDashboardOpen, setIsStudentDashboardOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false);
  const [selectedModuleForEnrollment, setSelectedModuleForEnrollment] = useState<string | undefined>(undefined);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [data, user] = await Promise.all([
          firebaseService.getSiteData(),
          firebaseService.getCurrentUser()
        ]);

        if (data) {
          setSiteData(prev => ({
            ...prev,
            ...data,
            settings: data.settings ? { ...prev.settings, ...data.settings } : prev.settings
          }));
        }

        if (user) {
          setCurrentUser(user);
          await loadStudentData(user.uid);
        }
      } catch (error) {
        console.error('Failed to load data from Firebase:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const loadStudentData = async (userId: string) => {
    try {
      const [profile, enrollments, activity] = await Promise.all([
        firebaseService.getStudentProfile(userId),
        firebaseService.getStudentEnrollments(userId),
        firebaseService.getStudentActivity(userId)
      ]);

      setStudentData({
        profile,
        enrollments,
        activity
      });
    } catch (error) {
      console.error('Failed to load student data:', error);
    }
  };

  const handleSaveAdmin = (newData: any) => {
    setSiteData(newData);
  };

  const handleLoginSuccess = async (user: any) => {
    setCurrentUser(user);
    setIsLoginOpen(false);
    setIsLoading(true);
    await loadStudentData(user.uid);
    setIsLoading(false);
    setIsStudentDashboardOpen(true);
  };

  const handleLogout = async () => {
    await firebaseService.signOut();
    setCurrentUser(null);
    setStudentData(null);
    setIsStudentDashboardOpen(false);
  };

  const handleEnroll = (moduleTitle?: string) => {
    setSelectedModuleForEnrollment(moduleTitle);
    setIsEnrollmentOpen(true);
  };

  const handleNewEnrollment = async (enrollment: any) => {
    try {
      const newEnrollment = await firebaseService.createEnrollment({
        name: enrollment.name,
        email: enrollment.email,
        phone: enrollment.phone,
        module: enrollment.module,
        status: 'Pendente'
      });
      
      setSiteData(prev => ({
        ...prev,
        enrollments: [newEnrollment, ...(prev.enrollments || [])]
      }));
    } catch (error) {
      console.error('Failed to create enrollment in Firebase:', error);
      // Fallback to local state if Firebase fails
      const fallbackEnrollment = {
        ...enrollment,
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        status: 'Pendente'
      };
      setSiteData(prev => ({
        ...prev,
        enrollments: [fallbackEnrollment, ...(prev.enrollments || [])]
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-blue-400 font-bold animate-pulse uppercase tracking-widest text-xs">Carregando StudioVoice...</p>
        </div>
      </div>
    );
  }

  if (isAdminOpen) {
    return <AdminPanel data={siteData} onSave={handleSaveAdmin} onClose={() => setIsAdminOpen(false)} />;
  }

  if (isLoginOpen) {
    return <Login onLogin={handleLoginSuccess} onBack={() => setIsLoginOpen(false)} />;
  }

  if (isStudentDashboardOpen) {
    return (
      <StudentDashboard 
        onLogout={handleLogout} 
        onHome={() => setIsStudentDashboardOpen(false)} 
        data={siteData} 
        studentData={studentData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-foreground font-sans selection:bg-blue-600/30">
      {/* Background Grid */}
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none opacity-[0.03]" />
      
      {/* Ambient Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/30 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl transition-all duration-300">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3 group cursor-pointer shrink-0">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-blue-700 to-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(29,78,216,0.3)] group-hover:scale-105 transition-transform">
              <Mic className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-lg md:text-xl tracking-tighter font-display text-white block leading-none neon-text-white">{(siteData.settings?.siteName || 'StudioVoice Pro').split(' ')[0]}</span>
              <span className="font-bold text-xs md:text-sm tracking-widest text-blue-400 uppercase neon-text-blue">{(siteData.settings?.siteName || 'StudioVoice Pro').split(' ')[1] || 'Pro'}</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#metodologia" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Metodologia</a>
            <a href="#professores" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Professores</a>
            <a href="#depoimentos" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Depoimentos</a>
            <a href="#faq" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setIsLoginOpen(true)}
              className="text-xs md:text-sm font-bold text-white hover:text-blue-400 transition-colors hidden xs:block hover:neon-text-blue"
            >
              Portal do Aluno
            </button>
            <Button onClick={() => handleEnroll()} className="bg-white text-black hover:bg-gray-200 rounded-full px-4 md:px-6 py-2 h-auto text-xs md:text-sm font-bold whimsy-hover shadow-[0_0_20px_rgba(255,255,255,0.1)] neon-glow-white">
              Matricule-se
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
          <div className="container mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-[10px] md:text-xs font-bold tracking-wider text-blue-400 uppercase neon-text-blue">Vagas Abertas - Turma 2026</span>
                </div>
                <h1 className="text-4xl md:text-7xl font-black text-white leading-[1.1] mb-6 font-display tracking-tight">
                  A sua voz é o seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-300 neon-text-blue">maior instrumento.</span>
                </h1>
                <p className="text-base md:text-xl text-gray-400 mb-8 leading-relaxed font-light px-4 md:px-0">
                  A primeira escola de dublagem do Brasil com metodologia imersiva, estúdios de ponta e professores que são referências no mercado.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start px-6 md:px-0">
                  <Button onClick={() => handleEnroll()} className="bg-blue-600 hover:bg-blue-500 text-white text-base md:text-lg px-8 py-6 rounded-full font-bold shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all whimsy-hover group neon-glow-blue">
                    Comece sua jornada <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 text-base md:text-lg px-8 py-6 rounded-full font-bold whimsy-hover neon-glow-white">
                    <Play className="w-5 h-5 mr-2" /> Ver Trailer
                  </Button>
                </div>

                <div className="mt-12 flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
                  <div className="flex -space-x-4">
                    {[1, 2, 3, 4].map((i) => (
                      <img key={i} src={`https://i.pravatar.cc/150?u=${i}`} alt="Aluno" className="w-12 h-12 rounded-full border-2 border-black" />
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-yellow-400 mb-1">
                      {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <p className="text-sm text-gray-400 font-medium">+500 alunos formados</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="relative hidden lg:block"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-700/20 to-blue-500/20 rounded-[3rem] blur-3xl" />
                <div className="glass-panel p-2 rounded-[3rem] border-white/10 relative z-10 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                  <img 
                    src={siteData.banners?.[0]?.imageUrl || "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070"} 
                    alt="Estúdio de Dublagem" 
                    className="rounded-[2.5rem] w-full h-[600px] object-cover"
                  />
                  
                  {/* Floating UI Elements */}
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -left-8 top-20 glass-panel p-4 rounded-2xl border-white/10 flex items-center gap-4 shadow-2xl"
                  >
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                      <Mic className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase">Equipamento</p>
                      <p className="text-sm text-white font-bold">Padrão Indústria</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute -right-8 bottom-20 glass-panel p-4 rounded-2xl border-white/10 flex items-center gap-4 shadow-2xl"
                  >
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase">Certificado</p>
                      <p className="text-sm text-white font-bold">Reconhecido</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Logos Marquee */}
        <section className="py-10 border-y border-white/5 bg-white/[0.02] overflow-hidden">
          <div className="container mx-auto px-6 mb-6">
            <p className="text-center text-sm font-bold text-gray-500 uppercase tracking-widest">Nossos alunos estão nos maiores estúdios</p>
          </div>
          <div className="flex gap-6 md:gap-12 items-center justify-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500 flex-wrap px-6">
            <h3 className="text-xl md:text-2xl font-black font-display tracking-tighter">NETFLIX</h3>
            <h3 className="text-xl md:text-2xl font-black font-display tracking-tighter">PRIME VIDEO</h3>
            <h3 className="text-xl md:text-2xl font-black font-display tracking-tighter">DISNEY+</h3>
            <h3 className="text-xl md:text-2xl font-black font-display tracking-tighter">HBO MAX</h3>
            <h3 className="text-xl md:text-2xl font-black font-display tracking-tighter">CRUNCHYROLL</h3>
          </div>
        </section>

        {/* Modules Section */}
        <section id="metodologia" className="py-20 md:py-32 relative">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6 font-display tracking-tight px-4 md:px-0">Uma jornada completa do zero ao <span className="text-blue-500 neon-text-blue">profissional</span></h2>
              <p className="text-lg md:text-xl text-gray-400 font-light px-4 md:px-0">Nossa metodologia foi desenhada para construir sua base técnica e elevá-la ao nível de exigência dos grandes estúdios.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <AnimatePresence mode="wait">
                {expandedModule === null ? (
                  siteData.modules.map((mod, i) => (
                    <motion.div 
                      key={i}
                      layoutId={`module-${i}`}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ y: -10 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      onClick={() => setExpandedModule(i)}
                      className="glass-panel p-6 md:p-8 rounded-[2rem] border-white/5 hover:border-blue-600/30 transition-all duration-500 group relative overflow-hidden cursor-pointer max-w-md mx-auto w-full"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-colors"></div>
                      
                      <div className="text-6xl font-black text-white/5 font-display absolute top-4 right-6 group-hover:text-white/10 transition-colors">
                        {mod.num}
                      </div>
                      
                      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-blue-600/20 group-hover:border-blue-600/30 transition-all duration-300">
                        {i === 0 ? <Mic className="w-8 h-8 text-blue-400" /> : 
                         i === 1 ? <Headphones className="w-8 h-8 text-blue-400" /> : 
                         <Star className="w-8 h-8 text-blue-400" />}
                      </div>
                      
                      <h3 className="text-2xl font-bold text-white mb-4 font-display neon-text-white">{mod.title}</h3>
                      <p className="text-gray-400 mb-8 leading-relaxed">{mod.desc}</p>
                      
                      <div className="space-y-3 mb-8">
                        {mod.details.lessons.slice(0, 3).map((lesson, j) => (
                          <div key={j} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5 neon-text-blue" />
                            <span className="text-sm text-gray-300">{lesson}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="pt-6 border-t border-white/10 flex items-center justify-between mt-auto">
                        <span className="text-sm font-bold text-white neon-text-white">{mod.duration}</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleEnroll(mod.title); }}
                          className="text-xs font-bold text-blue-400 uppercase tracking-wider group-hover:translate-x-2 transition-transform flex items-center gap-1 neon-text-blue"
                        >
                          Matricule-se <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div 
                    layoutId={`module-${expandedModule}`}
                    className="col-span-1 md:col-span-3 glass-panel p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] border-blue-600/30 bg-white/[0.03] relative overflow-hidden"
                  >
                    <button 
                      onClick={(e) => { e.stopPropagation(); setExpandedModule(null); }}
                      className="absolute top-4 right-4 md:top-8 md:right-8 w-10 h-10 md:w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors z-20"
                    >
                      <Zap className="w-5 h-5 md:w-6 h-6 rotate-45" />
                    </button>

                    <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
                      <div>
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-8 text-center sm:text-left">
                          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-blue-600/20 border border-blue-600/30 flex items-center justify-center shrink-0">
                            {expandedModule === 0 ? <Mic className="w-8 h-8 md:w-10 md:h-10 text-blue-400" /> : 
                             expandedModule === 1 ? <Headphones className="w-8 h-8 md:w-10 md:h-10 text-blue-400" /> : 
                             <Star className="w-8 h-8 md:w-10 md:h-10 text-blue-400" />}
                          </div>
                          <div>
                            <span className="text-blue-400 font-black text-4xl md:text-6xl opacity-20 font-display leading-none neon-text-blue">{siteData.modules[expandedModule].num}</span>
                            <h3 className="text-2xl md:text-4xl font-black text-white font-display uppercase tracking-tight neon-text-white">{siteData.modules[expandedModule].title}</h3>
                          </div>
                        </div>

                        <p className="text-lg md:text-2xl text-gray-300 font-light leading-relaxed mb-8 md:mb-12 text-center sm:text-left px-4 md:px-0">
                          {siteData.modules[expandedModule].desc}
                        </p>

                        <div className="grid sm:grid-cols-2 gap-8 mb-8 lg:mb-0 px-4 md:px-0">
                          <div className="max-w-xs mx-auto sm:mx-0 w-full">
                            <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-6 flex items-center justify-center sm:justify-start gap-2">
                              <Zap className="w-4 h-4 text-blue-400" /> O que você vai aprender
                            </h4>
                            <ul className="space-y-4">
                              {siteData.modules[expandedModule].details.lessons.map((lesson, i) => (
                                <motion.li 
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.1 }}
                                  key={i} 
                                  className="flex items-start gap-3 text-gray-400"
                                >
                                  <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                  <span className="text-sm">{lesson}</span>
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                          <div className="max-w-xs mx-auto sm:mx-0 w-full">
                            <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-6 flex items-center justify-center sm:justify-start gap-2">
                              <Award className="w-4 h-4 text-blue-400" /> Metodologia
                            </h4>
                            <ul className="space-y-4">
                              {siteData.modules[expandedModule].details.methodology.map((item, i) => (
                                <motion.li 
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: (i + 5) * 0.1 }}
                                  key={i} 
                                  className="flex items-start gap-3 text-gray-400"
                                >
                                  <Zap className="w-5 h-5 text-blue-500/50 shrink-0 mt-0.5" />
                                  <span className="text-sm">{item}</span>
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="relative max-w-md mx-auto lg:mx-0 w-full mt-8 lg:mt-0">
                        <div className="absolute inset-0 bg-blue-600/20 blur-[100px] rounded-full" />
                        <div className="relative glass-panel p-6 md:p-8 rounded-[2rem] border-white/10">
                          <h4 className="text-white font-black text-xl mb-6 md:mb-8 font-display text-center">Próxima Turma</h4>
                          <div className="space-y-4 md:space-y-6 mb-8 md:mb-10">
                            <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/10">
                              <span className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-widest">Duração</span>
                              <span className="text-white font-black text-sm md:text-base">{siteData.modules[expandedModule].duration}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/10">
                              <span className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-widest">Aulas</span>
                              <span className="text-white font-black text-sm md:text-base">2x por semana</span>
                            </div>
                            <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/10">
                              <span className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-widest">Vagas</span>
                              <span className="text-blue-400 font-black text-sm md:text-base">Últimas 4</span>
                            </div>
                          </div>
                          <Button onClick={() => handleEnroll(siteData.modules[expandedModule].title)} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-6 md:py-8 rounded-2xl font-black text-base md:text-lg shadow-[0_0_30px_rgba(37,99,235,0.3)] whimsy-hover neon-glow-blue">
                            Quero me matricular
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Teachers Section */}
        <section id="professores" className="py-20 md:py-32 bg-black/40 border-y border-white/5 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-20 gap-8 text-center md:text-left">
                  <div className="max-w-2xl mx-auto md:mx-0">
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-6 font-display tracking-tight px-4 md:px-0">Aprenda com quem <span className="text-blue-600 neon-text-blue">faz acontecer.</span></h2>
                    <p className="text-lg md:text-xl text-gray-400 font-light px-4 md:px-0">Nossos professores são profissionais ativos no mercado, dirigindo e dublando as maiores produções da atualidade.</p>
                  </div>
                  <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 rounded-full px-8 py-4 h-auto whimsy-hover shrink-0 mx-auto md:mx-0 neon-glow-white">
                    Conhecer toda a equipe
                  </Button>
                </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {siteData.teachers.map((teacher, i) => (
                <div key={i} className="flex justify-center">
                  <TeacherCard teacher={teacher} index={i} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="depoimentos" className="py-20 md:py-32 relative">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6 font-display tracking-tight px-4 md:px-0">O que dizem nossos <span className="text-blue-600 neon-text-blue">alunos</span></h2>
              <p className="text-lg md:text-xl text-gray-400 font-light px-4 md:px-0">Histórias reais de quem transformou a paixão pela voz em profissão.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {siteData.testimonials?.map((testimonial: any, i: number) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="glass-panel p-6 md:p-8 rounded-[2rem] border-white/5 relative max-w-md mx-auto w-full"
                >
                  <div className="text-blue-600/20 mb-6">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.017 21L16.41 14.596C16.897 13.264 17.14 11.96 17.14 10.684C17.14 9.408 16.897 8.212 16.41 7.096C15.923 5.98 15.242 5.012 14.368 4.192L11.56 6.88C12.34 7.604 12.89 8.356 13.21 9.136C13.53 9.916 13.69 10.744 13.69 11.62C13.69 12.004 13.65 12.388 13.57 12.772L13.45 13.312H10.15V21H14.017ZM6.867 21L9.26 14.596C9.747 13.264 9.99 11.96 9.99 10.684C9.99 9.408 9.747 8.212 9.26 7.096C8.773 5.98 8.092 5.012 7.218 4.192L4.41 6.88C5.19 7.604 5.74 8.356 6.06 9.136C6.38 9.916 6.54 10.744 6.54 11.62C6.54 12.004 6.5 12.388 6.42 12.772L6.3 13.312H3V21H6.867Z" />
                    </svg>
                  </div>
                  <p className="text-lg text-gray-300 mb-8 leading-relaxed">"{testimonial.text}"</p>
                  <div className="flex items-center gap-4 mt-auto">
                    <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full border-2 border-white/10" />
                    <div>
                      <h4 className="font-bold text-white neon-text-white">{testimonial.name}</h4>
                      <p className="text-sm text-blue-400 neon-text-blue">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 md:py-32 bg-black/40 border-t border-white/5">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6 font-display tracking-tight px-4 md:px-0">Dúvidas Frequentes</h2>
              <p className="text-lg md:text-xl text-gray-400 font-light px-4 md:px-0">Tudo o que você precisa saber antes de dar o primeiro passo.</p>
            </div>

            <div className="space-y-4 px-4 md:px-0">
              {siteData.faqs?.map((faq: any, index: number) => (
                <div 
                  key={faq.id} 
                  className={`glass-panel rounded-2xl border-white/5 overflow-hidden transition-all duration-300 ${activeFaq === index ? 'bg-white/5 border-blue-600/30' : 'hover:bg-white/[0.02]'}`}
                >
                  <button 
                    onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                    className="w-full px-6 md:px-8 py-5 md:py-6 flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className={`text-base md:text-lg font-bold text-white pr-8 ${activeFaq === index ? 'neon-text-blue text-blue-400' : ''}`}>{faq.question}</span>
                    <ChevronDown className={`w-4 h-4 md:w-5 h-5 text-blue-500 shrink-0 transition-transform duration-300 ${activeFaq === index ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {activeFaq === index && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-6 md:px-8 pb-6 text-gray-400 leading-relaxed border-t border-white/5 pt-4 text-sm md:text-base">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/20 to-transparent pointer-events-none"></div>
          <div className="container mx-auto px-6 relative z-10 text-center">
            <h2 className="text-4xl md:text-7xl font-black text-white mb-8 font-display tracking-tight max-w-4xl mx-auto leading-[1.1] px-4 md:px-0">
              Sua voz tem poder. <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-300 neon-text-blue">Aprenda a usá-lo.</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto font-light px-6 md:px-0">
              As vagas para a próxima turma são limitadas para garantir a qualidade e atenção individual em estúdio.
            </p>
            <Button onClick={() => handleEnroll()} className="bg-blue-600 hover:bg-blue-500 text-white text-lg md:text-xl px-10 md:px-12 py-6 md:py-8 rounded-full font-bold shadow-[0_0_40px_rgba(37,99,235,0.4)] transition-all whimsy-hover mx-auto flex items-center justify-center neon-glow-blue">
              Garantir Minha Vaga Agora
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black pt-20 pb-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-blue-500 flex items-center justify-center">
                  <Mic className="w-5 h-5 text-white" />
                </div>
                <span className="font-black text-2xl tracking-tighter font-display text-white">{siteData.settings?.siteName || 'StudioVoice Pro'}</span>
              </div>
              <p className="text-gray-400 mb-8 max-w-sm leading-relaxed">
                A principal escola de formação de dubladores do país, conectando talentos aos maiores estúdios do mercado.
              </p>
              <div className="flex gap-4">
                {/* Social Icons Mock */}
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-blue-600 hover:text-black transition-colors cursor-pointer">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-blue-600 hover:text-black transition-colors cursor-pointer">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Links Rápidos</h4>
              <ul className="space-y-3">
                <li><a href="#metodologia" className="text-gray-400 hover:text-blue-400 transition-colors hover:neon-text-blue">Metodologia</a></li>
                <li><a href="#professores" className="text-gray-400 hover:text-blue-400 transition-colors hover:neon-text-blue">Professores</a></li>
                <li><a href="#depoimentos" className="text-gray-400 hover:text-blue-400 transition-colors hover:neon-text-blue">Depoimentos</a></li>
                <li><a href="#faq" className="text-gray-400 hover:text-blue-400 transition-colors hover:neon-text-blue">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Contato</h4>
              <ul className="space-y-3">
                <li className="text-gray-400">{siteData.settings?.contactEmail || 'contato@studiovoice.com'}</li>
                <li className="text-gray-400">WhatsApp: (11) 99999-9999</li>
                <li className="text-gray-400">São Paulo, SP</li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5 text-sm text-gray-500">
            <p>© 2026 {siteData.settings?.siteName || 'StudioVoice Pro'}. Todos os direitos reservados.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-white transition-colors">Privacidade</a>
              <button onClick={() => setIsAdminOpen(true)} className="hover:text-blue-400 transition-colors">Área Restrita</button>
            </div>
          </div>
        </div>
      </footer>

      <Enrollment 
        isOpen={isEnrollmentOpen} 
        onClose={() => setIsEnrollmentOpen(false)} 
        modules={siteData.modules}
        initialModule={selectedModuleForEnrollment}
        onEnroll={handleNewEnrollment}
      />
    </div>
  );
}

export default App;
