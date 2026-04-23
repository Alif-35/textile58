import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Bell, 
  BookOpen, 
  Image as ImageIcon, 
  Mail, 
  ChevronRight,
  Info,
  HeartHandshake,
  Sparkles,
  ArrowRight,
  Users,
  Calendar,
  GraduationCap
} from 'lucide-react';
import { Notice, BatchInfo } from '../types';

interface HomePageProps {
  notices: Notice[];
  batchInfo: BatchInfo;
}

const HomePage: React.FC<HomePageProps> = ({ notices, batchInfo }) => {
  const getDirectImageUrl = (url: string) => {
    if (!url) return '';
    const trimmedUrl = url.trim();
    if (trimmedUrl.includes('drive.google.com') || trimmedUrl.includes('docs.google.com')) {
      const id = trimmedUrl.match(/\/d\/([^/?#\s]+)/)?.[1] || trimmedUrl.match(/[?&]id=([^&\s]+)/)?.[1];
      if (id) return `https://drive.google.com/uc?export=view&id=${id}`;
    }
    if (trimmedUrl.includes('imgur.com')) {
      if (trimmedUrl.includes('i.imgur.com')) return trimmedUrl;
      const id = trimmedUrl.split('/').pop()?.split(/[?#]/)[0];
      if (id && id.length > 3) return `https://i.imgur.com/${id}.jpg`;
    }
    if (trimmedUrl.includes('dropbox.com')) {
      return trimmedUrl.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace(/\?dl=[01]/, '');
    }
    return trimmedUrl;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-slate-50 overflow-hidden min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            src={getDirectImageUrl(batchInfo.heroImage || "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1920")} 
            alt="Batch Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/20 to-slate-50"></div>
          <div className="absolute inset-0 weaving-pattern opacity-20"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 text-emerald-400 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] mb-8"
          >
            <Sparkles size={14} /> Textile Batch 58 Network
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="text-6xl md:text-9xl font-display font-black text-white mb-6 tracking-tight leading-[0.85]"
          >
            {batchInfo.name}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-xl md:text-3xl text-slate-300 mb-12 max-w-3xl mx-auto font-light leading-relaxed text-balance"
          >
            {batchInfo.tagline}
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
            className="flex flex-wrap items-center justify-center gap-4 text-slate-400 font-bold uppercase tracking-widest text-[10px]"
          >
            <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <GraduationCap size={14} className="text-emerald-500" /> {batchInfo.department}
            </span>
            <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <Users size={14} className="text-emerald-500" /> {batchInfo.university}
            </span>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-400 opacity-50"
        >
          <div className="w-px h-12 bg-gradient-to-b from-emerald-500 to-transparent"></div>
        </motion.div>
      </section>

      {/* Navigation Grid */}
      <section className="py-24 relative z-10 -mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <QuickNavCard 
              to="/materials" 
              icon={<BookOpen />} 
              label="Academic Materials" 
              description="Access slides, notes, and question banks."
              color="emerald"
            />
            <QuickNavCard 
              to="/gallery" 
              icon={<ImageIcon />} 
              label="Batch Gallery" 
              description="Relive our best moments together."
              color="amber"
            />
            <QuickNavCard 
              to="/donation" 
              icon={<HeartHandshake />} 
              label="Donation" 
              description="Support our batch initiatives."
              color="rose"
            />
            <QuickNavCard 
              to="/contact" 
              icon={<Mail />} 
              label="Get in Touch" 
              description="Reach out to batch representatives."
              color="indigo"
            />
          </motion.div>
        </div>
      </section>

      {/* Notice Board Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-50/30 -skew-x-12 translate-x-1/2"></div>
        
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 mb-4"
              >
                <div className="p-3 bg-slate-950 text-emerald-400 rounded-2xl shadow-2xl">
                  <Bell size={24} />
                </div>
                <h2 className="text-4xl font-display font-black text-slate-900 tracking-tight">Notice Board</h2>
              </motion.div>
              <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs ml-1">Stay updated with the latest batch news</p>
            </div>
            <Link to="/materials" className="inline-flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest group hover:text-emerald-700 transition-colors">
              Explore Resources <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="space-y-4">
            {notices.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-center py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200"
              >
                <Info className="mx-auto text-slate-300 mb-6" size={64} />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No active notices at the moment</p>
              </motion.div>
            ) : (
              notices.map((notice, idx) => (
                <motion.div 
                  key={notice.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`group p-8 rounded-[2.5rem] border transition-all hover:shadow-2xl hover:shadow-emerald-900/5 ${
                    notice.isImportant 
                      ? 'bg-emerald-50/40 border-emerald-100/50' 
                      : 'bg-white border-slate-100 hover:border-emerald-200'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex-grow">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <Calendar size={12} /> {notice.date}
                        </span>
                        {notice.isImportant && (
                          <span className="px-3 py-1 bg-emerald-600 text-white text-[9px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-emerald-200">Priority</span>
                        )}
                      </div>
                      <h3 className="text-2xl font-display font-black text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors leading-tight">{notice.title}</h3>
                      <p className="text-slate-500 text-base leading-relaxed font-medium max-w-3xl">
                        {notice.description}
                      </p>
                    </div>
                    <div className="hidden md:flex flex-shrink-0">
                       <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                          <ChevronRight size={28} />
                       </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

const QuickNavCard: React.FC<{ to: string; icon: React.ReactNode; label: string; description: string; color: string }> = ({ to, icon, label, description, color }) => {
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-600 bg-emerald-50 group-hover:bg-emerald-600',
    amber: 'text-amber-600 bg-amber-50 group-hover:bg-amber-600',
    rose: 'text-rose-600 bg-rose-50 group-hover:bg-rose-600',
    indigo: 'text-indigo-600 bg-indigo-50 group-hover:bg-indigo-600',
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Link 
        to={to} 
        className="block h-full bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-emerald-900/5 transition-all group"
      >
        <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 transition-all duration-500 shadow-sm ${colorMap[color]}`}>
          {React.cloneElement(icon as React.ReactElement, { size: 32, className: "group-hover:text-white transition-colors" })}
        </div>
        <h3 className="text-slate-900 font-display font-black text-xl mb-2 tracking-tight">{label}</h3>
        <p className="text-slate-400 text-sm font-medium leading-relaxed">{description}</p>
        <div className="mt-6 flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
          Explore Now <ArrowRight size={14} />
        </div>
      </Link>
    </motion.div>
  );
};

export default HomePage;
