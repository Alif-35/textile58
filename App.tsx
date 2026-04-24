import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Image as ImageIcon, 
  Mail, 
  ShieldCheck, 
  Menu, 
  X,
  HeartHandshake,
  Clock,
  ArrowUpRight,
  User,
  Github,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  Globe
} from 'lucide-react';
import HomePage from './pages/HomePage';
import MaterialsPage from './pages/MaterialsPage';
import SectionMaterialsPage from './pages/SectionMaterialsPage';
import GalleryPage from './pages/GalleryPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';
import DonationPage from './pages/DonationPage';
import ResourcePage from './pages/ResourcePage';
import AIChatAssistant from './components/AIChatAssistant';
import { fetchSiteData, saveSiteData } from './services/supabaseService';
import { isSupabaseConfigured } from './lib/supabase';
import { 
  INITIAL_NOTICES, 
  INITIAL_MATERIALS_DATA, 
  INITIAL_BATCH_INFO, 
  INITIAL_GALLERY_ALBUMS 
} from './constants';
import { Notice, MaterialData, BatchInfo, GalleryAlbum } from './types';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const safeParse = (key: string, fallback: any) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (error) {
    console.error(`Error parsing ${key} from LocalStorage:`, error);
    return fallback;
  }
};

const App: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>(() => safeParse('notices', INITIAL_NOTICES));
  const [materialsData, setMaterialsData] = useState<MaterialData>(() => safeParse('materials_data', INITIAL_MATERIALS_DATA));
  const [batchInfo, setBatchInfo] = useState<BatchInfo>(() => safeParse('batch_info', INITIAL_BATCH_INFO));
  const [galleryAlbums, setGalleryAlbums] = useState<GalleryAlbum[]>(() => safeParse('gallery_albums', INITIAL_GALLERY_ALBUMS));
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const syncToRemote = async () => {
    if (!isSupabaseConfigured || isLoading) return;
    setIsSyncing(true);
    setSyncError(null);
    try {
      await saveSiteData({
        notices,
        materials_data: materialsData,
        batch_info: batchInfo,
        gallery_albums: galleryAlbums
      });
    } catch (e: any) {
      console.warn('Sync failed:', e);
      setSyncError(e?.message || 'Synchronization failed');
    } finally {
      setIsSyncing(false);
    }
  };
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      // Set a timeout to proceed even if Supabase is slow
      const timeoutId = setTimeout(() => {
        setIsLoading(false);
        setLoadError("Connection timed out. Using local data.");
      }, 10000);

      try {
        const remoteData = await fetchSiteData();
        console.log('Fetched remote data:', remoteData);
        if (remoteData) {
          if (remoteData.notices) setNotices(remoteData.notices);
          if (remoteData.materials_data) setMaterialsData(remoteData.materials_data);
          if (remoteData.batch_info) setBatchInfo(remoteData.batch_info);
          if (remoteData.gallery_albums) setGalleryAlbums(remoteData.gallery_albums);
        }
      } catch (error) {
        console.error('Failed to load remote data:', error);
        setLoadError("Server connection failed. Using local data.");
      } finally {
        clearTimeout(timeoutId);
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Save to LocalStorage and Sync to Supabase (with debounce)
  useEffect(() => {
    if (isLoading) return; // Prevent initial sync before data is loaded

    localStorage.setItem('notices', JSON.stringify(notices));
    localStorage.setItem('materials_data', JSON.stringify(materialsData));
    localStorage.setItem('batch_info', JSON.stringify(batchInfo));
    localStorage.setItem('gallery_albums', JSON.stringify(galleryAlbums));

    const debounceTimer = setTimeout(syncToRemote, 2000); // 2s debounce for stability
    return () => clearTimeout(debounceTimer);
  }, [notices, materialsData, batchInfo, galleryAlbums, isLoading]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-8"></div>
        <h2 className="text-white font-black text-2xl tracking-tighter uppercase mb-2">Initializing System</h2>
        <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest animate-pulse max-w-xs">
          Connecting to Supabase... if this takes too long, check your API keys and Internet.
        </p>
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      {isSyncing && isSupabaseConfigured && (
        <div className="fixed bottom-6 left-6 z-[100] bg-slate-900 text-white px-4 py-2 rounded-full shadow-2xl border border-emerald-500/30 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
          <span className="text-[10px] font-black uppercase tracking-widest">Syncing to Cloud</span>
        </div>
      )}
      {syncError && (
        <div className="fixed bottom-6 right-6 z-[100] bg-rose-600 text-white px-4 py-2 rounded-xl shadow-2xl border border-rose-400/30 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <span className="text-[10px] font-black uppercase tracking-widest">Cloud Error: {syncError}</span>
          <button onClick={() => setSyncError(null)} className="hover:bg-rose-500 p-1 rounded-full transition-colors">
            <X size={14} />
          </button>
        </div>
      )}
      <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-slate-50">
        {/* Navigation */}
        <nav className="bg-white/70 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between h-20">
              <div className="flex items-center gap-4">
                <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
                  <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center text-white font-bold shadow-xl overflow-hidden group-hover:scale-110 transition-transform">
                    {batchInfo.logo && (batchInfo.logo.startsWith('http') || batchInfo.logo.startsWith('data:')) ? (
                      <img src={batchInfo.logo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-emerald-400">{batchInfo.logo || 'S'}</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-display font-black text-xl tracking-tight text-slate-900 leading-none">{batchInfo.name}</span>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Batch Network</span>
                  </div>
                </Link>
              </div>
              
              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-2">
                <NavLink to="/" icon={<Home size={16} />} label="Home" />
                <NavLink to="/materials" icon={<BookOpen size={16} />} label="Materials" />
                <NavLink to="/gallery" icon={<ImageIcon size={16} />} label="Gallery" />
                <NavLink to="/donation" icon={<HeartHandshake size={16} />} label="Donation" />
                <NavLink to="/contact" icon={<Mail size={16} />} label="Contact" />
                
                <div className="w-px h-6 bg-slate-200 mx-4"></div>
                
                <Link 
                  to="/admin" 
                  className="bg-slate-950 text-white hover:bg-emerald-600 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-slate-200"
                >
                  <ShieldCheck size={16} className="text-emerald-400" />
                  CR Panel
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden flex items-center">
                <button onClick={toggleMenu} className="text-slate-900 p-2 transition-colors">
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-white border-t border-slate-100 px-6 pt-6 pb-12 space-y-2 shadow-2xl animate-in slide-in-from-top-4 duration-300">
              <MobileNavLink to="/" label="Home" icon={<Home size={20} />} onClick={toggleMenu} />
              <MobileNavLink to="/materials" label="Study Materials" icon={<BookOpen size={20} />} onClick={toggleMenu} />
              <MobileNavLink to="/gallery" label="Gallery" icon={<ImageIcon size={20} />} onClick={toggleMenu} />
              <MobileNavLink to="/donation" label="Donation" icon={<HeartHandshake size={20} />} onClick={toggleMenu} />
              <MobileNavLink to="/contact" label="Contact" icon={<Mail size={20} />} onClick={toggleMenu} />
              <div className="pt-8">
                <Link 
                  to="/admin" 
                  onClick={toggleMenu}
                  className="w-full bg-slate-950 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all"
                >
                  <ShieldCheck size={20} className="text-emerald-400" /> CR Panel
                </Link>
              </div>
            </div>
          )}
        </nav>

        {/* Content */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage notices={notices} batchInfo={batchInfo} />} />
            <Route path="/materials" element={<MaterialsPage data={materialsData} />} />
            <Route path="/materials/:category" element={<SectionMaterialsPage data={materialsData} setData={setMaterialsData} />} />
            <Route path="/resource/:id" element={<ResourcePage data={materialsData} />} />
            <Route path="/gallery" element={<GalleryPage albums={galleryAlbums} />} />
            <Route path="/contact" element={<ContactPage batchInfo={batchInfo} />} />
            <Route path="/donation" element={<DonationPage donation={batchInfo.donation} />} />
            <Route 
              path="/admin" 
              element={
                <AdminPage 
                  notices={notices} setNotices={setNotices} 
                  materialsData={materialsData} setMaterialsData={setMaterialsData}
                  batchInfo={batchInfo} setBatchInfo={setBatchInfo}
                  galleryAlbums={galleryAlbums} setGalleryAlbums={setGalleryAlbums}
                  onManualSync={syncToRemote}
                  isSyncing={isSyncing}
                />
              } 
            />
          </Routes>
        </main>

        {/* AI Assistant */}
        <AIChatAssistant batchInfo={batchInfo} materialsData={materialsData} />

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 pt-24 pb-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500"></div>
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
              <div className="md:col-span-5 space-y-8">
                <Link to="/" className="flex items-center gap-3 group">
                  <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-white font-black text-2xl overflow-hidden shadow-2xl">
                    {batchInfo.logo && (batchInfo.logo.startsWith('http') || batchInfo.logo.startsWith('data:')) ? (
                      <img src={batchInfo.logo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-emerald-400">{batchInfo.logo || 'S'}</span>
                    )}
                  </div>
                  <span className="font-display font-black text-2xl tracking-tight text-slate-900">{batchInfo.name}</span>
                </Link>
                <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-sm">
                  Empowering the future of textile engineering through collaboration, innovation, and shared knowledge.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  {batchInfo.socialLinks.map((link) => (
                    <a 
                      key={link.id} 
                      href={link.url || "#"} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      title={link.name}
                    >
                      <SocialLink 
                        icon={
                          <>
                            {link.iconType === 'github' && <Github size={20} />}
                            {link.iconType === 'twitter' && <Twitter size={20} />}
                            {link.iconType === 'linkedin' && <Linkedin size={20} />}
                            {link.iconType === 'facebook' && <Facebook size={20} />}
                            {link.iconType === 'instagram' && <Instagram size={20} />}
                            {link.iconType === 'youtube' && <Youtube size={20} />}
                            {link.iconType === 'globe' && <Globe size={20} />}
                          </>
                        } 
                      />
                    </a>
                  ))}
                </div>
              </div>
              
              <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
                <FooterColumn title="Platform">
                  <FooterLink to="/" label="Home" />
                  <FooterLink to="/materials" label="Materials" />
                  <FooterLink to="/gallery" label="Gallery" />
                </FooterColumn>
                <FooterColumn title="Support">
                  <FooterLink to="/donation" label="Donation" />
                  <FooterLink to="/contact" label="Contact" />
                  <FooterLink to="/admin" label="CR Panel" />
                </FooterColumn>
                <FooterColumn title="Academic">
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">{batchInfo.department}</p>
                  <p className="text-slate-400 text-[10px] font-medium leading-relaxed">{batchInfo.university}</p>
                </FooterColumn>
              </div>
            </div>
            
            <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                © {new Date().getFullYear()} {batchInfo.name} • All Rights Reserved
              </p>
              <div className="flex items-center gap-8">
                <span className="text-slate-300 text-[10px] font-black uppercase tracking-[0.3em]">Excellence in Textiles</span>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

const NavLink: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to === '/materials' && location.pathname.startsWith('/materials'));
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-2 px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${
        isActive 
          ? 'bg-emerald-50 text-emerald-600 shadow-sm' 
          : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
      }`}
    >
      {icon} {label}
    </Link>
  );
};

const MobileNavLink: React.FC<{ to: string; label: string; icon: React.ReactNode; onClick: () => void }> = ({ to, label, icon, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link 
      to={to} 
      onClick={onClick} 
      className={`flex items-center gap-4 px-6 py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] transition-all ${
        isActive 
          ? 'bg-emerald-50 text-emerald-600' 
          : 'text-slate-500 hover:bg-slate-50'
      }`}
    >
      <span className={isActive ? 'text-emerald-600' : 'text-slate-300'}>{icon}</span>
      {label}
    </Link>
  );
};

const FooterColumn: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-6">
    <h4 className="text-slate-900 font-display font-black text-sm uppercase tracking-widest">{title}</h4>
    <div className="flex flex-col gap-4">
      {children}
    </div>
  </div>
);

const FooterLink: React.FC<{ to: string; label: string }> = ({ to, label }) => (
  <Link to={to} className="text-slate-500 hover:text-emerald-600 text-sm font-medium transition-colors flex items-center gap-1 group">
    {label} <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-all" />
  </Link>
);

const SocialLink: React.FC<{ icon: React.ReactNode }> = ({ icon }) => (
  <button className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-950 hover:text-white hover:border-slate-950 transition-all shadow-sm">
    {icon}
  </button>
);

export default App;
