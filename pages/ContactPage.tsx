import React, { useState } from 'react';
import { Mail, Phone, User, MessageSquare, Send, CheckCircle2, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { BatchInfo } from '../types';

interface ContactPageProps {
  batchInfo: BatchInfo;
}

const ContactPage: React.FC<ContactPageProps> = ({ batchInfo }) => {
  const [formData, setFormData] = useState({ name: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const resolveImageUrl = (url: string) => {
    if (!url) return '';
    const trimmedUrl = url.trim();
    if (trimmedUrl.includes('drive.google.com') || trimmedUrl.includes('docs.google.com') || trimmedUrl.includes('drive.usercontent.google.com')) {
      if (trimmedUrl.includes('/folders/')) return '';
      const id = trimmedUrl.match(/\/d\/([^/?#\s]+)/)?.[1] || trimmedUrl.match(/[?&]id=([^&\s]+)/)?.[1];
      if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w1600`;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.message.trim()) return;

    setStatus('submitting');
    await new Promise(resolve => setTimeout(resolve, 1500));
    setStatus('success');
    setFormData({ name: '', message: '' });
  };

  return (
    <div className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="space-y-12 mb-32">
          <div className="text-center">
            <h2 className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-4">Batch Representatives</h2>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter">Leadership Desk</h1>
            <div className="w-20 h-1.5 bg-emerald-600 mx-auto rounded-full mt-6 scale-x-110"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {batchInfo.crs.map((cr, idx) => (
              <div key={idx} className="group relative overflow-hidden bg-slate-900 rounded-[3rem] p-1 border-2 border-transparent hover:border-emerald-600/30 transition-all duration-500 shadow-2xl">
                <div className="bg-slate-900 rounded-[2.9rem] p-8 md:p-10 flex flex-col items-center md:items-start text-center md:text-left h-full relative z-10">
                  {/* Avatar Section */}
                  <div className="relative mb-8">
                    <div className="w-24 h-24 md:w-28 md:h-28 bg-emerald-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-emerald-900/50 relative z-10 group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                      {cr.image ? (
                        <img src={resolveImageUrl(cr.image)} alt={cr.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={48} className="md:w-14 md:h-14" />
                      )}
                    </div>
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-xl z-20 transform rotate-12 group-hover:rotate-0 transition-transform">
                      <Sparkles size={20} className="text-emerald-600" />
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="w-full space-y-6">
                    <div>
                      <span className="px-5 py-2 bg-emerald-600/10 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-600/20 mb-4 inline-block">
                        {cr.section} CR
                      </span>
                      <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-2">{cr.name}</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3 w-full">
                      <a href={`mailto:${cr.email}`} className="flex items-center justify-center md:justify-start gap-5 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-emerald-600 group/btn transition-all duration-300">
                        <div className="p-2 bg-white/10 rounded-xl group-hover/btn:bg-white/20 transition-colors">
                          <Mail size={20} className="text-emerald-500 group-hover/btn:text-white" />
                        </div>
                        <span className="text-slate-400 group-hover/btn:text-white font-bold text-sm md:text-base truncate">{cr.email}</span>
                      </a>

                      <a href={`tel:${cr.phone}`} className="flex items-center justify-center md:justify-start gap-5 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-emerald-600 group/btn transition-all duration-300">
                        <div className="p-2 bg-white/10 rounded-xl group-hover/btn:bg-white/20 transition-colors">
                          <Phone size={20} className="text-emerald-500 group-hover/btn:text-white" />
                        </div>
                        <span className="text-slate-400 group-hover/btn:text-white font-bold text-sm md:text-base">{cr.phone}</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Subtle Decorative Background Element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-600/20 transition-colors"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
             <h2 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.5em] mb-4">Our Batch Story</h2>
             <h3 className="text-5xl font-black text-slate-900 tracking-tighter">About</h3>
          </div>
          <div className="bg-slate-50 p-10 md:p-20 rounded-[3rem] md:rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-5 md:p-8 text-emerald-100/50 italic font-serif text-6xl md:text-8xl select-none leading-none mt-2 md:mt-4 mr-2 md:mr-4">Batch</div>
            <div className="relative z-10 text-center italic">
              <p className="text-slate-500 text-lg md:text-2xl font-medium leading-relaxed tracking-tight">
                {batchInfo.about || `${batchInfo.name} is a dedicated community of students focused on academic excellence and professional growth.`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;