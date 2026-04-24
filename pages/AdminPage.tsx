import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  Lock, 
  Plus, 
  Trash2, 
  Save, 
  Bell, 
  BookOpen, 
  User, 
  HeartHandshake, 
  ImageIcon,
  LogOut,
  ChevronRight,
  Monitor,
  FileText,
  HelpCircle,
  Link as LinkIcon,
  Book,
  Calendar,
  ArrowLeft,
  Settings2,
  ExternalLink,
  Sparkles,
  FileSearch,
  Upload,
  Database,
  Github,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  Globe,
  ShieldCheck
} from 'lucide-react';
import { Notice, MaterialData, BatchInfo, GalleryAlbum, Semester, Course, Resource, SocialLink } from '../types';

interface AdminPageProps {
  notices: Notice[];
  setNotices: React.Dispatch<React.SetStateAction<Notice[]>>;
  materialsData: MaterialData;
  setMaterialsData: React.Dispatch<React.SetStateAction<MaterialData>>;
  batchInfo: BatchInfo;
  setBatchInfo: React.Dispatch<React.SetStateAction<BatchInfo>>;
  galleryAlbums: GalleryAlbum[];
  setGalleryAlbums: React.Dispatch<React.SetStateAction<GalleryAlbum[]>>;
  onManualSync: () => Promise<void>;
  isSyncing: boolean;
}

const AdminPage: React.FC<AdminPageProps> = ({ 
  notices, setNotices, materialsData, setMaterialsData, batchInfo, setBatchInfo, galleryAlbums, setGalleryAlbums,
  onManualSync, isSyncing
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('admin_auth') === 'true';
  });
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'notices' | 'materials' | 'crs' | 'donation' | 'gallery' | 'settings'>('notices');
  const [status, setStatus] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [showSqlGuide, setShowSqlGuide] = useState(false);

  const handleManualSync = async () => {
    setSyncStatus(null);
    try {
      await onManualSync();
      setSyncStatus('Successfully synced to cloud');
      setTimeout(() => setSyncStatus(null), 5000);
    } catch (err: any) {
      setSyncStatus(`Error: ${err.message || 'Sync failed'}`);
    }
  };

  const [mPath, setMPath] = useState<{
    category: keyof MaterialData | null;
    batchId: string | null;
    semesterId: string | null;
    examId: string | null;
    courseId: string | null;
  }>({ category: null, batchId: null, semesterId: null, examId: null, courseId: null });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'crcub58') {
      setIsAuthenticated(true);
      localStorage.setItem('admin_auth', 'true');
    } else {
      alert('Incorrect Credentials');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_auth');
  };

  const getDirectImageUrl = (url: string) => {
    if (!url) return '';
    const trimmedUrl = url.trim();
    
    // Google Drive / Docs
    if (trimmedUrl.includes('drive.google.com') || trimmedUrl.includes('docs.google.com')) {
      const id = trimmedUrl.match(/\/d\/([^/?#\s]+)/)?.[1] || trimmedUrl.match(/[?&]id=([^&\s]+)/)?.[1];
      if (id) return `https://drive.google.com/uc?export=view&id=${id}`;
    }
    
    // Imgur
    if (trimmedUrl.includes('imgur.com')) {
      if (trimmedUrl.includes('i.imgur.com')) return trimmedUrl;
      const id = trimmedUrl.split('/').pop()?.split(/[?#]/)[0];
      if (id && id.length > 3) return `https://i.imgur.com/${id}.jpg`;
    }

    // Dropbox
    if (trimmedUrl.includes('dropbox.com')) {
      return trimmedUrl.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace(/\?dl=[01]/, '');
    }

    // Handle iframe/embed code if user accidentally pastes it
    if (trimmedUrl.startsWith('<iframe')) {
      const srcMatch = trimmedUrl.match(/src="([^"]+)"/);
      if (srcMatch) return getDirectImageUrl(srcMatch[1]);
    }

    return trimmedUrl;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File is too large! Please upload an image under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setBatchInfo({ ...batchInfo, heroImage: reader.result as string });
        showStatus('Image Uploaded Successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const showStatus = (msg: string) => {
    setStatus(msg);
    setTimeout(() => setStatus(null), 3000);
  };

  const addNotice = () => {
    const newNotice: Notice = {
      id: Date.now().toString(),
      title: 'Draft Notice',
      date: new Date().toLocaleDateString(),
      description: 'System announcement details...'
    };
    setNotices([newNotice, ...notices]);
  };

  const removeNotice = (id: string) => setNotices(notices.filter(n => n.id !== id));

  const addBatch = () => {
    const newBatch: any = {
      id: Date.now().toString(),
      batchName: 'New Batch',
      semesters: []
    };
    setMaterialsData({ ...materialsData, questionBank: [...materialsData.questionBank, newBatch] });
  };

  const addSemester = () => {
    if (!mPath.category) return;
    const id = Date.now().toString();
    if (mPath.category === 'questionBank') {
      if (!mPath.batchId) return;
      const batches = [...materialsData.questionBank];
      const batch = batches.find(b => b.id === mPath.batchId);
      if (batch) {
        batch.semesters.push({
          id,
          name: 'New Semester',
          exams: [
            { id: id + '_mid', name: 'Mid Exam', courses: [] },
            { id: id + '_final', name: 'Final Exam', courses: [] }
          ]
        });
        setMaterialsData({ ...materialsData, questionBank: batches });
      }
    } else {
      const newSem: Semester = { id, name: 'New Semester', courses: [] };
      setMaterialsData({ ...materialsData, [mPath.category]: [...(materialsData[mPath.category] as Semester[]), newSem] });
    }
  };

  const addCourse = () => {
    if (!mPath.category || !mPath.semesterId) return;
    if (mPath.category === 'questionBank') {
      if (!mPath.batchId || !mPath.examId) return;
      const batches = [...materialsData.questionBank];
      const batch = batches.find(b => b.id === mPath.batchId);
      const sem = batch?.semesters.find(s => s.id === mPath.semesterId);
      const exam = sem?.exams.find(e => e.id === mPath.examId);
      if (exam) {
        exam.courses.push({ id: Date.now().toString(), name: 'New Course', resources: [] });
        setMaterialsData({ ...materialsData, questionBank: batches });
      }
    } else {
      const sems = [...(materialsData[mPath.category] as Semester[])];
      const semIdx = sems.findIndex(s => s.id === mPath.semesterId);
      if (semIdx > -1) {
        sems[semIdx].courses.push({ id: Date.now().toString(), name: 'New Course', resources: [] });
        setMaterialsData({ ...materialsData, [mPath.category]: sems });
      }
    }
  };

  const addResource = () => {
    if (!mPath.category || !mPath.semesterId || !mPath.courseId) return;
    if (mPath.category === 'questionBank') {
      if (!mPath.batchId || !mPath.examId) return;
      const batches = [...materialsData.questionBank];
      const batch = batches.find(b => b.id === mPath.batchId);
      const sem = batch?.semesters.find(s => s.id === mPath.semesterId);
      const exam = sem?.exams.find(e => e.id === mPath.examId);
      const course = exam?.courses.find(c => c.id === mPath.courseId);
      if (course) {
        course.resources.push({ id: `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, type: 'Slide', title: 'New Asset', link: '#' });
        setMaterialsData({ ...materialsData, questionBank: batches });
      }
    } else {
      const sems = [...(materialsData[mPath.category] as Semester[])];
      const sem = sems.find(s => s.id === mPath.semesterId);
      const course = sem?.courses.find(c => c.id === mPath.courseId);
      if (course) {
        course.resources.push({ id: `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, type: 'Slide', title: 'New Asset', link: '#' });
        setMaterialsData({ ...materialsData, [mPath.category]: sems });
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 bg-slate-50">
        <div className="max-w-md w-full bg-slate-900 p-12 rounded-[3.5rem] shadow-2xl border-2 border-emerald-600/30 text-center">
          <div className="w-20 h-20 bg-emerald-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-900/50">
            <Lock size={40} />
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tighter">Command Center</h1>
          <p className="text-emerald-600 font-black uppercase tracking-[0.4em] text-[10px] mb-12">Authorized Personnel Only</p>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <input 
                type="password" placeholder="Passphrase" 
                required
                className="w-full px-8 py-5 bg-white/5 border-2 border-slate-800 rounded-2xl text-center text-white text-2xl tracking-[0.8em] focus:ring-4 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all outline-none"
                value={password} onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button 
              className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-2xl shadow-emerald-900/40 hover:bg-white hover:text-slate-900 transition-all text-sm uppercase tracking-widest"
            >
              Authorize Access
            </button>
          </form>
          <p className="mt-8 text-slate-500 text-[9px] font-bold uppercase tracking-[0.1em] leading-relaxed">
            Note: System access is restricted to verified batch administrators.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Top Fixed Navigation */}
      <div className="bg-slate-900 border-b-4 border-emerald-600 sticky top-16 z-40 px-4 shadow-2xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar py-4 gap-4">
          <div className="flex items-center gap-2">
            <TabBtn active={activeTab === 'notices'} onClick={() => setActiveTab('notices')} icon={<Bell size={18}/>} label="Notices" />
            <TabBtn active={activeTab === 'materials'} onClick={() => setActiveTab('materials')} icon={<BookOpen size={18}/>} label="Materials" />
            <TabBtn active={activeTab === 'crs'} onClick={() => setActiveTab('crs')} icon={<User size={18}/>} label="CR Profiles" />
            <TabBtn active={activeTab === 'donation'} onClick={() => setActiveTab('donation')} icon={<HeartHandshake size={18}/>} label="Donation" />
            <TabBtn active={activeTab === 'gallery'} onClick={() => setActiveTab('gallery')} icon={<ImageIcon size={18}/>} label="Gallery" />
            <TabBtn active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings2 size={18}/>} label="Settings" />
          </div>
          <button onClick={handleLogout} className="p-3 bg-red-600/10 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all group flex items-center gap-2">
            <LogOut size={24}/>
            <span className="hidden group-hover:block text-[10px] font-black uppercase tracking-widest pr-2">Logout</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-4xl font-black text-slate-900 capitalize tracking-tighter leading-none">{activeTab}</h2>
            <p className="text-emerald-600 text-[11px] font-black uppercase tracking-[0.5em] mt-3 block">Operational Access Control</p>
          </div>
          {status && <div className="bg-emerald-600 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest animate-in fade-in zoom-in shadow-xl shadow-emerald-200">{status}</div>}
        </div>

        {/* NOTICES TAB */}
        {activeTab === 'notices' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button onClick={addNotice} className="w-full py-6 border-4 border-dashed border-emerald-600/10 rounded-[2.5rem] text-emerald-600 font-black flex items-center justify-center gap-3 hover:bg-emerald-50 hover:border-emerald-600 transition-all text-lg uppercase tracking-widest">
              <Plus size={28}/> Deploy Notice
            </button>
            {notices.map(n => (
              <div key={n.id} className="bg-slate-50 p-6 md:p-8 rounded-[2.5rem] md:rounded-[3.5rem] border-2 border-slate-100 shadow-sm space-y-6 group hover:border-emerald-600/30 transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                  <input 
                    className="text-xl md:text-2xl font-black bg-transparent border-none flex-grow focus:ring-0 text-slate-900 tracking-tight" 
                    value={n.title} 
                    onChange={e => setNotices(notices.map(x => x.id === n.id ? { ...x, title: e.target.value } : x))} 
                  />
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setNotices(notices.map(x => x.id === n.id ? { ...x, isImportant: !x.isImportant } : x))}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-sm ${n.isImportant ? 'bg-emerald-600 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}
                    >
                      Priority
                    </button>
                    <button onClick={() => removeNotice(n.id)} className="p-3 bg-white text-slate-200 hover:text-emerald-600 rounded-xl transition-all shadow-sm"><Trash2 size={24}/></button>
                  </div>
                </div>
                <textarea 
                  className="w-full bg-white rounded-2xl p-6 border-2 border-slate-100 text-base font-bold text-slate-600 focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600 outline-none transition-all" 
                  value={n.description} 
                  rows={4}
                  onChange={e => setNotices(notices.map(x => x.id === n.id ? { ...x, description: e.target.value } : x))} 
                />
              </div>
            ))}
          </div>
        )}

        {/* MATERIALS TAB */}
        {activeTab === 'materials' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Category Breadcrumbs */}
            {mPath.category && (
              <div className="flex items-center justify-between mb-6 bg-slate-900 p-4 md:p-5 rounded-2xl border-2 border-emerald-600/30 shadow-2xl">
                <div className="flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-slate-500 overflow-hidden">
                   <button onClick={() => setMPath({category:null, batchId:null, semesterId:null, examId:null, courseId:null})} className="hover:text-emerald-600 transition-colors whitespace-nowrap">Repos</button>
                   {mPath.category && <><ChevronRight size={14} className="text-emerald-600/30 shrink-0"/> <button onClick={() => setMPath({...mPath, batchId:null, semesterId:null, examId:null, courseId:null})} className="text-white truncate max-w-[80px] md:max-w-none">{mPath.category}</button></>}
                   {mPath.batchId && <><ChevronRight size={14} className="text-emerald-600/30 shrink-0"/> <button onClick={() => setMPath({...mPath, semesterId:null, examId:null, courseId:null})} className="text-white truncate max-w-[80px] md:max-w-none">Batch</button></>}
                   {mPath.semesterId && <><ChevronRight size={14} className="text-emerald-600/30 shrink-0"/> <button onClick={() => setMPath({...mPath, examId:null, courseId:null})} className="text-white truncate max-w-[80px] md:max-w-none">Semester</button></>}
                   {mPath.examId && <><ChevronRight size={14} className="text-emerald-600/30 shrink-0"/> <button onClick={() => setMPath({...mPath, courseId:null})} className="text-white truncate max-w-[80px] md:max-w-none">Exam</button></>}
                </div>
                <button 
                  onClick={() => {
                    if (mPath.courseId) setMPath({...mPath, courseId: null});
                    else if (mPath.examId) setMPath({...mPath, examId: null});
                    else if (mPath.semesterId) setMPath({...mPath, semesterId: null});
                    else if (mPath.batchId) setMPath({...mPath, batchId: null});
                    else setMPath({category:null, batchId:null, semesterId:null, examId:null, courseId:null});
                  }}
                  className="text-[10px] font-black text-emerald-600 flex items-center gap-2 uppercase tracking-widest shrink-0"
                >
                  <ArrowLeft size={16}/> Back
                </button>
              </div>
            )}

            {!mPath.category && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <CategoryPick title="Section A" icon="A" onClick={() => setMPath({...mPath, category: 'sectionA'})} />
                <CategoryPick title="Section B" icon="B" onClick={() => setMPath({...mPath, category: 'sectionB'})} />
                <CategoryPick title="Question Bank" icon={<HelpCircle size={24}/>} onClick={() => setMPath({...mPath, category: 'questionBank'})} />
                <CategoryPick title="External Links" icon={<LinkIcon size={24}/>} onClick={() => setMPath({...mPath, category: 'specialLinks'})} />
              </div>
            )}

            {/* QUESTION BANK MANAGEMENT */}
            {mPath.category === 'questionBank' && (
              <div className="space-y-6">
                {/* STAGE 1: BATCHES */}
                {!mPath.batchId && (
                  <div className="space-y-4">
                    <button onClick={addBatch} className="w-full py-6 border-4 border-dashed border-emerald-600/10 rounded-3xl text-emerald-600 font-black uppercase tracking-widest text-sm hover:bg-emerald-50 transition-all">
                       Add Batch (e.g. 58)
                    </button>
                    {materialsData.questionBank.map(batch => (
                      <div key={batch.id} className="bg-white p-4 md:p-6 rounded-[2rem] border-2 border-slate-100 flex items-center justify-between group hover:border-emerald-600 transition-all shadow-sm">
                        <div className="flex items-center gap-4 md:gap-5 flex-grow">
                          <div className="p-3 md:p-4 bg-slate-900 text-emerald-600 rounded-2xl shadow-xl shrink-0"><Sparkles size={20}/></div>
                          <input 
                            className="font-black text-slate-900 bg-transparent border-none focus:ring-0 text-lg md:text-xl tracking-tight w-full" 
                            value={batch.batchName} 
                            onChange={e => {
                              const batches = [...materialsData.questionBank];
                              const b = batches.find(x => x.id === batch.id);
                              if (b) b.batchName = e.target.value;
                              setMaterialsData({...materialsData, questionBank: batches});
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-2 md:gap-3 shrink-0">
                          <button onClick={() => setMPath({...mPath, batchId: batch.id})} className="p-2 md:p-3 bg-slate-50 text-slate-400 hover:text-emerald-600 rounded-xl transition-all"><Settings2 size={18}/></button>
                          <button onClick={() => {
                            const batches = materialsData.questionBank.filter(x => x.id !== batch.id);
                            setMaterialsData({...materialsData, questionBank: batches});
                          }} className="p-2 md:p-3 text-slate-200 hover:text-emerald-600"><Trash2 size={18}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* STAGE 2: SEMESTERS */}
                {mPath.batchId && !mPath.semesterId && (
                  <div className="space-y-4">
                    <button onClick={addSemester} className="w-full py-6 border-4 border-dashed border-emerald-600/10 rounded-3xl text-emerald-600 font-black uppercase tracking-widest text-sm hover:bg-emerald-50 transition-all">
                       Add Semester
                    </button>
                    {materialsData.questionBank.find(b => b.id === mPath.batchId)?.semesters.map(sem => (
                      <div key={sem.id} className="bg-white p-4 md:p-6 rounded-[2rem] border-2 border-slate-100 flex items-center justify-between group hover:border-emerald-600 transition-all shadow-sm">
                        <div className="flex items-center gap-4 md:gap-5 flex-grow">
                          <div className="p-3 md:p-4 bg-slate-900 text-emerald-600 rounded-2xl shadow-xl shrink-0"><Calendar size={20}/></div>
                          <input 
                            className="font-black text-slate-900 bg-transparent border-none focus:ring-0 text-lg md:text-xl tracking-tight w-full" 
                            value={sem.name} 
                            onChange={e => {
                              const batches = [...materialsData.questionBank];
                              const batch = batches.find(x => x.id === mPath.batchId);
                              const s = batch?.semesters.find(x => x.id === sem.id);
                              if (s) s.name = e.target.value;
                              setMaterialsData({...materialsData, questionBank: batches});
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-2 md:gap-3 shrink-0">
                          <button onClick={() => setMPath({...mPath, semesterId: sem.id})} className="p-2 md:p-3 bg-slate-50 text-slate-400 hover:text-emerald-600 rounded-xl transition-all"><Settings2 size={18}/></button>
                          <button onClick={() => {
                            const batches = [...materialsData.questionBank];
                            const batch = batches.find(x => x.id === mPath.batchId);
                            if (batch) batch.semesters = batch.semesters.filter(x => x.id !== sem.id);
                            setMaterialsData({...materialsData, questionBank: batches});
                          }} className="p-2 md:p-3 text-slate-200 hover:text-emerald-600"><Trash2 size={18}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* STAGE 3: EXAM TYPES */}
                {mPath.batchId && mPath.semesterId && !mPath.examId && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {materialsData.questionBank.find(b => b.id === mPath.batchId)?.semesters.find(s => s.id === mPath.semesterId)?.exams.map(exam => (
                      <button 
                        key={exam.id}
                        onClick={() => setMPath({...mPath, examId: exam.id})}
                        className="bg-white p-8 rounded-[2rem] border-2 border-slate-100 flex items-center gap-6 group hover:border-emerald-600 transition-all shadow-sm"
                      >
                        <div className="w-14 h-14 bg-slate-900 text-emerald-600 rounded-xl flex items-center justify-center shadow-lg"><FileSearch size={24}/></div>
                        <div className="text-left">
                          <h4 className="font-black text-slate-900 text-lg">{exam.name}</h4>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{exam.courses.length} Courses</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* STAGE 4: COURSES */}
                {mPath.batchId && mPath.semesterId && mPath.examId && !mPath.courseId && (
                  <div className="space-y-4">
                    <button onClick={addCourse} className="w-full py-6 border-4 border-dashed border-emerald-600/10 rounded-3xl text-emerald-600 font-black uppercase tracking-widest text-sm hover:bg-emerald-50 transition-all">
                       Add Course Module
                    </button>
                    {materialsData.questionBank.find(b => b.id === mPath.batchId)?.semesters.find(s => s.id === mPath.semesterId)?.exams.find(e => e.id === mPath.examId)?.courses.map(course => (
                      <div key={course.id} className="bg-white p-4 md:p-6 rounded-[2rem] border-2 border-slate-100 flex items-center justify-between group hover:border-emerald-600 transition-all shadow-sm">
                        <div className="flex items-center gap-4 md:gap-5 flex-grow">
                          <div className="p-3 md:p-4 bg-slate-900 text-emerald-600 rounded-2xl shadow-xl shrink-0"><Book size={20}/></div>
                          <input 
                            className="font-black text-slate-900 bg-transparent border-none focus:ring-0 text-lg md:text-xl tracking-tight w-full" 
                            value={course.name} 
                            onChange={e => {
                              const batches = [...materialsData.questionBank];
                              const batch = batches.find(x => x.id === mPath.batchId);
                              const sem = batch?.semesters.find(x => x.id === mPath.semesterId);
                              const exam = sem?.exams.find(x => x.id === mPath.examId);
                              const c = exam?.courses.find(x => x.id === course.id);
                              if (c) c.name = e.target.value;
                              setMaterialsData({...materialsData, questionBank: batches});
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-2 md:gap-3 shrink-0">
                          <button onClick={() => setMPath({...mPath, courseId: course.id})} className="p-2 md:p-3 bg-slate-50 text-slate-400 hover:text-emerald-600 rounded-xl transition-all"><Settings2 size={18}/></button>
                          <button onClick={() => {
                            const batches = [...materialsData.questionBank];
                            const batch = batches.find(x => x.id === mPath.batchId);
                            const sem = batch?.semesters.find(x => x.id === mPath.semesterId);
                            const exam = sem?.exams.find(x => x.id === mPath.examId);
                            if (exam) exam.courses = exam.courses.filter(x => x.id !== course.id);
                            setMaterialsData({...materialsData, questionBank: batches});
                          }} className="p-2 md:p-3 text-slate-200 hover:text-emerald-600"><Trash2 size={18}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* STAGE 5: RESOURCES */}
                {mPath.batchId && mPath.semesterId && mPath.examId && mPath.courseId && (
                  <div className="space-y-4">
                    <button onClick={addResource} className="w-full py-6 border-4 border-dashed border-emerald-600/10 rounded-3xl text-emerald-600 font-black uppercase tracking-widest text-sm hover:bg-emerald-50 transition-all">
                       Add Resource Asset
                    </button>
                    {materialsData.questionBank.find(b => b.id === mPath.batchId)?.semesters.find(s => s.id === mPath.semesterId)?.exams.find(e => e.id === mPath.examId)?.courses.find(c => c.id === mPath.courseId)?.resources.map(res => (
                      <div key={res.id} className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 space-y-4 group hover:border-emerald-600 transition-all shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <select 
                              className="bg-slate-900 text-emerald-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border-none focus:ring-0"
                              value={res.type}
                              onChange={e => {
                                const batches = [...materialsData.questionBank];
                                const batch = batches.find(x => x.id === mPath.batchId);
                                const sem = batch?.semesters.find(x => x.id === mPath.semesterId);
                                const exam = sem?.exams.find(x => x.id === mPath.examId);
                                const course = exam?.courses.find(x => x.id === mPath.courseId);
                                const r = course?.resources.find(x => x.id === res.id);
                                if (r) r.type = e.target.value as any;
                                setMaterialsData({...materialsData, questionBank: batches});
                              }}
                            >
                              <option value="Slide">Slide</option>
                              <option value="PDF">PDF</option>
                            </select>
                          </div>
                          <button onClick={() => {
                            const batches = [...materialsData.questionBank];
                            const batch = batches.find(x => x.id === mPath.batchId);
                            const sem = batch?.semesters.find(x => x.id === mPath.semesterId);
                            const exam = sem?.exams.find(x => x.id === mPath.examId);
                            const course = exam?.courses.find(x => x.id === mPath.courseId);
                            if (course) course.resources = course.resources.filter(x => x.id !== res.id);
                            setMaterialsData({...materialsData, questionBank: batches});
                          }} className="p-2 text-slate-200 hover:text-emerald-600"><Trash2 size={18}/></button>
                        </div>
                        <input 
                          className="w-full font-bold text-slate-900 bg-slate-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-emerald-600/20" 
                          value={res.title} 
                          placeholder="Resource Title"
                          onChange={e => {
                            const batches = [...materialsData.questionBank];
                            const batch = batches.find(x => x.id === mPath.batchId);
                            const sem = batch?.semesters.find(x => x.id === mPath.semesterId);
                            const exam = sem?.exams.find(x => x.id === mPath.examId);
                            const course = exam?.courses.find(x => x.id === mPath.courseId);
                            const r = course?.resources.find(x => x.id === res.id);
                            if (r) r.title = e.target.value;
                            setMaterialsData({...materialsData, questionBank: batches});
                          }}
                        />
                        <input 
                          className="w-full text-xs font-mono text-slate-400 bg-slate-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-emerald-600/20" 
                          value={res.link} 
                          placeholder="Direct Link"
                          onChange={e => {
                            const batches = [...materialsData.questionBank];
                            const batch = batches.find(x => x.id === mPath.batchId);
                            const sem = batch?.semesters.find(x => x.id === mPath.semesterId);
                            const exam = sem?.exams.find(x => x.id === mPath.examId);
                            const course = exam?.courses.find(x => x.id === mPath.courseId);
                            const r = course?.resources.find(x => x.id === res.id);
                            if (r) r.link = e.target.value;
                            setMaterialsData({...materialsData, questionBank: batches});
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STANDARD SECTIONS MANAGEMENT */}
            {mPath.category && mPath.category !== 'specialLinks' && mPath.category !== 'questionBank' && (
              <div className="space-y-6">
                {/* STAGE 1: SEMESTERS */}
                {!mPath.semesterId && (
                  <div className="space-y-4">
                    <button onClick={addSemester} className="w-full py-6 border-4 border-dashed border-emerald-600/10 rounded-3xl text-emerald-600 font-black uppercase tracking-widest text-sm hover:bg-emerald-50 transition-all">
                       Add Semester Tier
                    </button>
                    {(materialsData[mPath.category] as Semester[]).map(sem => (
                      <div key={sem.id} className="bg-white p-4 md:p-6 rounded-[2rem] border-2 border-slate-100 flex items-center justify-between group hover:border-emerald-600 transition-all shadow-sm">
                        <div className="flex items-center gap-4 md:gap-5 flex-grow">
                          <div className="p-3 md:p-4 bg-slate-900 text-emerald-600 rounded-2xl shadow-xl shrink-0"><Calendar size={20}/></div>
                          <input 
                            className="font-black text-slate-900 bg-transparent border-none focus:ring-0 text-lg md:text-xl tracking-tight w-full" 
                            value={sem.name} 
                            onChange={e => {
                              const sems = [...(materialsData[mPath.category!] as Semester[])];
                              const s = sems.find(x => x.id === sem.id);
                              if (s) s.name = e.target.value;
                              setMaterialsData({...materialsData, [mPath.category!]: sems});
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-2 md:gap-3 shrink-0">
                          <button onClick={() => setMPath({...mPath, semesterId: sem.id})} className="p-2 md:p-3 bg-slate-50 text-slate-400 hover:text-emerald-600 rounded-xl transition-all"><Settings2 size={18}/></button>
                          <button onClick={() => {
                            const sems = (materialsData[mPath.category!] as Semester[]).filter(x => x.id !== sem.id);
                            setMaterialsData({...materialsData, [mPath.category!]: sems});
                          }} className="p-2 md:p-3 text-slate-200 hover:text-emerald-600"><Trash2 size={18}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* STAGE 2: COURSES */}
                {mPath.semesterId && !mPath.courseId && (
                  <div className="space-y-4">
                    <button onClick={addCourse} className="w-full py-6 border-4 border-dashed border-emerald-600/10 rounded-3xl text-emerald-600 font-black uppercase tracking-widest text-sm hover:bg-emerald-50 transition-all">
                       Add Course Module
                    </button>
                    {(materialsData[mPath.category] as Semester[]).find(s => s.id === mPath.semesterId)?.courses.map(course => (
                      <div key={course.id} className="bg-white p-4 md:p-6 rounded-[2rem] border-2 border-slate-100 flex items-center justify-between group hover:border-emerald-600 transition-all shadow-sm">
                        <div className="flex items-center gap-4 md:gap-5 flex-grow">
                          <div className="p-3 md:p-4 bg-slate-900 text-emerald-600 rounded-2xl shadow-xl shrink-0"><Book size={20}/></div>
                          <input 
                            className="font-black text-slate-900 bg-transparent border-none focus:ring-0 text-lg md:text-xl tracking-tight w-full" 
                            value={course.name} 
                            onChange={e => {
                              const sems = [...(materialsData[mPath.category!] as Semester[])];
                              const sem = sems.find(x => x.id === mPath.semesterId);
                              const c = sem?.courses.find(x => x.id === course.id);
                              if (c) c.name = e.target.value;
                              setMaterialsData({...materialsData, [mPath.category!]: sems});
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-2 md:gap-3 shrink-0">
                          <button onClick={() => setMPath({...mPath, courseId: course.id})} className="p-2 md:p-3 bg-slate-50 text-slate-400 hover:text-emerald-600 rounded-xl transition-all"><Settings2 size={18}/></button>
                          <button onClick={() => {
                            const sems = [...(materialsData[mPath.category!] as Semester[])];
                            const sem = sems.find(x => x.id === mPath.semesterId);
                            if (sem) sem.courses = sem.courses.filter(x => x.id !== course.id);
                            setMaterialsData({...materialsData, [mPath.category!]: sems});
                          }} className="p-2 md:p-3 text-slate-200 hover:text-emerald-600"><Trash2 size={18}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* STAGE 3: RESOURCES */}
                {mPath.semesterId && mPath.courseId && (
                  <div className="space-y-4">
                    <button onClick={addResource} className="w-full py-6 border-4 border-dashed border-emerald-600/10 rounded-3xl text-emerald-600 font-black uppercase tracking-widest text-sm hover:bg-emerald-50 transition-all">
                       Add Resource Asset
                    </button>
                    {(materialsData[mPath.category] as Semester[]).find(s => s.id === mPath.semesterId)?.courses.find(c => c.id === mPath.courseId)?.resources.map(res => (
                      <div key={res.id} className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 space-y-4 group hover:border-emerald-600 transition-all shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <select 
                              className="bg-slate-900 text-emerald-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border-none focus:ring-0"
                              value={res.type}
                              onChange={e => {
                                const sems = [...(materialsData[mPath.category!] as Semester[])];
                                const sem = sems.find(x => x.id === mPath.semesterId);
                                const course = sem?.courses.find(x => x.id === mPath.courseId);
                                const r = course?.resources.find(x => x.id === res.id);
                                if (r) r.type = e.target.value as any;
                                setMaterialsData({...materialsData, [mPath.category!]: sems});
                              }}
                            >
                              <option value="Slide">Slide</option>
                              <option value="PDF">PDF</option>
                            </select>
                          </div>
                          <button onClick={() => {
                            const sems = [...(materialsData[mPath.category!] as Semester[])];
                            const sem = sems.find(x => x.id === mPath.semesterId);
                            const course = sem?.courses.find(x => x.id === mPath.courseId);
                            if (course) course.resources = course.resources.filter(x => x.id !== res.id);
                            setMaterialsData({...materialsData, [mPath.category!]: sems});
                          }} className="p-2 text-slate-200 hover:text-emerald-600"><Trash2 size={18}/></button>
                        </div>
                        <input 
                          className="w-full font-bold text-slate-900 bg-slate-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-emerald-600/20" 
                          value={res.title} 
                          placeholder="Resource Title"
                          onChange={e => {
                            const sems = [...(materialsData[mPath.category!] as Semester[])];
                            const sem = sems.find(x => x.id === mPath.semesterId);
                            const course = sem?.courses.find(x => x.id === mPath.courseId);
                            const r = course?.resources.find(x => x.id === res.id);
                            if (r) r.title = e.target.value;
                            setMaterialsData({...materialsData, [mPath.category!]: sems});
                          }}
                        />
                        <input 
                          className="w-full text-xs font-mono text-slate-400 bg-slate-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-emerald-600/20" 
                          value={res.link} 
                          placeholder="Direct Link"
                          onChange={e => {
                            const sems = [...(materialsData[mPath.category!] as Semester[])];
                            const sem = sems.find(x => x.id === mPath.semesterId);
                            const course = sem?.courses.find(x => x.id === mPath.courseId);
                            const r = course?.resources.find(x => x.id === res.id);
                            if (r) r.link = e.target.value;
                            setMaterialsData({...materialsData, [mPath.category!]: sems});
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {mPath.category === 'specialLinks' && (
              <div className="space-y-4">
                <button 
                  onClick={() => {
                    const links = [...(materialsData.specialLinks as Resource[])];
                    links.push({ id: Date.now().toString(), type: 'Link', title: 'New Link', link: '#' });
                    setMaterialsData({...materialsData, specialLinks: links});
                  }} 
                  className="w-full py-6 border-4 border-dashed border-emerald-600/10 rounded-3xl text-emerald-600 font-black uppercase tracking-widest text-sm hover:bg-emerald-50 transition-all"
                >
                   Add External Link
                </button>
                {(materialsData.specialLinks as Resource[]).map(res => (
                  <div key={res.id} className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 space-y-4 group hover:border-emerald-600 transition-all shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="p-3 bg-slate-900 text-emerald-600 rounded-xl"><LinkIcon size={20}/></div>
                      <button onClick={() => {
                        const links = (materialsData.specialLinks as Resource[]).filter(x => x.id !== res.id);
                        setMaterialsData({...materialsData, specialLinks: links});
                      }} className="p-2 text-slate-200 hover:text-emerald-600"><Trash2 size={18}/></button>
                    </div>
                    <input 
                      className="w-full font-bold text-slate-900 bg-slate-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-emerald-600/20" 
                      value={res.title} 
                      onChange={e => {
                        const links = [...(materialsData.specialLinks as Resource[])];
                        const r = links.find(x => x.id === res.id);
                        if (r) r.title = e.target.value;
                        setMaterialsData({...materialsData, specialLinks: links});
                      }}
                    />
                    <input 
                      className="w-full text-xs font-mono text-slate-400 bg-slate-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-emerald-600/20" 
                      value={res.link} 
                      onChange={e => {
                        const links = [...(materialsData.specialLinks as Resource[])];
                        const r = links.find(x => x.id === res.id);
                        if (r) r.link = e.target.value;
                        setMaterialsData({...materialsData, specialLinks: links});
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROFILES TAB */}
        {activeTab === 'crs' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900 p-8 rounded-[3rem] border-2 border-emerald-600/20 shadow-2xl space-y-8">
              <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                <User className="text-emerald-600" /> Batch Representatives
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {batchInfo.crs.map((cr, idx) => (
                  <div key={idx} className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-4">
                    <InputGroup 
                      label="Full Name" 
                      val={cr.name} 
                      onChange={(v: string) => {
                        const newCrs = [...batchInfo.crs];
                        newCrs[idx].name = v;
                        setBatchInfo({...batchInfo, crs: newCrs});
                      }} 
                    />
                    <InputGroup 
                      label="Contact Info" 
                      val={cr.contact} 
                      onChange={(v: string) => {
                        const newCrs = [...batchInfo.crs];
                        newCrs[idx].contact = v;
                        setBatchInfo({...batchInfo, crs: newCrs});
                      }} 
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FUNDING TAB */}
        {activeTab === 'donation' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900 p-8 rounded-[3rem] border-2 border-emerald-600/20 shadow-2xl space-y-8">
              <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                <HeartHandshake className="text-emerald-600" /> Financial Management
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup 
                  label="Target Amount" 
                  val={batchInfo.donation.target.toString()} 
                  onChange={(v: string) => setBatchInfo({...batchInfo, donation: {...batchInfo.donation, target: parseInt(v) || 0}})} 
                />
                <InputGroup 
                  label="Current Balance" 
                  val={batchInfo.donation.current.toString()} 
                  onChange={(v: string) => setBatchInfo({...batchInfo, donation: {...batchInfo.donation, current: parseInt(v) || 0}})} 
                />
              </div>
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] ml-1">Payment Methods</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-4">
                    <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center text-white font-black text-xs">B</div>
                    <input 
                      className="bg-transparent border-none focus:ring-0 text-white font-bold w-full" 
                      value={batchInfo.donation.bkash} 
                      onChange={e => setBatchInfo({...batchInfo, donation: {...batchInfo.donation, bkash: e.target.value}})}
                    />
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center text-white font-black text-xs">N</div>
                    <input 
                      className="bg-transparent border-none focus:ring-0 text-white font-bold w-full" 
                      value={batchInfo.donation.nagad} 
                      onChange={e => setBatchInfo({...batchInfo, donation: {...batchInfo.donation, nagad: e.target.value}})}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] ml-1">Welfare Message</label>
                <textarea 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white font-medium focus:ring-2 focus:ring-emerald-600/20 outline-none transition-all"
                  rows={3}
                  value={batchInfo.donation.message}
                  onChange={e => setBatchInfo({...batchInfo, donation: {...batchInfo.donation, message: e.target.value}})}
                />
              </div>
            </div>
          </div>
        )}

        {/* MEDIA TAB */}
        {activeTab === 'gallery' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button 
              onClick={() => {
                const newAlbum: GalleryAlbum = { id: Date.now().toString(), category: 'New Album', images: [] };
                setGalleryAlbums([newAlbum, ...galleryAlbums]);
              }} 
              className="w-full py-6 border-4 border-dashed border-emerald-600/10 rounded-[2.5rem] text-emerald-600 font-black flex items-center justify-center gap-3 hover:bg-emerald-50 hover:border-emerald-600 transition-all text-lg uppercase tracking-widest"
            >
              <Plus size={28}/> Create Album
            </button>
            {galleryAlbums.map(album => (
              <div key={album.id} className="bg-slate-50 p-8 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-6 group hover:border-emerald-600/30 transition-all">
                <div className="flex items-center justify-between gap-6">
                  <input 
                    className="text-2xl font-black bg-transparent border-none flex-grow focus:ring-0 text-slate-900 tracking-tight" 
                    value={album.category} 
                    onChange={e => setGalleryAlbums(galleryAlbums.map(x => x.id === album.id ? { ...x, category: e.target.value } : x))} 
                  />
                  <button onClick={() => setGalleryAlbums(galleryAlbums.filter(x => x.id !== album.id))} className="p-3 bg-white text-slate-200 hover:text-emerald-600 rounded-xl transition-all shadow-sm"><Trash2 size={24}/></button>
                </div>
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] ml-1">Image URLs (One per line)</label>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <textarea 
                        className="w-full bg-white rounded-2xl p-6 border-2 border-slate-100 text-sm font-mono text-slate-600 focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600 outline-none transition-all" 
                        value={album.images.join('\n')} 
                        rows={10}
                        placeholder="https://example.com/image1.jpg"
                        onChange={e => setGalleryAlbums(galleryAlbums.map(x => x.id === album.id ? { ...x, images: e.target.value.split('\n') } : x))} 
                      />
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setGalleryAlbums(galleryAlbums.map(x => x.id === album.id ? { ...x, images: [] } : x))}
                          className="px-4 py-2 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-red-50 hover:text-red-600 transition-all"
                        >
                          Clear All
                        </button>
                        <p className="text-[10px] text-slate-400 font-medium italic">
                          Tip: Paste direct links or Google Drive links.
                        </p>
                      </div>
                    </div>
                    
                    {/* Live Preview Grid */}
                    <div className="bg-white rounded-2xl p-4 border-2 border-slate-100 overflow-y-auto max-h-[300px] no-scrollbar">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-4">Live Preview ({album.images.filter(i => i.trim()).length})</p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {album.images.filter(i => i.trim()).map((img, idx) => (
                          <div key={idx} className="aspect-square rounded-lg bg-slate-50 border border-slate-100 overflow-hidden relative group">
                            <img 
                              src={getDirectImageUrl(img)} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Error';
                              }}
                            />
                            <div className="absolute inset-0 bg-red-600/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button 
                                onClick={() => {
                                  const newImages = [...album.images];
                                  newImages.splice(idx, 1);
                                  setGalleryAlbums(galleryAlbums.map(x => x.id === album.id ? { ...x, images: newImages } : x));
                                }}
                                className="text-white"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                        {album.images.filter(i => i.trim()).length === 0 && (
                          <div className="col-span-full py-10 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest">
                            No Images to preview
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900 p-8 rounded-[3rem] border-2 border-emerald-600/20 shadow-2xl space-y-8">
              <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                <Settings2 className="text-emerald-600" /> General Batch Settings
              </h3>
              <div className="space-y-6">
                <div className="relative group">
                  <InputGroup 
                    label="Hero Background Image URL" 
                    val={batchInfo.heroImage || ''} 
                    onChange={(v: string) => setBatchInfo({...batchInfo, heroImage: v})} 
                  />
                  <div className="absolute right-4 bottom-4 flex items-center gap-2">
                    <label className="p-2 text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer" title="Upload Image">
                      <Upload size={18} />
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </label>
                    {batchInfo.heroImage && (
                      <button 
                        onClick={() => setBatchInfo({...batchInfo, heroImage: ''})}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        title="Clear Image"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 font-medium px-1 italic">
                  Tip: You can use links from Google Drive, Imgur, or Dropbox. We'll automatically try to convert them to direct links for you!
                  <br />
                  <span className="text-amber-500 font-bold">Important:</span> For Google Drive, make sure the file is set to <span className="underline">"Anyone with the link can view"</span>.
                </p>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3">Preview</p>
                  <div className="aspect-video rounded-xl overflow-hidden bg-slate-800 border border-white/10 relative">
                    {batchInfo.heroImage ? (
                      <img 
                        src={batchInfo.heroImage} 
                        alt="Hero Preview" 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          const parent = (e.target as HTMLImageElement).parentElement;
                          if (parent) {
                            const errorDiv = document.createElement('div');
                            errorDiv.className = "w-full h-full flex items-center justify-center text-red-400 font-bold text-xs text-center p-4";
                            errorDiv.innerText = "Invalid Image Link or Access Denied. Please ensure the link is public.";
                            parent.appendChild(errorDiv);
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20 font-black uppercase tracking-widest text-xs">No Image Provided</div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative group">
                    <InputGroup 
                      label="Website Logo (Text or URL)" 
                      val={batchInfo.logo || ''} 
                      onChange={(v: string) => setBatchInfo({...batchInfo, logo: v})} 
                    />
                    <div className="absolute right-4 bottom-4 flex items-center gap-2">
                      <label className="p-2 text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer" title="Upload Logo">
                        <Upload size={18} />
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              setBatchInfo({...batchInfo, logo: ev.target?.result as string});
                            };
                            reader.readAsDataURL(file);
                          }
                        }} />
                      </label>
                    </div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold overflow-hidden shadow-lg">
                      {batchInfo.logo && (batchInfo.logo.startsWith('http') || batchInfo.logo.startsWith('data:')) ? (
                        <img src={batchInfo.logo} alt="Logo Preview" className="w-full h-full object-cover" />
                      ) : (
                        batchInfo.logo || 'S'
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Logo Preview</p>
                      <p className="text-[9px] text-slate-500 font-medium">Appears in navbar and footer</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup 
                    label="Batch Name" 
                    val={batchInfo.name} 
                    onChange={(v: string) => setBatchInfo({...batchInfo, name: v})} 
                  />
                  <InputGroup 
                    label="Tagline" 
                    val={batchInfo.tagline} 
                    onChange={(v: string) => setBatchInfo({...batchInfo, tagline: v})} 
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] ml-1">About Batch (Full Description)</label>
                  <textarea 
                    className="w-full p-6 bg-slate-50 rounded-[2rem] border-2 border-transparent font-bold text-slate-900 text-base focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600 outline-none transition-all min-h-[150px] resize-y"
                    value={batchInfo.about || ''}
                    onChange={(e) => setBatchInfo({...batchInfo, about: e.target.value})}
                    placeholder="Tell the world about Textile Batch 58..."
                  />
                  <p className="text-[9px] text-slate-500 font-medium px-2 italic">Detailed information about the batch displayed on the contact page.</p>
                </div>

                <div className="bg-slate-900 p-8 rounded-3xl border border-emerald-600/20 space-y-6">
                  <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                    <Lock size={14} /> Question Bank Security
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Edit Mode Passphrase</label>
                      <input 
                        type="text"
                        className="w-full p-4 bg-white/5 rounded-xl border border-white/10 text-white text-lg font-black tracking-[0.3em] outline-none focus:border-emerald-600 transition-all text-center" 
                        value={materialsData.qbPassword || 'cr123'} 
                        onChange={e => setMaterialsData({...materialsData, qbPassword: e.target.value})} 
                      />
                    </div>
                    <div className="p-4 bg-emerald-600/10 rounded-2xl border border-emerald-600/20">
                      <p className="text-[10px] text-emerald-500 font-medium leading-relaxed italic">
                        This passphrase allows CRs to enter "Edit Mode" directly on the Question Bank page without accessing this full panel.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-8">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                      <LinkIcon size={14} /> Social Connectivity
                    </h4>
                    <button 
                      onClick={() => {
                        const newLink: SocialLink = { id: Date.now().toString(), name: 'New Link', url: '', iconType: 'globe' };
                        setBatchInfo({...batchInfo, socialLinks: [...batchInfo.socialLinks, newLink]});
                      }}
                      className="px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-white hover:text-slate-900 transition-all shadow-lg shadow-emerald-900/20"
                    >
                      Add Platform
                    </button>
                  </div>

                  <div className="space-y-4">
                    {batchInfo.socialLinks.map((link) => (
                      <div key={link.id} className="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex flex-col md:flex-row items-center gap-6 group hover:border-emerald-600/30 transition-all">
                        <div className="flex items-center gap-4 shrink-0">
                          <select 
                            className="bg-slate-800 text-emerald-500 p-3 rounded-xl border-none focus:ring-2 focus:ring-emerald-600 text-sm font-black"
                            value={link.iconType}
                            onChange={(e) => {
                              const newLinks = batchInfo.socialLinks.map(l => l.id === link.id ? { ...l, iconType: e.target.value as any } : l);
                              setBatchInfo({...batchInfo, socialLinks: newLinks});
                            }}
                          >
                            <option value="github">Github</option>
                            <option value="twitter">Twitter</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="facebook">Facebook</option>
                            <option value="instagram">Instagram</option>
                            <option value="youtube">YouTube</option>
                            <option value="globe">Website</option>
                          </select>
                          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-emerald-600 border border-white/10">
                            {link.iconType === 'github' && <Github size={24}/>}
                            {link.iconType === 'twitter' && <Twitter size={24}/>}
                            {link.iconType === 'linkedin' && <Linkedin size={24}/>}
                            {link.iconType === 'facebook' && <Facebook size={24}/>}
                            {link.iconType === 'instagram' && <Instagram size={24}/>}
                            {link.iconType === 'youtube' && <Youtube size={24}/>}
                            {link.iconType === 'globe' && <Globe size={24}/>}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow w-full">
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Display Name</label>
                            <input 
                              className="w-full p-3 bg-white/5 rounded-xl border border-white/10 text-white text-sm font-bold outline-none focus:border-emerald-600 transition-all" 
                              value={link.name} 
                              onChange={e => {
                                const newLinks = batchInfo.socialLinks.map(l => l.id === link.id ? { ...l, name: e.target.value } : l);
                                setBatchInfo({...batchInfo, socialLinks: newLinks});
                              }} 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Platform URL</label>
                            <input 
                              className="w-full p-3 bg-white/5 rounded-xl border border-white/10 text-white text-sm font-mono outline-none focus:border-emerald-600 transition-all" 
                              placeholder="https://..."
                              value={link.url} 
                              onChange={e => {
                                const newLinks = batchInfo.socialLinks.map(l => l.id === link.id ? { ...l, url: e.target.value } : l);
                                setBatchInfo({...batchInfo, socialLinks: newLinks});
                              }} 
                            />
                          </div>
                        </div>

                        <button 
                          onClick={() => {
                            const newLinks = batchInfo.socialLinks.filter(l => l.id !== link.id);
                            setBatchInfo({...batchInfo, socialLinks: newLinks});
                          }}
                          className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shrink-0"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                    {batchInfo.socialLinks.length === 0 && (
                      <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-3xl">
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">No social platforms linked.</p>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium italic">These links will be updated in the global website footer.</p>
                </div>

                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl space-y-6">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <Database className="text-emerald-600" /> Database Synchronization Setup
                  </h3>
                  
                  <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`}></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Supabase Connection</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-400">
                        {isSupabaseConfigured ? 'READY' : 'CREDENTIALS MISSING'}
                      </span>
                    </div>

                    <p className="text-slate-600 text-xs leading-relaxed">
                      If you see <span className="text-rose-600 font-bold">"Invalid path specified in request"</span>, it likely means the table hasn't been created in Supabase yet. Follow the guide below:
                    </p>

                    <button 
                      onClick={() => setShowSqlGuide(!showSqlGuide)}
                      className="w-full py-3 bg-slate-900 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-lg"
                    >
                      {showSqlGuide ? "Hide Setup Instructions" : "Show Setup Instructions"}
                    </button>

                    {showSqlGuide && (
                      <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-3 ml-2">SQL Script for Supabase Editor:</p>
                        <pre className="p-5 bg-slate-900 text-emerald-400 text-[10px] font-mono rounded-2xl overflow-x-auto border border-emerald-900/30 whitespace-pre">
{`CREATE TABLE IF NOT EXISTS site_config (
  id TEXT PRIMARY KEY,
  notices JSONB DEFAULT '[]',
  materials_data JSONB DEFAULT '{}',
  batch_info JSONB DEFAULT '{}',
  gallery_albums JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE site_config DISABLE ROW LEVEL SECURITY;`}
                        </pre>
                        <p className="mt-4 text-[9px] text-amber-600 font-bold leading-relaxed bg-amber-50 p-4 rounded-xl border border-amber-100">
                          NOTE: Disabling RLS (Row Level Security) allows anyone with your public keys to read/write. For better security, keep RLS enabled and add policies for "Enable access for authenticated users only" if you use Supabase Auth.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Changes Button Updated */}
        <div className="mt-20 flex flex-col items-center gap-4 px-4">
          {syncStatus && (
            <div className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] animate-in fade-in zoom-in ${syncStatus.startsWith('Error') ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
              {syncStatus}
            </div>
          )}
          <button 
            onClick={handleManualSync} 
            disabled={isSyncing}
            className={`w-full md:w-auto px-8 md:px-16 py-5 md:py-6 bg-slate-900 border-2 font-black rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl flex items-center justify-center gap-4 transition-all active:scale-95 text-lg md:text-xl tracking-tighter uppercase ${isSyncing ? 'border-amber-500 text-amber-500 opacity-70' : 'border-emerald-600 text-emerald-600 shadow-emerald-900/30 hover:bg-emerald-600 hover:text-white'}`}
          >
            {isSyncing ? (
              <>
                <div className="w-6 h-6 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                Syncing System...
              </>
            ) : (
              <>
                <Save size={28} className="md:w-8 md:h-8"/> Synchronize System
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const CategoryPick = ({title, icon, onClick}: any) => (
  <button onClick={onClick} className="bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-xl hover:shadow-2xl hover:border-emerald-600 transition-all text-left flex items-center gap-6 group hover:-translate-y-2">
    <div className="w-16 h-16 bg-slate-900 text-emerald-600 rounded-2xl flex items-center justify-center font-black text-2xl transition-transform group-hover:scale-110 shadow-xl border border-emerald-600/20">
      {icon}
    </div>
    <div className="flex-grow">
      <h4 className="text-xl font-black text-slate-900 tracking-tight">{title}</h4>
      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] block mt-1 opacity-50 group-hover:opacity-100 transition-opacity">Module Control</span>
    </div>
    <ChevronRight size={24} className="text-slate-200 group-hover:text-emerald-600 transition-colors" />
  </button>
);

const TabBtn = ({active, icon, label, onClick}: any) => (
  <button onClick={onClick} className={`flex-shrink-0 flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] transition-all ${active ? 'bg-emerald-600 text-white shadow-2xl shadow-emerald-900/50' : 'text-slate-500 hover:text-emerald-600 hover:bg-white/5'}`}>
    {React.cloneElement(icon as React.ReactElement, { size: 14, className: "md:w-[18px] md:h-[18px]" })} {label}
  </button>
);

const InputGroup = ({label, val, onChange}: any) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] ml-1">{label}</label>
    <input className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent font-bold text-slate-900 text-base focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600 outline-none transition-all" value={val} onChange={e => onChange(e.target.value)} />
  </div>
);

export default AdminPage;