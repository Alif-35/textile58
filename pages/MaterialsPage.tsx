import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Handshake, 
  HelpCircle, 
  Link as LinkIcon,
  ChevronRight,
  Search,
  FileText,
  Monitor,
  X,
  FileSearch,
  BookOpen,
  Sparkles,
  Zap,
  Tag
} from 'lucide-react';
import { MaterialData, Resource, Semester, Course } from '../types';

interface MaterialsPageProps {
  data: MaterialData;
}

interface SearchResult extends Resource {
  path: string;
  category: string;
}

const MaterialsPage: React.FC<MaterialsPageProps> = ({ data }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Slide' | 'PDF'>('All');

  const allResources = useMemo(() => {
    const results: SearchResult[] = [];
    const processSemesters = (semesters: Semester[], categoryName: string) => {
      semesters.forEach(sem => {
        sem.courses.forEach(course => {
          course.resources.forEach(res => {
            results.push({
              ...res,
              category: categoryName,
              path: `${sem.name} > ${course.name}`
            });
          });
        });
      });
    };
    processSemesters(data.sectionA, 'Section A');
    processSemesters(data.sectionB, 'Section B');
    
    // Process Question Bank (New Structure: Batch > Semester > Exam > Course)
    data.questionBank.forEach(batch => {
      batch.semesters.forEach(sem => {
        sem.exams.forEach(exam => {
          exam.courses.forEach(course => {
            course.resources.forEach(res => {
              results.push({
                ...res,
                category: 'Question Bank',
                path: `${batch.batchName} > ${sem.name} > ${exam.name} > ${course.name}`
              });
            });
          });
        });
      });
    });

    data.specialLinks.forEach(link => {
      results.push({ ...link, category: 'Special Links', path: 'External Assets' });
    });
    return results;
  }, [data]);

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim() && filterType === 'All') return [];
    const query = searchQuery.toLowerCase();
    return allResources.filter(res => {
      const matchesQuery = !query || 
        res.title.toLowerCase().includes(query) || 
        res.category.toLowerCase().includes(query) ||
        res.path.toLowerCase().includes(query);
      const matchesType = filterType === 'All' || res.type === filterType;
      return matchesQuery && matchesType;
    });
  }, [searchQuery, filterType, allResources]);

  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    filteredResults.forEach(res => {
      if (!groups[res.category]) groups[res.category] = [];
      groups[res.category].push(res);
    });
    return groups;
  }, [filteredResults]);

  return (
    <div className="py-20 bg-[#f8fafc] min-h-[90vh]">
      <div className="max-w-6xl mx-auto px-4">
        {/* Modern Search Header */}
        <header className="relative mb-16 md:mb-24 text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-600/5 blur-[150px] pointer-events-none rounded-full -z-10"></div>
          
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-white border border-emerald-100 text-emerald-700 rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] mb-6 md:mb-8 shadow-sm">
            <Sparkles size={14} /> Knowledge Core
          </div>
          
          <h1 className="text-4xl md:text-7xl font-black text-slate-900 mb-8 md:mb-12 tracking-tighter leading-none">
            Digital Archive
          </h1>
          
          <div className="max-w-3xl mx-auto space-y-8 md:space-y-10">
            {/* Search Input Container */}
            <div className="relative group">
              <div className="relative flex items-center bg-white border border-slate-100 shadow-2xl shadow-emerald-900/10 rounded-[1.5rem] md:rounded-[3rem] p-1.5 md:p-2 group-focus-within:border-emerald-600/50 transition-all">
                <div className="pl-4 md:pl-8 text-slate-300 group-focus-within:text-emerald-600 transition-colors">
                  <Search size={20} className="md:w-7 md:h-7" />
                </div>
                <input 
                  type="text"
                  placeholder="Search courses or files..."
                  className="flex-grow px-3 md:px-6 py-3 md:py-5 bg-transparent border-none focus:ring-0 text-slate-900 font-bold placeholder:text-slate-200 text-sm md:text-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="p-2 md:p-3 mr-1 md:mr-3 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                    <X size={16} className="md:w-5 md:h-5" />
                  </button>
                )}
                <div className="hidden sm:flex pr-3">
                  <div className="bg-emerald-600 text-white px-10 py-4 rounded-[2.5rem] font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all cursor-pointer">
                    <Zap size={16} fill="currentColor" /> Query
                  </div>
                </div>
              </div>
            </div>
 
            {/* Quick Filter Tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
              <TagButton active={filterType === 'All'} onClick={() => setFilterType('All')} label="All Files" icon={<BookOpen size={14} className="md:w-4 md:h-4" />} />
              <TagButton active={filterType === 'Slide'} onClick={() => setFilterType('Slide')} label="Slides" icon={<Monitor size={14} className="md:w-4 md:h-4" />} />
              <TagButton active={filterType === 'PDF'} onClick={() => setFilterType('PDF')} label="Notes" icon={<FileText size={14} className="md:w-4 md:h-4" />} />
            </div>
          </div>
        </header>

        {/* Content Area */}
        {searchQuery.trim() || filterType !== 'All' ? (
          <div className="space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {filteredResults.length > 0 ? (
              (Object.entries(groupedResults) as [string, SearchResult[]][]).map(([category, items]) => (
                <div key={category}>
                  <div className="flex items-center gap-6 mb-10">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.5em] leading-none">{category}</h3>
                    <div className="h-px bg-emerald-600/10 flex-grow"></div>
                    <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-5 py-2 rounded-full uppercase tracking-widest">{items.length} Files</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map(res => {
                      const isExternalLink = res.category === 'Special Links' || res.type === 'Link';
                      const CardWrapper = isExternalLink ? 'a' : Link;
                      const wrapperProps = isExternalLink 
                        ? { href: res.link, target: "_blank", rel: "noopener noreferrer" }
                        : { to: `/resource/${res.id}` };

                      return (
                        <CardWrapper 
                          key={res.id}
                          {...wrapperProps}
                          className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm hover:shadow-2xl hover:border-emerald-100 transition-all group flex flex-col min-h-[160px] hover:-translate-y-2"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl ${res.type === 'Slide' ? 'bg-amber-50 text-amber-600' : res.type === 'PDF' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-900 text-emerald-500'} shadow-xl`}>
                              {res.type === 'Slide' ? <Monitor size={20} /> : res.type === 'PDF' ? <FileText size={20} /> : <LinkIcon size={20} />}
                            </div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{res.type}</span>
                          </div>
                          <h4 className="text-sm md:text-lg font-black text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-tight flex-grow mb-4 tracking-tight">
                            {res.title}
                          </h4>
                          <div className="text-[10px] font-bold text-slate-400 flex items-center gap-2 truncate bg-slate-50/80 p-2 rounded-xl border border-slate-100">
                            <Tag size={10} className="text-emerald-500" /> {res.path}
                          </div>
                        </CardWrapper>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-24 text-center bg-white rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-900/5">
                <div className="w-28 h-28 bg-slate-50 border-4 border-emerald-600/5 rounded-[3rem] flex items-center justify-center mx-auto mb-10 text-slate-200">
                  <FileSearch size={56} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">No Matches Found</h3>
                <p className="text-slate-400 max-w-sm mx-auto mb-12 text-base font-bold leading-relaxed">Our archives are deep, but we couldn't find that specific item.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Category Navigation */}
            <div className="relative mb-20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-32 items-center">
                <CategoryCard to="/materials/sectionA" title="Section A" label="Access Archive" char="A" />
                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="p-8 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 text-emerald-600 animate-pulse">
                    <Handshake size={56} strokeWidth={1} />
                  </div>
                </div>
                <CategoryCard to="/materials/sectionB" title="Section B" label="Access Archive" char="B" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <QuickLinkCard to="/materials/questionBank" title="Question Bank" sub="Historical Data" icon={<HelpCircle size={36} />} color="bg-slate-900" textColor="text-emerald-600" />
              <QuickLinkCard to="/materials/specialLinks" title="Special Assets" sub="Remote Links" icon={<LinkIcon size={36} />} color="bg-emerald-600" textColor="text-white" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CategoryCard = ({ to, title, label, char }: any) => (
  <Link 
    to={to}
    className="group bg-white p-10 md:p-20 rounded-[3rem] md:rounded-[5rem] border-2 border-slate-50 shadow-sm hover:shadow-2xl hover:shadow-emerald-900/10 transition-all text-center flex flex-col items-center justify-center h-64 md:h-96 hover:-translate-y-2 hover:border-emerald-600/20"
  >
    <div className="w-16 h-16 md:w-28 md:h-28 bg-slate-50 text-emerald-600 rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center mb-6 md:mb-10 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shadow-xl">
      <span className="text-3xl md:text-6xl font-black">{char}</span>
    </div>
    <h3 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter">{title}</h3>
    <p className="text-emerald-600 text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] mt-4 md:mt-8 bg-emerald-50 px-6 md:px-8 py-2 md:py-2.5 rounded-full">{label}</p>
  </Link>
);

const QuickLinkCard = ({ to, title, sub, icon, color, textColor }: any) => (
  <Link 
    to={to}
    className="group bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] border border-slate-50 shadow-sm hover:shadow-2xl transition-all flex items-center gap-6 md:gap-10 hover:-translate-y-2 hover:border-emerald-600/10"
  >
    <div className={`w-16 h-16 md:w-24 md:h-24 ${color} ${textColor} rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl shrink-0`}>
      {React.cloneElement(icon as React.ReactElement, { size: 24, className: "md:w-9 md:h-9" })}
    </div>
    <div>
      <h3 className="text-xl md:text-3xl font-black text-slate-900 leading-none mb-2 md:mb-3 tracking-tighter">{title}</h3>
      <p className="text-slate-400 text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em]">{sub}</p>
    </div>
    <ChevronRight className="ml-auto text-slate-200 group-hover:text-emerald-600 transition-colors shrink-0" size={24} />
  </Link>
);

const TagButton = ({ active, onClick, label, icon }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 md:gap-3 px-5 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all shadow-xl ${
      active 
        ? 'bg-emerald-600 text-white shadow-emerald-200 border border-emerald-600' 
        : 'bg-white text-slate-400 border border-slate-100 hover:border-emerald-600/50'
    }`}
  >
    {icon} {label}
  </button>
);

const SuggestionTag = ({ onClick, label }: any) => (
  <button 
    onClick={onClick}
    className="px-6 py-3 bg-slate-50 text-slate-900 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all border border-slate-100"
  >
    {label}
  </button>
);

export default MaterialsPage;