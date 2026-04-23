import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ExternalLink, 
  FileText, 
  Monitor, 
  Download,
  AlertCircle,
  Copy,
  ChevronLeft,
  Share2
} from 'lucide-react';
import { MaterialData, Resource, Semester } from '../types';

interface ResourcePageProps {
  data: MaterialData;
}

const ResourcePage: React.FC<ResourcePageProps> = ({ data }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const resource = useMemo(() => {
    const flattenSection = (semesters: Semester[]) => {
      const all: Resource[] = [];
      semesters.forEach(sem => {
        sem.courses.forEach(course => {
          all.push(...course.resources);
        });
      });
      return all;
    };

    const allResources = [
      ...flattenSection(data.sectionA),
      ...flattenSection(data.sectionB),
      ...data.questionBank.flatMap(batch => 
        batch.semesters.flatMap(sem => 
          sem.exams.flatMap(exam => 
            exam.courses.flatMap(course => course.resources)
          )
        )
      ),
      ...data.specialLinks
    ];

    return allResources.find(item => item.id === id);
  }, [data, id]);

  const embedUrl = useMemo(() => {
    if (!resource || !resource.link || resource.link === '#' || resource.type === 'Link') return '';
    const link = resource.link;
    if (link.includes('drive.google.com')) {
      if (link.includes('/view')) return link.replace('/view', '/preview');
      if (link.includes('/edit')) return link.replace('/edit', '/preview');
      if (link.includes('id=')) {
        const fileId = link.split('id=')[1].split('&')[0];
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }
    return link;
  }, [resource]);

  const copyToClipboard = () => {
    if (resource) {
      navigator.clipboard.writeText(resource.link);
      alert('Asset link synchronized to clipboard.');
    }
  };

  if (!resource) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-10 text-center bg-white">
        <div className="w-28 h-28 bg-slate-900 border-4 border-emerald-600/10 rounded-[3rem] flex items-center justify-center mb-8 text-emerald-600 animate-pulse shadow-2xl">
          <AlertCircle size={64} />
        </div>
        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">System Error: File Not Found</h2>
        <p className="text-slate-400 mb-12 max-w-sm font-bold leading-relaxed">The requested asset has been relocated or restricted by the Administrative Board.</p>
        <button 
          onClick={() => navigate('/materials')}
          className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-black flex items-center gap-3 hover:bg-emerald-600 transition-all shadow-2xl border-2 border-emerald-600/20"
        >
          <ChevronLeft size={24} /> Return to Repositories
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Immersive Navigation Bar */}
      <div className="bg-slate-900 border-b-2 border-emerald-600 px-4 py-5 sticky top-16 z-30 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate(-1)}
              className="group flex items-center gap-3 text-[11px] font-black text-emerald-600 uppercase tracking-widest hover:text-white transition-all"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-2 transition-transform" />
              <span>Back</span>
            </button>
            <div className="h-8 w-px bg-emerald-600/20"></div>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl shadow-xl border border-emerald-600/20 ${
                resource.type === 'Slide' ? 'bg-white text-slate-900' : resource.type === 'PDF' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-emerald-500'
              }`}>
                {resource.type === 'Slide' ? <Monitor size={20} /> : resource.type === 'PDF' ? <FileText size={20} /> : <ExternalLink size={20} />}
              </div>
              <h1 className="text-xl font-black text-white tracking-tighter truncate max-w-[180px] md:max-w-md">
                {resource.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            <button 
              onClick={copyToClipboard}
              className="p-4 bg-white/5 text-emerald-600 rounded-2xl hover:bg-white/10 hover:text-white transition-all border border-emerald-600/20"
              title="Copy URL"
            >
              <Copy size={24} />
            </button>
            <a 
              href={resource.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden sm:flex px-8 py-4 bg-white text-slate-900 rounded-2xl font-black items-center gap-2 hover:bg-emerald-600 hover:text-white transition-all shadow-xl"
            >
              <ExternalLink size={20} /> Master Link
            </a>
            <a 
              href={resource.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-grow md:flex-none px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-2xl shadow-emerald-900/50 hover:bg-slate-900 hover:text-emerald-600 border border-transparent hover:border-emerald-600/50 transition-all"
            >
              <Download size={20} /> Download Asset
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-10">
        {/* Main Viewing Portal */}
        <div className="bg-white rounded-[4rem] border-4 border-slate-900/5 shadow-2xl shadow-emerald-900/5 overflow-hidden min-h-[75vh] relative flex flex-col">
          {embedUrl ? (
            <div className="flex-grow flex flex-col">
              <div className="bg-slate-900 px-8 py-3 border-b border-emerald-600/20 flex items-center justify-between text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">
                <span className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></div> Secure Viewer Active</span>
                <span className="flex items-center gap-2 text-white/40"><Share2 size={12}/> Academic Intranet</span>
              </div>
              <iframe 
                src={embedUrl} 
                className="w-full flex-grow border-none min-h-[70vh] md:min-h-[85vh] bg-slate-50" 
                allow="autoplay"
                title={resource.title}
              ></iframe>
            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center p-16 text-center">
              <div className="w-40 h-40 bg-slate-900 border-4 border-emerald-600/10 rounded-[3.5rem] flex items-center justify-center mb-10 rotate-2 shadow-2xl">
                {resource.type === 'Slide' ? <Monitor size={80} className="text-emerald-600" /> : resource.type === 'PDF' ? <FileText size={80} className="text-emerald-600" /> : <ExternalLink size={80} className="text-emerald-600" />}
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-6 tracking-tighter">Remote Execution Only</h3>
              <p className="text-slate-400 max-w-md mb-12 text-lg font-bold leading-relaxed">
                This asset is managed by an external host and cannot be rendered in the secure local frame. Please proceed to the host environment.
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <a 
                  href={resource.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-12 py-6 bg-slate-900 text-emerald-600 border-2 border-emerald-600 font-black text-xl rounded-[2.5rem] shadow-2xl shadow-emerald-900/30 flex items-center justify-center gap-4 hover:bg-emerald-600 hover:text-white transition-all"
                >
                  Visit External Host <ExternalLink size={24} />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Support Section */}
        <div className="mt-12 p-10 bg-slate-900 rounded-[3rem] border-2 border-emerald-600/20 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="flex items-center gap-6 text-center md:text-left">
            <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-900/50"><AlertCircle size={32}/></div>
            <div>
              <p className="text-white font-black text-xl tracking-tighter leading-none">Resource Anomaly?</p>
              <p className="text-emerald-600/60 font-black uppercase tracking-widest text-[10px] mt-2">Report link failures to Administrative CRs</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/contact')}
            className="px-10 py-4 bg-white text-slate-900 font-black rounded-2xl shadow-xl hover:bg-emerald-600 hover:text-white transition-all uppercase tracking-widest text-xs"
          >
            Contact Command
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResourcePage;