import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';
import { 
  Lock, Save, LogOut, Settings, Image as ImageIcon, 
  Users, GraduationCap, Search, Plus, Trash2, 
  LayoutDashboard, TrendingUp, BookOpen, Activity,
  MoreVertical, Edit3, Shield, Database, Bell,
  MessageSquare, ChevronDown, CheckCircle2, XCircle,
  AlertCircle, ChevronRight, ClipboardList, Award,
  HelpCircle
} from 'lucide-react';
import { Button } from './ui/button';

import { firebaseService } from '../services/firebaseService';

export function AdminPanel({ data, onSave, onClose }: any) {
  const [auth, setAuth] = useState(false);
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [draft, setDraft] = useState(data);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchStudent, setSearchStudent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, action: () => void, title: string, desc: string} | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await firebaseService.getCurrentUser();
      if (user) {
        const profile = await firebaseService.getStudentProfile(user.uid);
        if (profile?.role === 'owner' || user.email === 'borbaggabriel@gmail.com' || user.email === 'borba.costelinha@gmail.com') {
          setAuth(true);
        }
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (auth) {
      loadAdminData();
    }
  }, [auth]);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [students, enrollments, activity, siteData] = await Promise.all([
        firebaseService.getAllStudents(),
        firebaseService.getAllEnrollments(),
        firebaseService.getAllActivity(),
        firebaseService.getSiteData()
      ]);

      setDraft((prev: any) => ({
        ...prev,
        ...siteData,
        students: students?.map((s: any) => ({
          ...s,
          name: s.full_name || s.name || 'Sem Nome',
          avatar: s.avatar_url || s.avatar || `https://i.pravatar.cc/150?u=${s.id}`
        })) || [],
        enrollments: enrollments || [],
        recentActivity: activity?.map((a: any) => ({
          id: a.id,
          user: a.student_id,
          action: a.activity_type,
          target: a.description,
          time: new Date(a.created_at?.seconds * 1000 || a.created_at).toLocaleString(),
          avatar: "https://i.pravatar.cc/150?u=" + a.student_id
        })) || []
      }));
    } catch (error) {
      console.error('Failed to load admin data:', error);
      toast.error('Erro ao carregar dados do painel.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await firebaseService.signIn(email, pwd);
      const user = result.user;
      if (user) {
        // Check if user is owner
        const profile = await firebaseService.getStudentProfile(user.uid);
        if (profile?.role === 'owner' || user.email === 'borbaggabriel@gmail.com' || user.email === 'borba.costelinha@gmail.com') {
          setAuth(true);
          toast.success('Acesso concedido ao painel administrativo.');
        } else {
          await firebaseService.signOut();
          toast.error('Acesso negado. Apenas administradores podem acessar esta área.');
        }
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(error.message || 'Falha na autenticação. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await firebaseService.signOut();
      setAuth(false);
      onClose();
      toast.success('Sessão encerrada com sucesso.');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Erro ao encerrar sessão.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (section: string, index: number, field: string, value: any) => {
    const newDraft = { ...draft };
    newDraft[section][index][field] = value;
    setDraft(newDraft);
  };

  const handleSettingChange = (field: string, value: string) => {
    setDraft({
      ...draft,
      settings: { ...draft.settings, [field]: value }
    });
  };

  const handleAdd = (section: string, defaultItem: any) => {
    const newDraft = { ...draft };
    if (!newDraft[section]) newDraft[section] = [];
    const tempId = `temp-${Date.now()}`;
    const itemWithId = { ...defaultItem, id: defaultItem.id || tempId };
    newDraft[section].push(itemWithId);
    setDraft(newDraft);
    toast.success('Item adicionado com sucesso.');
  };

  const handleDelete = (section: string, index: number) => {
    const item = draft[section][index];
      setConfirmModal({
        isOpen: true,
        title: 'Confirmar Exclusão',
        desc: 'Tem certeza que deseja remover este item? Esta ação não pode ser desfeita.',
        action: async () => {
          setIsLoading(true);
          try {
            if (item.id) {
              if (section === 'banners') await firebaseService.deleteBanner(item.id);
              if (section === 'teachers') await firebaseService.deleteTeacher(item.id);
              if (section === 'enrollments') await firebaseService.deleteEnrollment(item.id);
              if (section === 'modules') await firebaseService.deleteModule(item.id);
              if (section === 'learnings') await firebaseService.deleteLearning(item.id);
              if (section === 'testimonials') await firebaseService.deleteTestimonial(item.id);
              if (section === 'faqs') await firebaseService.deleteFAQ(item.id);
            }
            const newDraft = { ...draft };
            newDraft[section].splice(index, 1);
            setDraft(newDraft);
            toast.success('Item removido com sucesso.');
          } catch (error) {
            console.error('Failed to delete item:', error);
            toast.error('Erro ao remover item.');
          } finally {
            setIsLoading(false);
            setConfirmModal(null);
          }
        }
      });
  };

  const handleSave = async () => {
    setIsLoading(true);
    console.log('=== INICIANDO SAVE ===');
    console.log('Dados a salvar:', JSON.stringify(draft, null, 2));
    
    try {
      // Save Settings
      console.log('Salvando settings...', draft.settings);
      await firebaseService.updateSettings(draft.settings);
      console.log('✓ Settings salvos');

      // Save Banners
      console.log(`Salvando ${draft.banners?.length || 0} banners...`);
      for (const banner of draft.banners) {
        if (typeof banner.id === 'string' && banner.id.startsWith('temp-')) {
          const { id, ...bannerData } = banner;
          console.log('Criando novo banner:', bannerData);
          await firebaseService.createBanner(bannerData);
        } else if (banner.id) {
          console.log('Atualizando banner:', banner.id);
          await firebaseService.updateBanner(banner.id, banner);
        }
      }
      console.log('✓ Banners salvos');

      // Save Modules
      if (draft.modules) {
        console.log(`Salvando ${draft.modules.length} modules...`);
        for (const module of draft.modules) {
          if (typeof module.id === 'string' && module.id.startsWith('temp-')) {
            const { id, ...moduleData } = module;
            console.log('Criando novo module:', moduleData);
            await firebaseService.createModule(moduleData);
          } else if (module.id) {
            console.log('Atualizando module:', module.id);
            await firebaseService.updateModule(module.id, module);
          }
        }
        console.log('✓ Modules salvos');
      }

      // Save Learnings
      if (draft.learnings) {
        console.log(`Salvando ${draft.learnings.length} learnings...`);
        for (const learning of draft.learnings) {
          if (typeof learning.id === 'string' && learning.id.startsWith('temp-')) {
            const { id, ...learningData } = learning;
            console.log('Criando novo learning:', learningData);
            await firebaseService.createLearning(learningData);
          } else if (learning.id) {
            console.log('Atualizando learning:', learning.id);
            await firebaseService.updateLearning(learning.id, learning);
          }
        }
        console.log('✓ Learnings salvos');
      }

      // Save Testimonials
      if (draft.testimonials) {
        console.log(`Salvando ${draft.testimonials.length} testimonials...`);
        for (const testimonial of draft.testimonials) {
          if (typeof testimonial.id === 'string' && testimonial.id.startsWith('temp-')) {
            const { id, ...testimonialData } = testimonial;
            console.log('Criando novo testimonial:', testimonialData);
            await firebaseService.createTestimonial(testimonialData);
          } else if (testimonial.id) {
            console.log('Atualizando testimonial:', testimonial.id);
            await firebaseService.updateTestimonial(testimonial.id, testimonial);
          }
        }
        console.log('✓ Testimonials salvos');
      }

      // Save FAQs
      if (draft.faqs) {
        console.log(`Salvando ${draft.faqs.length} FAQs...`);
        for (const faq of draft.faqs) {
          if (typeof faq.id === 'string' && faq.id.startsWith('temp-')) {
            const { id, ...faqData } = faq;
            console.log('Criando novo FAQ:', faqData);
            await firebaseService.createFAQ(faqData);
          } else if (faq.id) {
            console.log('Atualizando FAQ:', faq.id);
            await firebaseService.updateFAQ(faq.id, faq);
          }
        }
        console.log('✓ FAQs salvos');
      }

      // Save Teachers
      if (draft.teachers) {
        console.log(`Salvando ${draft.teachers.length} teachers...`);
        for (const teacher of draft.teachers) {
          if (typeof teacher.id === 'string' && teacher.id.startsWith('temp-')) {
            const { id, ...teacherData } = teacher;
            console.log('Criando novo teacher:', teacherData);
            await firebaseService.createTeacher(teacherData);
          } else if (teacher.id) {
            console.log('Atualizando teacher:', teacher.id);
            await firebaseService.updateTeacher(teacher.id, teacher);
          }
        }
        console.log('✓ Teachers salvos');
      }

      // Save Students (Profiles)
      if (draft.students) {
        console.log(`Salvando ${draft.students.length} students...`);
        for (const student of draft.students) {
          if (student.id) {
            const profileToSave = { ...student };
            // Map back to DB fields
            if (profileToSave.name) profileToSave.full_name = profileToSave.name;
            if (profileToSave.avatar) profileToSave.avatar_url = profileToSave.avatar;
            
            // Clean up temporary fields before saving
            delete profileToSave.name;
            delete profileToSave.avatar;
            delete profileToSave.id;
            
            console.log('Atualizando student profile:', student.id, profileToSave);
            await firebaseService.updateStudentProfile(student.id, profileToSave);
          }
        }
        console.log('✓ Students salvos');
      }

      console.log('=== SAVE COMPLETO ===');
      onSave(draft);
      toast.success('Todas as alterações foram salvas e publicadas.');
    } catch (error) {
      console.error('=== ERRO NO SAVE ===', error);
      console.error('Stack:', error instanceof Error ? error.stack : 'N/A');
      toast.error('Erro ao salvar alterações. Verifique o console.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnrollmentStatusChange = async (index: number, id: string, status: string) => {
    try {
      await firebaseService.updateEnrollmentStatus(id, status);
      handleChange('enrollments', index, 'status', status);
      toast.success('Status da matrícula atualizado.');
    } catch (error) {
      toast.error('Erro ao atualizar status.');
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'enrollments', label: 'Matrículas', icon: ClipboardList },
    { id: 'students', label: 'Alunos', icon: GraduationCap },
    { id: 'teachers', label: 'Professores', icon: Users },
    { id: 'modules', label: 'Módulos', icon: BookOpen },
    { id: 'learnings', label: 'Aprendizados', icon: Award },
    { id: 'testimonials', label: 'Depoimentos', icon: MessageSquare },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle },
    { id: 'banners', label: 'Banners', icon: ImageIcon },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  if (!auth) {
    return (
      <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex items-center justify-center p-4">
        <Toaster theme="dark" position="top-center" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="glass-panel p-10 rounded-[2.5rem] w-full max-w-md text-center border-cyan-500/30 shadow-[0_0_80px_rgba(34,211,238,0.15)] relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
          <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-cyan-500/20">
            <Lock className="w-10 h-10 text-cyan-400" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2 font-display tracking-tight">Acesso Restrito</h2>
          <p className="text-muted-foreground mb-8">Acesse o painel administrativo com suas credenciais do Supabase.</p>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-4">
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="E-mail Administrativo" 
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-center text-lg"
                  required
                  autoFocus
                />
              </div>
              <div className="relative">
                <input 
                  type="password" 
                  value={pwd}
                  onChange={e => setPwd(e.target.value)}
                  placeholder="Senha" 
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-center text-lg tracking-widest"
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-lg py-7 rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all whimsy-hover">
              {isLoading ? 'Autenticando...' : 'Entrar no Painel'}
            </Button>
          </form>
          <button onClick={onClose} className="mt-8 text-sm text-muted-foreground hover:text-white transition-colors">
            ← Voltar ao site
          </button>
        </motion.div>
      </div>
    );
  }

  const filteredStudents = draft.students?.filter((s: any) => 
    s.name.toLowerCase().includes(searchStudent.toLowerCase()) || 
    s.email.toLowerCase().includes(searchStudent.toLowerCase())
  ) || [];

  return (
    <div className="fixed inset-0 z-[100] bg-[#050505] flex overflow-hidden text-foreground font-sans">
      <Toaster theme="dark" position="top-right" />

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmModal && (
          <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111] border border-white/10 p-8 rounded-3xl max-w-sm w-full shadow-2xl"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 mb-6">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{confirmModal.title}</h3>
              <p className="text-muted-foreground mb-8">{confirmModal.desc}</p>
              <div className="flex gap-4">
                <Button onClick={() => setConfirmModal(null)} variant="outline" className="flex-1 border-white/10 text-white hover:bg-white/5 rounded-xl">
                  Cancelar
                </Button>
                <Button onClick={confirmModal.action} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl">
                  Excluir
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Loading Overlay */}
      {isLoading && !confirmModal && (
        <div className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
            <p className="text-cyan-400 font-bold animate-pulse uppercase tracking-widest text-[10px]">Sincronizando Dados...</p>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="w-72 border-r border-white/5 bg-[#0a0a0a] flex flex-col shrink-0 relative z-20 shadow-2xl">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white font-display tracking-tight leading-none">Admin<span className="text-cyan-400">Pro</span></h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Command Center</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)} 
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium relative group ${isActive ? 'text-cyan-400' : 'text-muted-foreground hover:text-white'}`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeTab" 
                    className="absolute inset-0 bg-cyan-500/10 border border-cyan-500/20 rounded-xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-cyan-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
        
        <div className="p-6 border-t border-white/5 bg-black/20 space-y-3">
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl py-6 shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all whimsy-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isLoading ? 'Salvando...' : 'Publicar Alterações'}
          </Button>
          <Button onClick={handleLogout} variant="outline" className="w-full border-white/10 text-white hover:bg-white/5 rounded-xl py-6 whimsy-hover">
            <LogOut className="w-4 h-4 mr-2" /> Sair do Painel
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative bg-[#0a0a0a]">
        {/* Ambient Background */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-cyan-900/10 to-transparent pointer-events-none"></div>
        
        {/* Topbar */}
        <header className="h-20 border-b border-white/5 bg-black/20 backdrop-blur-md flex items-center justify-between px-8 relative z-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Admin</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white capitalize">{activeTab}</span>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative text-muted-foreground hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white">Administrador</p>
                <p className="text-xs text-muted-foreground">admin@studiovoice.com</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 relative z-10">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              
              {/* DASHBOARD TAB */}
              {activeTab === 'dashboard' && (
                <motion.div 
                  key="dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div>
                    <h3 className="text-3xl font-black text-white mb-2 font-display tracking-tight">Visão Geral</h3>
                    <p className="text-muted-foreground">Métricas e status atual da sua plataforma de dublagem.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="glass-panel p-6 rounded-3xl border-white/5 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                          <GraduationCap className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground font-medium">Total de Alunos</p>
                          <h4 className="text-3xl font-bold text-white">{draft.students?.length || 0}</h4>
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-green-400 font-medium">
                        <TrendingUp className="w-3 h-3 mr-1" /> +12% este mês
                      </div>
                    </div>
                    
                    <div className="glass-panel p-6 rounded-3xl border-white/5 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors"></div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                          <Users className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground font-medium">Professores Ativos</p>
                          <h4 className="text-3xl font-bold text-white">{draft.teachers?.length || 0}</h4>
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground font-medium">
                        Equipe completa
                      </div>
                    </div>
                    
                    <div className="glass-panel p-6 rounded-3xl border-white/5 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-colors"></div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                          <ClipboardList className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground font-medium">Novas Matrículas</p>
                          <h4 className="text-3xl font-bold text-white">{draft.enrollments?.length || 0}</h4>
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-cyan-400 font-medium">
                        Aguardando contato
                      </div>
                    </div>
                    
                    <div className="glass-panel p-6 rounded-3xl border-white/5 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-colors"></div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center text-green-400">
                          <Activity className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground font-medium">Status do Sistema</p>
                          <h4 className="text-xl font-bold text-white mt-1">Online</h4>
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-green-400 font-medium">
                        Todos os serviços operantes
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 glass-panel p-8 rounded-3xl border-white/5">
                      <div className="flex items-center justify-between mb-8">
                        <h4 className="text-xl font-bold text-white font-display">Crescimento de Alunos</h4>
                        <select className="bg-black/50 border border-white/10 rounded-lg px-3 py-1 text-sm text-muted-foreground focus:outline-none">
                          <option>Últimos 6 meses</option>
                          <option>Este ano</option>
                        </select>
                      </div>
                      {/* Mock Chart */}
                      <div className="h-64 flex items-end justify-between gap-2">
                        {[40, 60, 45, 80, 65, 100].map((height, i) => (
                          <div key={i} className="w-full flex flex-col items-center gap-2 group">
                            <div className="w-full bg-white/5 rounded-t-lg relative overflow-hidden h-full flex items-end">
                              <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: `${height}%` }}
                                transition={{ duration: 1, delay: i * 0.1 }}
                                className="w-full bg-gradient-to-t from-cyan-500/20 to-cyan-400 rounded-t-lg group-hover:from-cyan-400/40 group-hover:to-cyan-300 transition-colors"
                              ></motion.div>
                            </div>
                            <span className="text-xs text-muted-foreground">Mês {i+1}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="glass-panel p-8 rounded-3xl border-white/5 flex flex-col">
                      <h4 className="text-xl font-bold text-white mb-6 font-display">Atividade Recente</h4>
                      <div className="flex-1 space-y-6 overflow-y-auto pr-2">
                        {draft.recentActivity?.map((activity: any) => (
                          <div key={activity.id} className="flex gap-4">
                            <img src={activity.avatar} alt={activity.user} className="w-10 h-10 rounded-full border border-white/10" />
                            <div>
                              <p className="text-sm text-white">
                                <span className="font-bold">{activity.user}</span> {activity.action} <span className="text-cyan-400">{activity.target}</span>
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ENROLLMENTS TAB */}
              {activeTab === 'enrollments' && (
                <motion.div 
                  key="enrollments"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div>
                    <h3 className="text-3xl font-black text-white mb-2 font-display tracking-tight">Solicitações de Matrícula</h3>
                    <p className="text-muted-foreground">Interessados que preencheram o formulário no site.</p>
                  </div>

                  <div className="glass-panel rounded-3xl border-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-white/[0.02] border-b border-white/5">
                            <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Interessado</th>
                            <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Curso de Interesse</th>
                            <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Contato</th>
                            <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Data</th>
                            <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {draft.enrollments && draft.enrollments.length > 0 ? (
                            draft.enrollments.map((enrollment: any, index: number) => (
                              <tr key={enrollment.id || index} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                <td className="p-5">
                                  <div className="font-bold text-white">{enrollment.name}</div>
                                  <div className="text-xs text-muted-foreground">{enrollment.email}</div>
                                </td>
                                <td className="p-5">
                                  <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20">
                                    {enrollment.module || 'Não especificado'}
                                  </span>
                                </td>
                                <td className="p-5 text-sm text-gray-300">
                                  {enrollment.phone}
                                </td>
                                <td className="p-5 text-sm text-muted-foreground">
                                  {enrollment.date}
                                </td>
                                <td className="p-5">
                                  <select 
                                    value={enrollment.status} 
                                    onChange={e => handleEnrollmentStatusChange(index, enrollment.id, e.target.value)}
                                    className={`bg-transparent border-none font-bold text-xs focus:ring-1 focus:ring-cyan-400 rounded px-2 py-1 appearance-none cursor-pointer ${enrollment.status === 'Pendente' ? 'text-yellow-400' : enrollment.status === 'Contatado' ? 'text-blue-400' : 'text-green-400'}`}
                                  >
                                    <option className="bg-[#111]" value="Pendente">Pendente</option>
                                    <option className="bg-[#111]" value="Contatado">Contatado</option>
                                    <option className="bg-[#111]" value="Matriculado">Matriculado</option>
                                    <option className="bg-[#111]" value="Desistiu">Desistiu</option>
                                  </select>
                                </td>
                                <td className="p-5 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button 
                                      onClick={() => {
                                        const msg = `Olá ${enrollment.name}, vi seu interesse no curso de dublagem (${enrollment.module}). Podemos conversar?`;
                                        window.open(`https://wa.me/${enrollment.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                                      }}
                                      className="p-2 rounded-lg text-green-500 hover:bg-green-500/10 transition-colors"
                                      title="Contatar via WhatsApp"
                                    >
                                      <MessageSquare className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => handleDelete('enrollments', index)}
                                      className="p-2 rounded-lg text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                      title="Remover Solicitação"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="p-12 text-center">
                                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                  <ClipboardList className="w-12 h-12 opacity-20" />
                                  <p>Nenhuma solicitação de matrícula pendente.</p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STUDENTS TAB */}
              {activeTab === 'students' && (
                <motion.div 
                  key="students"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-3xl font-black text-white mb-2 font-display tracking-tight">Alunos Matriculados</h3>
                      <p className="text-muted-foreground">Gerencie os alunos e acompanhe o status das matrículas.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input 
                          type="text" 
                          value={searchStudent}
                          onChange={(e) => setSearchStudent(e.target.value)}
                          placeholder="Buscar aluno..." 
                          className="bg-black/50 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors w-full md:w-64"
                        />
                      </div>
                      <Button 
                        onClick={() => handleAdd('students', { id: Date.now(), name: 'Novo Aluno', email: 'email@exemplo.com', plan: 'Formação Completa', status: 'Ativo', date: new Date().toISOString().split('T')[0], progress: 0, avatar: `https://i.pravatar.cc/150?u=${Date.now()}` })}
                        className="bg-white text-black hover:bg-gray-200 rounded-xl whimsy-hover shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="glass-panel rounded-3xl border-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-white/[0.02] border-b border-white/5">
                            <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Aluno</th>
                            <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Plano</th>
                            <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Progresso</th>
                            <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Data</th>
                            <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStudents.length > 0 ? (
                            filteredStudents.map((student: any, index: number) => {
                              const actualIndex = draft.students.findIndex((s: any) => s.id === student.id);
                              return (
                                <tr key={student.id || index} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                  <td className="p-5">
                                    <div className="flex items-center gap-3">
                                      <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full border border-white/10" />
                                      <div>
                                        <input type="text" value={student.name} onChange={e => handleChange('students', actualIndex, 'name', e.target.value)} className="bg-transparent border-none text-white font-bold focus:ring-1 focus:ring-cyan-400 rounded px-1 py-0.5 w-full block" />
                                        <input type="text" value={student.email} onChange={e => handleChange('students', actualIndex, 'email', e.target.value)} className="bg-transparent border-none text-muted-foreground focus:ring-1 focus:ring-cyan-400 rounded px-1 py-0.5 w-full text-xs block mt-1" />
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-5">
                                    <select value={student.plan} onChange={e => handleChange('students', actualIndex, 'plan', e.target.value)} className="bg-transparent border-none text-gray-300 focus:ring-1 focus:ring-cyan-400 rounded px-2 py-1 w-full text-sm appearance-none cursor-pointer">
                                      <option className="bg-[#111]" value="Formação Completa">Formação Completa</option>
                                      <option className="bg-[#111]" value="Módulo Iniciante">Módulo Iniciante</option>
                                      <option className="bg-[#111]" value="Módulo Intermediário">Módulo Intermediário</option>
                                      <option className="bg-[#111]" value="Módulo Avançado">Módulo Avançado</option>
                                    </select>
                                  </td>
                                  <td className="p-5">
                                    <div className="flex items-center gap-3">
                                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${student.progress}%` }}></div>
                                      </div>
                                      <span className="text-xs text-muted-foreground w-8">{student.progress}%</span>
                                    </div>
                                  </td>
                                  <td className="p-5">
                                    <select value={student.status} onChange={e => handleChange('students', actualIndex, 'status', e.target.value)} className={`bg-transparent border-none font-bold text-xs focus:ring-1 focus:ring-cyan-400 rounded px-2 py-1 appearance-none cursor-pointer ${student.status === 'Ativo' ? 'text-green-400' : 'text-red-400'}`}>
                                      <option className="bg-[#111]" value="Ativo">Ativo</option>
                                      <option className="bg-[#111]" value="Inadimplente">Inadimplente</option>
                                      <option className="bg-[#111]" value="Cancelado">Cancelado</option>
                                    </select>
                                  </td>
                                  <td className="p-5 text-muted-foreground text-sm">
                                    <input type="date" value={student.date} onChange={e => handleChange('students', actualIndex, 'date', e.target.value)} className="bg-transparent border-none text-muted-foreground focus:ring-1 focus:ring-cyan-400 rounded px-2 py-1" />
                                  </td>
                                  <td className="p-5 text-right">
                                    <button 
                                      onClick={() => handleDelete('students', actualIndex)}
                                      className="p-2 rounded-lg text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                      title="Remover Aluno"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                Nenhum aluno encontrado.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TEACHERS TAB */}
              {activeTab === 'teachers' && (
                <motion.div 
                  key="teachers"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-3xl font-black text-white mb-2 font-display tracking-tight">Professores</h3>
                      <p className="text-muted-foreground">Atualize a equipe de mestres e suas biografias.</p>
                    </div>
                    <Button 
                      onClick={() => handleAdd('teachers', { name: 'Novo Professor', role: 'Módulo', bio: 'Biografia...', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800', specialties: [] })}
                      className="bg-white text-black hover:bg-gray-200 rounded-xl whimsy-hover"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Adicionar Professor
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {draft.teachers?.map((teacher: any, index: number) => (
                      <div key={index} className="glass-panel p-6 rounded-3xl border-white/5 relative group flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-4">
                            <img src={teacher.photo} alt="Preview" className="w-16 h-16 rounded-2xl object-cover border border-white/10 shadow-lg" referrerPolicy="no-referrer" />
                            <div>
                              <h4 className="text-lg font-bold text-white font-display leading-tight">{teacher.name || 'Novo Professor'}</h4>
                              <p className="text-sm text-cyan-400">{teacher.role}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDelete('teachers', index)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
                            title="Remover Professor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="space-y-4 flex-1">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Nome Completo</label>
                            <input type="text" value={teacher.name} onChange={e => handleChange('teachers', index, 'name', e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-400 transition-all" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Função / Módulo</label>
                            <input type="text" value={teacher.role} onChange={e => handleChange('teachers', index, 'role', e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-400 transition-all" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Biografia</label>
                            <textarea value={teacher.bio} onChange={e => handleChange('teachers', index, 'bio', e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-sm text-white h-20 focus:border-cyan-400 transition-all resize-none" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">URL da Foto</label>
                            <input type="text" value={teacher.photo} onChange={e => handleChange('teachers', index, 'photo', e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-400 transition-all" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* BANNERS TAB */}
              {activeTab === 'banners' && (
                <motion.div 
                  key="banners"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-3xl font-black text-white mb-2 font-display tracking-tight">Banners Principais</h3>
                      <p className="text-muted-foreground">Edite os textos e imagens do carrossel inicial do site.</p>
                    </div>
                    <Button 
                      onClick={() => handleAdd('banners', { title: 'Novo Banner', subtitle: 'DESTAQUE', description: 'Descrição do banner.', imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070' })}
                      className="bg-white text-black hover:bg-gray-200 rounded-xl whimsy-hover"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Adicionar Banner
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {draft.banners?.map((banner: any, index: number) => (
                      <div key={index} className="glass-panel p-8 rounded-3xl border-white/5 relative group overflow-hidden">
                        <div className="absolute inset-0 opacity-20 pointer-events-none">
                          <img src={banner.imageUrl} alt="Background Preview" className="w-full h-full object-cover blur-xl" referrerPolicy="no-referrer" />
                        </div>
                        <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500 rounded-l-3xl z-10"></div>
                        
                        <div className="relative z-10">
                          <div className="flex justify-between items-center mb-6">
                            <h4 className="text-xl font-bold text-white font-display">Slide {index + 1}</h4>
                            <button 
                              onClick={() => handleDelete('banners', index)}
                              className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
                              title="Remover Banner"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Título Principal</label>
                              <input type="text" value={banner.title} onChange={e => handleChange('banners', index, 'title', e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Subtítulo (Destaque)</label>
                              <input type="text" value={banner.subtitle} onChange={e => handleChange('banners', index, 'subtitle', e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all" />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Descrição</label>
                              <textarea value={banner.description} onChange={e => handleChange('banners', index, 'description', e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white h-24 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all resize-none" />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">URL da Imagem de Fundo</label>
                              <div className="flex gap-4">
                                <input type="text" value={banner.imageUrl} onChange={e => handleChange('banners', index, 'imageUrl', e.target.value)} className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all" />
                                {banner.imageUrl && (
                                  <img src={banner.imageUrl} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-white/10" referrerPolicy="no-referrer" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* MODULES TAB */}
              {activeTab === 'modules' && (
                <motion.div 
                  key="modules"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-3xl font-black text-white mb-2 font-display tracking-tight">Módulos do Curso</h3>
                      <p className="text-muted-foreground">Edite os módulos, professores e detalhes do curso.</p>
                    </div>
                    <Button 
                      onClick={() => handleAdd('modules', { title: 'Novo Módulo', teacher: 'Professor', duration: '4 meses', desc: 'Descrição do módulo.' })}
                      className="bg-white text-black hover:bg-gray-200 rounded-xl whimsy-hover"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Adicionar Módulo
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {draft.modules?.map((module: any, index: number) => (
                      <div key={index} className="glass-panel p-8 rounded-3xl border-white/5 relative group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 rounded-l-3xl z-10"></div>
                        
                        <div className="relative z-10">
                          <div className="flex justify-between items-center mb-6">
                            <h4 className="text-xl font-bold text-white font-display">{module.title}</h4>
                            <button 
                              onClick={() => handleDelete('modules', index)}
                              className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
                              title="Remover Módulo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Título</label>
                              <input type="text" value={module.title} onChange={e => handleChange('modules', index, 'title', e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Professor</label>
                              <input type="text" value={module.teacher} onChange={e => handleChange('modules', index, 'teacher', e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all" />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Descrição</label>
                              <textarea value={module.desc} onChange={e => handleChange('modules', index, 'desc', e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white h-24 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all resize-none" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* LEARNINGS TAB */}
              {activeTab === 'learnings' && (
                <motion.div 
                  key="learnings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-3xl font-black text-white mb-2 font-display tracking-tight">O que você vai aprender</h3>
                      <p className="text-muted-foreground">Edite os pontos de aprendizado do curso.</p>
                    </div>
                    <Button 
                      onClick={() => handleAdd('learnings', { title: 'Novo Aprendizado', description: 'Descrição do aprendizado.' })}
                      className="bg-white text-black hover:bg-gray-200 rounded-xl whimsy-hover"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Adicionar Aprendizado
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {draft.learnings?.map((learning: any, index: number) => (
                      <div key={index} className="glass-panel p-8 rounded-3xl border-white/5 relative group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 rounded-l-3xl z-10"></div>
                        
                        <div className="relative z-10">
                          <div className="flex justify-between items-center mb-6">
                            <h4 className="text-xl font-bold text-white font-display">{learning.title}</h4>
                            <button 
                              onClick={() => handleDelete('learnings', index)}
                              className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
                              title="Remover Aprendizado"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-6">
                            <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Título</label>
                              <input type="text" value={learning.title} onChange={e => handleChange('learnings', index, 'title', e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Descrição</label>
                              <textarea value={learning.description} onChange={e => handleChange('learnings', index, 'description', e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white h-24 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all resize-none" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* TESTIMONIALS TAB */}
              {activeTab === 'testimonials' && (
                <motion.div 
                  key="testimonials"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-3xl font-black text-white mb-2 font-display tracking-tight">Depoimentos</h3>
                      <p className="text-muted-foreground">Edite os depoimentos dos alunos.</p>
                    </div>
                    <Button 
                      onClick={() => handleAdd('testimonials', { name: 'Novo Aluno', role: 'Aluno', content: 'Depoimento do aluno.', imageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200' })}
                      className="bg-white text-black hover:bg-gray-200 rounded-xl whimsy-hover"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Adicionar Depoimento
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {draft.testimonials?.map((testimonial: any, index: number) => (
                      <div key={index} className="glass-panel p-8 rounded-3xl border-white/5 relative group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-green-500 rounded-l-3xl z-10"></div>
                        
                        <div className="relative z-10">
                          <div className="flex justify-between items-center mb-6">
                            <h4 className="text-xl font-bold text-white font-display">{testimonial.name}</h4>
                            <button 
                              onClick={() => handleDelete('testimonials', index)}
                              className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
                              title="Remover Depoimento"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nome</label>
                              <input type="text" value={testimonial.name} onChange={e => handleChange('testimonials', index, 'name', e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cargo/Papel</label>
                              <input type="text" value={testimonial.role} onChange={e => handleChange('testimonials', index, 'role', e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all" />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Depoimento</label>
                              <textarea value={testimonial.content} onChange={e => handleChange('testimonials', index, 'content', e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white h-24 focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all resize-none" />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">URL da Foto</label>
                              <input type="text" value={testimonial.imageUrl} onChange={e => handleChange('testimonials', index, 'imageUrl', e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* FAQS TAB */}
              {activeTab === 'faqs' && (
                <motion.div 
                  key="faqs"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-3xl font-black text-white mb-2 font-display tracking-tight">Perguntas Frequentes</h3>
                      <p className="text-muted-foreground">Edite as perguntas e respostas do FAQ.</p>
                    </div>
                    <Button 
                      onClick={() => handleAdd('faqs', { question: 'Nova Pergunta?', answer: 'Nova resposta.' })}
                      className="bg-white text-black hover:bg-gray-200 rounded-xl whimsy-hover"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Adicionar FAQ
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {draft.faqs?.map((faq: any, index: number) => (
                      <div key={index} className="glass-panel p-8 rounded-3xl border-white/5 relative group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-3xl z-10"></div>
                        
                        <div className="relative z-10">
                          <div className="flex justify-between items-center mb-6">
                            <h4 className="text-xl font-bold text-white font-display">{faq.question}</h4>
                            <button 
                              onClick={() => handleDelete('faqs', index)}
                              className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
                              title="Remover FAQ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-6">
                            <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pergunta</label>
                              <input type="text" value={faq.question} onChange={e => handleChange('faqs', index, 'question', e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Resposta</label>
                              <textarea value={faq.answer} onChange={e => handleChange('faqs', index, 'answer', e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white h-24 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all resize-none" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === 'settings' && (
                <motion.div 
                  key="settings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div>
                    <h3 className="text-3xl font-black text-white mb-2 font-display tracking-tight">Configurações do Sistema</h3>
                    <p className="text-muted-foreground">Gerencie chaves de API, integrações e parâmetros globais.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* General Settings */}
                    <div className="glass-panel p-8 md:p-10 rounded-3xl border-white/5">
                      <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                          <Settings className="w-4 h-4" />
                        </div>
                        Geral
                      </h4>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-bold text-gray-300 mb-2">Nome do Site</label>
                          <input 
                            type="text" 
                            value={draft.settings?.siteName || ''}
                            onChange={e => handleSettingChange('siteName', e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-300 mb-2">E-mail de Contato</label>
                          <input 
                            type="email" 
                            value={draft.settings?.contactEmail || ''}
                            onChange={e => handleSettingChange('contactEmail', e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Database Settings */}
                    <div className="glass-panel p-8 md:p-10 rounded-3xl border-white/5">
                      <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                          <Database className="w-4 h-4" />
                        </div>
                        Banco de Dados (Supabase)
                      </h4>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-bold text-gray-300 mb-2">Supabase Project URL</label>
                          <input 
                            type="text" 
                            value={draft.settings?.supabaseUrl || ''}
                            onChange={e => handleSettingChange('supabaseUrl', e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono text-sm"
                            placeholder="https://sua-url.supabase.co"
                          />
                          <p className="text-xs text-muted-foreground mt-2">A URL do seu projeto Supabase. Encontrada em Project Settings &gt; API.</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-bold text-gray-300 mb-2">Supabase Anon Key</label>
                          <input 
                            type="password" 
                            value={draft.settings?.supabaseAnonKey || ''}
                            onChange={e => handleSettingChange('supabaseAnonKey', e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono text-sm"
                            placeholder="eyJh..."
                          />
                          <p className="text-xs text-muted-foreground mt-2">A chave pública anônima. Não insira a chave de serviço (service_role) aqui.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
