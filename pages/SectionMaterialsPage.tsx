import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ChevronRight, 
  Monitor, 
  FileText, 
  BookOpen,
  Calendar,
  Book,
  FileSearch,
  Search,
  Filter,
  X,
  ChevronLeft,
  Sparkles,
  ExternalLink,
  Link as LinkIcon,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Edit2
} from 'lucide-react';
import { MaterialData, Semester, Course, Resource, QBBatch, QBSemester, ExamType } from '../types';

interface SectionMaterialsPageProps {
  data: MaterialData;
  setData?: React.Dispatch<React.SetStateAction<MaterialData>>;
}

const SectionMaterialsPage: React.FC<SectionMaterialsPageProps> = ({ data, setData }) => {
  const { category } = useParams<{ category: keyof MaterialData }>();
  const navigate = useNavigate();

  // Selection state for standard sections (A/B) - now using IDs
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Selection state for Question Bank - now using IDs
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [selectedQBSemesterId, setSelectedQBSemesterId] = useState<string | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [selectedQBCourseId, setSelectedQBCourseId] = useState<string | null>(null);

  const [filterQuery, setFilterQuery] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [passphrase, setPassphrase] = useState('');

  // Inline Add states
  const [addingType, setAddingType] = useState<'batch' | 'semester' | 'course' | 'resource' | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newResourceLink, setNewResourceLink] = useState('#');
  const [newResourceType, setNewResourceType] = useState<'Slide' | 'PDF'>('PDF');
  
  // Renaming state
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renamingValue, setRenamingValue] = useState<string>('');

  const isQuestionBank = category === 'questionBank';

  // Derived selections from current data
  const currentSectionData = (!isQuestionBank && category && (category === 'sectionA' || category === 'sectionB')) ? data[category] as Semester[] : [];
  const selectedSemester = useMemo(() => currentSectionData.find(s => s.id === selectedSemesterId) || null, [currentSectionData, selectedSemesterId]);
  const selectedCourse = useMemo(() => selectedSemester?.courses.find(c => c.id === selectedCourseId) || null, [selectedSemester, selectedCourseId]);

  const selectedBatch = useMemo(() => data.questionBank.find(b => b.id === selectedBatchId) || null, [data.questionBank, selectedBatchId]);
  const selectedQBSemester = useMemo(() => selectedBatch?.semesters.find(s => s.id === selectedQBSemesterId) || null, [selectedBatch, selectedQBSemesterId]);
  const selectedExam = useMemo(() => selectedQBSemester?.exams.find(e => e.id === selectedExamId) || null, [selectedQBSemester, selectedExamId]);
  const selectedQBCourse = useMemo(() => selectedExam?.courses.find(c => c.id === selectedQBCourseId) || null, [selectedExam, selectedQBCourseId]);

  const handleQBLogin = () => {
    if (isAuthorized) {
      setIsAuthorized(false);
      setShowLoginPrompt(false);
      return;
    }
    setShowLoginPrompt(true);
  };

  const handleVerifyPassphrase = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = data.qbPassword || 'cr123';
    if (passphrase === correctPassword) {
      setIsAuthorized(true);
      setShowLoginPrompt(false);
      setPassphrase('');
    } else {
      alert('Incorrect passphrase');
      setPassphrase('');
    }
  };

  const updateData = (newData: MaterialData) => {
    if (setData) {
      setData(newData);
    }
  };

  // Add functionality for QB
  const confirmAddBatch = () => {
    if (!newItemName.trim()) return;
    
    const newBatch: QBBatch = {
      id: 'qb_b_' + Date.now(),
      batchName: newItemName.trim(),
      semesters: []
    };

    if (setData) {
      setData(prev => ({
        ...prev,
        questionBank: [...(prev.questionBank || []), newBatch]
      }));
      setSelectedBatchId(newBatch.id);
    }
    setAddingType(null);
    setNewItemName('');
  };

  const confirmAddSemester = () => {
    if (!selectedBatchId || !newItemName.trim()) return;
    
    const newSem: QBSemester = {
      id: 'qb_s_' + Date.now(),
      name: newItemName.trim(),
      exams: [
        { id: 'exam_mid_' + Date.now(), name: 'Mid Exam', courses: [] },
        { id: 'exam_final_' + Date.now(), name: 'Final Exam', courses: [] }
      ]
    };
    if (setData) {
      setData(prev => ({
        ...prev,
        questionBank: prev.questionBank.map(b => 
          b.id === selectedBatchId ? { ...b, semesters: [...b.semesters, newSem] } : b
        )
      }));
      setSelectedQBSemesterId(newSem.id);
    }
    setAddingType(null);
    setNewItemName('');
  };

  const confirmAddCourse = () => {
    if (!selectedBatchId || !selectedQBSemesterId || !selectedExamId || !newItemName.trim()) return;
    
    const newCourse: Course = {
      id: 'qb_c_' + Date.now(),
      name: newItemName.trim(),
      resources: []
    };
    if (setData) {
      setData(prev => ({
        ...prev,
        questionBank: prev.questionBank.map(b => {
          if (b.id === selectedBatchId) {
            return {
              ...b,
              semesters: b.semesters.map(s => {
                if (s.id === selectedQBSemesterId) {
                  return {
                    ...s,
                    exams: s.exams.map(e => 
                      e.id === selectedExamId ? { ...e, courses: [...e.courses, newCourse] } : e
                    )
                  };
                }
                return s;
              })
            };
          }
          return b;
        })
      }));
      setSelectedQBCourseId(newCourse.id);
    }
    setAddingType(null);
    setNewItemName('');
  };

  const confirmAddResource = () => {
    if (!selectedBatchId || !selectedQBSemesterId || !selectedExamId || !selectedQBCourseId || !newItemName.trim()) return;

    const newRes: Resource = {
      id: 'res_' + Date.now(),
      type: newResourceType,
      title: newItemName.trim(),
      link: newResourceLink
    };

    if (setData) {
      setData(prev => ({
        ...prev,
        questionBank: prev.questionBank.map(b => {
          if (b.id === selectedBatchId) {
            return {
              ...b,
              semesters: b.semesters.map(s => {
                if (s.id === selectedQBSemesterId) {
                  return {
                    ...s,
                    exams: s.exams.map(e => {
                      if (e.id === selectedExamId) {
                        return {
                          ...e,
                          courses: e.courses.map(c => 
                            c.id === selectedQBCourseId ? { ...c, resources: [...c.resources, newRes] } : c
                          )
                        };
                      }
                      return e;
                    })
                  };
                }
                return s;
              })
            };
          }
          return b;
        })
      }));
    }
    setAddingType(null);
    setNewItemName('');
    setNewResourceLink('#');
  };

  const removeQBBatch = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this batch?')) {
      if (setData) {
        setData(prev => ({
          ...prev,
          questionBank: prev.questionBank.filter(b => b.id !== id)
        }));
      }
      if (selectedBatchId === id) setSelectedBatchId(null);
    }
  };

  const removeQBSemester = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedBatchId) return;
    if (confirm('Delete this semester?')) {
      if (setData) {
        setData(prev => ({
          ...prev,
          questionBank: prev.questionBank.map(b => 
            b.id === selectedBatchId ? { ...b, semesters: b.semesters.filter(s => s.id !== id) } : b
          )
        }));
      }
      if (selectedQBSemesterId === id) setSelectedQBSemesterId(null);
    }
  };

  const removeQBCourse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedBatchId || !selectedQBSemesterId || !selectedExamId) return;
    if (confirm('Delete this course?')) {
      if (setData) {
        setData(prev => ({
          ...prev,
          questionBank: prev.questionBank.map(b => {
            if (b.id === selectedBatchId) {
              return {
                ...b,
                semesters: b.semesters.map(s => {
                  if (s.id === selectedQBSemesterId) {
                    return {
                      ...s,
                      exams: s.exams.map(e => 
                        e.id === selectedExamId ? { ...e, courses: e.courses.filter(c => c.id !== id) } : e
                      )
                    };
                  }
                  return s;
                })
              };
            }
            return b;
          })
        }));
      }
      if (selectedQBCourseId === id) setSelectedQBCourseId(null);
    }
  };

  const removeQBResource = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!selectedBatchId || !selectedQBSemesterId || !selectedExamId || !selectedQBCourseId) return;
    if (confirm('Remove this resource?')) {
      if (setData) {
        setData(prev => ({
          ...prev,
          questionBank: prev.questionBank.map(b => {
            if (b.id === selectedBatchId) {
              return {
                ...b,
                semesters: b.semesters.map(s => {
                  if (s.id === selectedQBSemesterId) {
                    return {
                      ...s,
                      exams: s.exams.map(e => {
                        if (e.id === selectedExamId) {
                          return {
                            ...e,
                            courses: e.courses.map(c => 
                              c.id === selectedQBCourseId ? { ...c, resources: c.resources.filter(r => r.id !== id) } : c
                            )
                          };
                        }
                        return e;
                      })
                    };
                  }
                  return s;
                })
              };
            }
            return b;
          })
        }));
      }
    }
  };

  const startRenaming = (id: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(id);
    setRenamingValue(currentName);
  };

  const confirmRename = () => {
    if (!renamingId || !renamingValue.trim()) {
      setRenamingId(null);
      return;
    }

    if (setData) {
      setData(prev => ({
        ...prev,
        questionBank: prev.questionBank.map(b => {
          if (b.id === renamingId) return { ...b, batchName: renamingValue.trim() };
          return {
            ...b,
            semesters: b.semesters.map(s => {
              if (s.id === renamingId) return { ...s, name: renamingValue.trim() };
              return {
                ...s,
                exams: s.exams.map(ex => ({
                  ...ex,
                  courses: ex.courses.map(c => 
                    c.id === renamingId ? { ...c, name: renamingValue.trim() } : c
                  )
                }))
              };
            })
          };
        })
      }));
    }
    setRenamingId(null);
  };

  const cancelRenaming = () => {
    setRenamingId(null);
  };

  const getDisplayInfo = () => {
    switch (category) {
      case 'sectionA': return { title: 'Section A', color: 'emerald' };
      case 'sectionB': return { title: 'Section B', color: 'emerald' };
      case 'questionBank': return { title: 'Question Bank', color: 'slate' };
      default: return { title: 'Archive', color: 'emerald' };
    }
  };

  const info = getDisplayInfo();

  const accentStyles = {
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    slate: 'text-white bg-slate-900 border-emerald-600/20 shadow-xl shadow-emerald-900/10'
  };

  const cardHoverStyles = {
    emerald: 'hover:border-emerald-600/40 group-hover:text-emerald-600',
    slate: 'hover:border-emerald-600 group-hover:text-emerald-600'
  };

  // Filter logic for standard sections
  const semesters = (!isQuestionBank && category && (category === 'sectionA' || category === 'sectionB') && data[category]) 
    ? (data[category] as Semester[]) 
    : [];

  const filteredSemesters = useMemo(() => 
    semesters.filter(sem => sem.name && sem.name.toLowerCase().includes(filterQuery.toLowerCase())), 
  [semesters, filterQuery]);

  const filteredCourses = useMemo(() => 
    selectedSemester?.courses.filter(c => c.name.toLowerCase().includes(filterQuery.toLowerCase())) || [], 
  [selectedSemester, filterQuery]);

  const filteredResources = useMemo(() => 
    selectedCourse?.resources.filter(r => r.title.toLowerCase().includes(filterQuery.toLowerCase())) || [], 
  [selectedCourse, filterQuery]);

  // Filter logic for Question Bank
  const batches = isQuestionBank ? data.questionBank : [];

  const filteredBatches = useMemo(() => 
    batches.filter(b => b.batchName.toLowerCase().includes(filterQuery.toLowerCase())),
  [batches, filterQuery]);

  const filteredQBSemesters = useMemo(() => 
    selectedBatch?.semesters.filter(s => s.name.toLowerCase().includes(filterQuery.toLowerCase())) || [],
  [selectedBatch, filterQuery]);

  const filteredExams = useMemo(() => 
    selectedQBSemester?.exams.filter(e => e.name.toLowerCase().includes(filterQuery.toLowerCase())) || [],
  [selectedQBSemester, filterQuery]);

  const filteredQBCourses = useMemo(() => 
    selectedExam?.courses.filter(c => c.name.toLowerCase().includes(filterQuery.toLowerCase())) || [],
  [selectedExam, filterQuery]);

  const filteredQBResources = useMemo(() => 
    selectedQBCourse?.resources.filter(r => r.title.toLowerCase().includes(filterQuery.toLowerCase())) || [],
  [selectedQBCourse, filterQuery]);

  if (category === 'specialLinks') {
    const flatList = data.specialLinks as Resource[];
    const filteredFlat = flatList.filter(item => item.title.toLowerCase().includes(filterQuery.toLowerCase()));
    
    return (
      <div className="py-16 bg-white min-h-screen">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex items-center gap-3 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-12">
            <Link to="/materials" className="hover:text-emerald-600 transition-colors">Library</Link>
            <ChevronRight size={12} />
            <span className={`px-4 py-1.5 rounded-full ${accentStyles.emerald}`}>Special Assets</span>
          </nav>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Remote Assets</h1>
            <SearchBar value={filterQuery} onChange={setFilterQuery} placeholder="Filter links..." />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFlat.map(item => (
              <a 
                key={item.id} 
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm transition-all group relative flex flex-col justify-between h-64 hover:border-emerald-600/40 hover:shadow-2xl hover:shadow-emerald-600/10 hover:-translate-y-2"
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div className="p-4 rounded-2xl shadow-xl bg-slate-900 text-emerald-500 border border-emerald-600/20">
                      <ExternalLink size={28} />
                    </div>
                    <span className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em]">External Link</span>
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-tight tracking-tighter">
                    {item.title}
                  </h4>
                </div>
                <div className="flex items-center justify-between mt-auto pt-8 border-t border-slate-50">
                  <div className="flex items-center gap-3 text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover:text-emerald-600 transition-colors">
                    <LinkIcon size={16} /> Visit Website
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 group-hover:bg-emerald-600 group-hover:text-white transition-all group-hover:translate-x-2">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </a>
            ))}
            {filteredFlat.length === 0 && <EmptyState message="No matching assets found." />}
          </div>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    setFilterQuery('');
    if (isQuestionBank) {
      if (selectedQBCourseId) setSelectedQBCourseId(null);
      else if (selectedExamId) setSelectedExamId(null);
      else if (selectedQBSemesterId) setSelectedQBSemesterId(null);
      else if (selectedBatchId) setSelectedBatchId(null);
      else navigate('/materials');
    } else {
      if (selectedCourseId) setSelectedCourseId(null);
      else if (selectedSemesterId) setSelectedSemesterId(null);
      else navigate('/materials');
    }
  };

  const resetQB = () => {
    setSelectedBatchId(null);
    setSelectedQBSemesterId(null);
    setSelectedExamId(null);
    setSelectedQBCourseId(null);
    setFilterQuery('');
  };

  const resetStandard = () => {
    setSelectedSemesterId(null);
    setSelectedCourseId(null);
    setFilterQuery('');
  };

  return (
    <div className="py-16 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-3 text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-12 overflow-x-auto no-scrollbar pb-3">
          <Link to="/materials" className="hover:text-emerald-600 transition-colors shrink-0">Library</Link>
          <ChevronRight size={12} className="shrink-0" />
          <button 
            onClick={isQuestionBank ? resetQB : resetStandard}
            className={`px-5 py-2 rounded-full shrink-0 transition-all font-black border ${(!isQuestionBank ? !selectedSemesterId : !selectedBatchId) ? accentStyles[info.color as keyof typeof accentStyles] : 'hover:text-emerald-600 border-transparent'}`}
          >
            {info.title}
          </button>

          {isQuestionBank ? (
            <>
              {selectedBatch && (
                <>
                  <ChevronRight size={12} className="shrink-0" />
                  <button 
                    onClick={() => { setSelectedQBSemesterId(null); setSelectedExamId(null); setSelectedQBCourseId(null); setFilterQuery(''); }}
                    className={`px-5 py-2 rounded-full shrink-0 transition-all font-black border ${!selectedQBSemesterId ? accentStyles[info.color as keyof typeof accentStyles] : 'hover:text-emerald-600 border-transparent'}`}
                  >
                    {selectedBatch.batchName}
                  </button>
                </>
              )}
              {selectedQBSemester && (
                <>
                  <ChevronRight size={12} className="shrink-0" />
                  <button 
                    onClick={() => { setSelectedExamId(null); setSelectedQBCourseId(null); setFilterQuery(''); }}
                    className={`px-5 py-2 rounded-full shrink-0 transition-all font-black border ${!selectedExamId ? accentStyles[info.color as keyof typeof accentStyles] : 'hover:text-emerald-600 border-transparent'}`}
                  >
                    {selectedQBSemester.name}
                  </button>
                </>
              )}
              {selectedExam && (
                <>
                  <ChevronRight size={12} className="shrink-0" />
                  <button 
                    onClick={() => { setSelectedQBCourseId(null); setFilterQuery(''); }}
                    className={`px-5 py-2 rounded-full shrink-0 transition-all font-black border ${!selectedQBCourseId ? accentStyles[info.color as keyof typeof accentStyles] : 'hover:text-emerald-600 border-transparent'}`}
                  >
                    {selectedExam.name}
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              {selectedSemester && (
                <>
                  <ChevronRight size={12} className="shrink-0" />
                  <button 
                    onClick={() => { setSelectedCourseId(null); setFilterQuery(''); }}
                    className={`px-5 py-2 rounded-full shrink-0 transition-all font-black border ${!selectedCourseId ? accentStyles[info.color as keyof typeof accentStyles] : 'hover:text-emerald-600 border-transparent'}`}
                  >
                    {selectedSemester.name}
                  </button>
                </>
              )}
            </>
          )}
        </nav>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-20">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter leading-none">
              {isQuestionBank ? (
                !selectedBatch ? 'Batches' : !selectedQBSemester ? 'Semesters' : !selectedExam ? 'Exams' : !selectedQBCourse ? 'Courses' : selectedQBCourse.name
              ) : (
                !selectedSemester ? `Semesters` : !selectedCourse ? `Courses` : selectedCourse.name
              )}
            </h1>
            <p className="text-slate-400 font-bold text-base tracking-tight">
              {isQuestionBank ? (
                !selectedBatch ? 'Select a batch to browse its question bank.' : !selectedQBSemester ? `Browsing semesters for ${selectedBatch.batchName}.` : !selectedExam ? `Select exam type for ${selectedQBSemester.name}.` : !selectedQBCourse ? `Select a course from ${selectedExam.name}.` : `Browsing resources for ${selectedQBCourse.name}.`
              ) : (
                !selectedSemester ? `Select a semester to access ${info.title} modules.` : !selectedCourse ? `Review active modules for ${selectedSemester.name}.` : `Browsing resources for ${selectedCourse.name}.`
              )}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 relative z-30">
            {isQuestionBank && (
              <div className="flex flex-col sm:flex-row items-stretch gap-4">
                {!isAuthorized && showLoginPrompt ? (
                  <form onSubmit={handleVerifyPassphrase} className="flex items-center gap-2 bg-slate-900 p-2 rounded-3xl border-2 border-emerald-600/30 shadow-2xl">
                    <input 
                      type="password" 
                      placeholder="Enter Passphrase"
                      autoFocus
                      className="bg-transparent border-none focus:ring-0 text-white font-bold text-xs px-4 w-32 md:w-40"
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                    />
                    <button 
                      type="submit"
                      className="bg-emerald-600 text-white px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all"
                    >
                      Verify
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowLoginPrompt(false)}
                      className="p-2 text-slate-400 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </form>
                ) : (
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      handleQBLogin();
                    }}
                    className={`flex items-center justify-center gap-3 px-8 py-5 rounded-3xl font-black text-xs uppercase tracking-widest transition-all shadow-2xl active:scale-95 cursor-pointer border-2 ${isAuthorized ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/20' : 'bg-slate-900 text-slate-400 border-emerald-600/10 hover:border-emerald-600 hover:text-emerald-400 shadow-slate-900/20'}`}
                  >
                    {isAuthorized ? <Unlock size={20} className="text-emerald-100" /> : <Lock size={20} />} 
                    {isAuthorized ? 'Authorized Access' : 'Enter Edit Mode'}
                  </button>
                )}
              </div>
            )}

            <SearchBar 
              value={filterQuery} 
              onChange={setFilterQuery} 
              placeholder="Search..." 
            />

            <button 
              onClick={handleBack}
              className="flex items-center justify-center gap-2 px-8 py-5 bg-white text-slate-900 border-2 border-slate-100 rounded-3xl font-black text-xs uppercase tracking-widest hover:border-emerald-600 hover:text-emerald-600 transition-all shadow-sm active:scale-95"
            >
              <ChevronLeft size={20} /> Back
            </button>
          </div>
        </div>

        {/* CONTENT RENDERING */}
        {isQuestionBank ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* QB STAGE 1: BATCHES */}
            {!selectedBatch && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {isAuthorized && (
                  <div className={`group p-12 rounded-[4rem] border-4 border-dashed transition-all flex flex-col items-center justify-center ${addingType === 'batch' ? 'border-emerald-600 bg-emerald-50/30' : 'border-emerald-600/20 bg-white hover:border-emerald-600 hover:bg-emerald-50/50'}`}>
                    {addingType === 'batch' ? (
                      <div className="w-full space-y-4">
                        <input 
                          type="text" 
                          placeholder="Batch Name (e.g. 58)"
                          autoFocus
                          className="w-full bg-white border-2 border-emerald-100 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:border-emerald-600 focus:ring-0 outline-none shadow-inner"
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button onClick={confirmAddBatch} className="flex-grow bg-emerald-600 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-900/10">Add</button>
                          <button onClick={() => setAddingType(null)} className="px-4 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-200"><X size={16}/></button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setAddingType('batch')}
                        className="flex flex-col items-center"
                      >
                        <div className="w-20 h-20 bg-emerald-600 text-white rounded-3xl flex items-center justify-center shadow-xl mb-6 group-hover:scale-110 transition-transform">
                          <Plus size={40} />
                        </div>
                        <span className="text-xl font-black text-emerald-600 uppercase tracking-widest">Add Batch</span>
                      </button>
                    )}
                  </div>
                )}
                {filteredBatches.map(batch => (
                  <button 
                    key={batch.id}
                    onClick={() => { setSelectedBatchId(batch.id); setFilterQuery(''); }}
                    className="group bg-slate-50 p-16 rounded-[4rem] border border-slate-100 shadow-sm transition-all hover:shadow-2xl hover:shadow-emerald-600/10 hover:-translate-y-2 text-center hover:bg-white relative overflow-hidden"
                  >
                    {isAuthorized && (
                      <div className="absolute top-4 right-4 flex gap-2 z-10">
                        <button onClick={(e) => startRenaming(batch.id, batch.batchName, e)} className="p-2 bg-white/80 backdrop-blur rounded-lg text-slate-400 hover:text-emerald-600 border border-slate-100"><Edit2 size={14}/></button>
                        <button onClick={(e) => removeQBBatch(batch.id, e)} className="p-2 bg-white/80 backdrop-blur rounded-lg text-slate-400 hover:text-rose-600 border border-slate-100"><Trash2 size={14}/></button>
                      </div>
                    )}
                    <div className={`w-24 h-24 mx-auto mb-8 rounded-[2.2rem] flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-2xl ${accentStyles.slate}`}>
                      <Sparkles size={48} />
                    </div>
                    {renamingId === batch.id ? (
                      <div className="flex flex-col gap-2" onClick={e => e.stopPropagation()}>
                        <input 
                          type="text"
                          value={renamingValue}
                          autoFocus
                          className="w-full bg-white border-2 border-emerald-600/20 rounded-xl px-4 py-2 font-bold text-center"
                          onChange={e => setRenamingValue(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') confirmRename();
                            if (e.key === 'Escape') cancelRenaming();
                          }}
                        />
                        <div className="flex gap-2 justify-center">
                          <button onClick={confirmRename} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase">Save</button>
                          <button onClick={cancelRenaming} className="px-4 py-2 bg-slate-100 text-slate-400 rounded-lg text-[10px] font-black uppercase">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{batch.batchName}</h3>
                    )}
                    <div className="mt-8 flex items-center justify-center gap-2 text-[11px] font-black text-emerald-600 uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">
                      {batch.semesters.length} Semesters <ChevronRight size={14} />
                    </div>
                  </button>
                ))}
                {filteredBatches.length === 0 && !isAuthorized && <EmptyState message="No batches found." />}
              </div>
            )}

            {/* QB STAGE 2: SEMESTERS */}
            {selectedBatch && !selectedQBSemester && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {isAuthorized && (
                  <div className={`group p-12 rounded-[4rem] border-4 border-dashed transition-all flex flex-col items-center justify-center ${addingType === 'semester' ? 'border-emerald-600 bg-emerald-50/30' : 'border-emerald-600/20 bg-white hover:border-emerald-600 hover:bg-emerald-50/50'}`}>
                    {addingType === 'semester' ? (
                      <div className="w-full space-y-4">
                        <input 
                          type="text" 
                          placeholder="Semester Name"
                          autoFocus
                          className="w-full bg-white border-2 border-emerald-100 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:border-emerald-600 focus:ring-0 outline-none shadow-inner"
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button onClick={confirmAddSemester} className="flex-grow bg-emerald-600 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-900/10">Add</button>
                          <button onClick={() => setAddingType(null)} className="px-4 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-200"><X size={16}/></button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setAddingType('semester')}
                        className="flex flex-col items-center"
                      >
                        <div className="w-20 h-20 bg-emerald-600 text-white rounded-3xl flex items-center justify-center shadow-xl mb-6 group-hover:scale-110 transition-transform">
                          <Plus size={40} />
                        </div>
                        <span className="text-xl font-black text-emerald-600 uppercase tracking-widest">Add Semester</span>
                      </button>
                    )}
                  </div>
                )}
                {filteredQBSemesters.map(sem => (
                  <button 
                    key={sem.id}
                    onClick={() => { setSelectedQBSemesterId(sem.id); setFilterQuery(''); }}
                    className="group bg-slate-50 p-16 rounded-[4rem] border border-slate-100 shadow-sm transition-all hover:shadow-2xl hover:shadow-emerald-600/10 hover:-translate-y-2 text-center hover:bg-white relative overflow-hidden"
                  >
                    {isAuthorized && (
                      <div className="absolute top-4 right-4 flex gap-2 z-10">
                        <button onClick={(e) => startRenaming(sem.id, sem.name, e)} className="p-2 bg-white/80 backdrop-blur rounded-lg text-slate-400 hover:text-emerald-600 border border-slate-100"><Edit2 size={14}/></button>
                        <button onClick={(e) => removeQBSemester(sem.id, e)} className="p-2 bg-white/80 backdrop-blur rounded-lg text-slate-400 hover:text-rose-600 border border-slate-100"><Trash2 size={14}/></button>
                      </div>
                    )}
                    <div className={`w-24 h-24 mx-auto mb-8 rounded-[2.2rem] flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-2xl ${accentStyles.slate}`}>
                      <Calendar size={48} />
                    </div>
                    {renamingId === sem.id ? (
                      <div className="flex flex-col gap-2" onClick={e => e.stopPropagation()}>
                        <input 
                          type="text"
                          value={renamingValue}
                          autoFocus
                          className="w-full bg-white border-2 border-emerald-600/20 rounded-xl px-4 py-2 font-bold text-center"
                          onChange={e => setRenamingValue(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') confirmRename();
                            if (e.key === 'Escape') cancelRenaming();
                          }}
                        />
                        <div className="flex gap-2 justify-center">
                          <button onClick={confirmRename} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase">Save</button>
                          <button onClick={cancelRenaming} className="px-4 py-2 bg-slate-100 text-slate-400 rounded-lg text-[10px] font-black uppercase">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{sem.name}</h3>
                    )}
                    <div className="mt-8 flex items-center justify-center gap-2 text-[11px] font-black text-emerald-600 uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">
                      {sem.exams.length} Exam Types <ChevronRight size={14} />
                    </div>
                  </button>
                ))}
                {filteredQBSemesters.length === 0 && !isAuthorized && <EmptyState message="No semesters found." />}
              </div>
            )}

            {/* QB STAGE 3: EXAM TYPES */}
            {selectedQBSemester && !selectedExam && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {filteredExams.map(exam => (
                  <button 
                    key={exam.id}
                    onClick={() => { setSelectedExamId(exam.id); setFilterQuery(''); }}
                    className="group bg-slate-50 p-16 rounded-[4rem] border border-slate-100 shadow-sm transition-all hover:shadow-2xl hover:shadow-emerald-600/10 hover:-translate-y-2 text-center hover:bg-white"
                  >
                    <div className={`w-24 h-24 mx-auto mb-8 rounded-[2.2rem] flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-2xl ${accentStyles.slate}`}>
                      <FileSearch size={48} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{exam.name}</h3>
                    <div className="mt-8 flex items-center justify-center gap-2 text-[11px] font-black text-emerald-600 uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">
                      {exam.courses.length} Courses <ChevronRight size={14} />
                    </div>
                  </button>
                ))}
                {filteredExams.length === 0 && <EmptyState message="No exams found." />}
              </div>
            )}

            {/* QB STAGE 4: COURSES */}
            {selectedExam && !selectedQBCourse && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {isAuthorized && (
                  <div className={`group p-8 rounded-[3rem] border-4 border-dashed transition-all flex flex-col items-center justify-center min-h-[140px] ${addingType === 'course' ? 'border-emerald-600 bg-emerald-50/30' : 'border-emerald-600/20 bg-white hover:border-emerald-600 hover:bg-emerald-50/50'}`}>
                    {addingType === 'course' ? (
                      <div className="w-full space-y-3">
                        <input 
                          type="text" 
                          placeholder="Course Name"
                          autoFocus
                          className="w-full bg-white border-2 border-emerald-100 rounded-xl px-4 py-3 font-bold text-slate-900 focus:border-emerald-600 focus:ring-0 outline-none"
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button onClick={confirmAddCourse} className="flex-grow bg-emerald-600 text-white py-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700">Add</button>
                          <button onClick={() => setAddingType(null)} className="px-3 bg-slate-100 text-slate-400 rounded-lg hover:bg-slate-200"><X size={14}/></button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setAddingType('course')}
                        className="flex items-center gap-6"
                      >
                        <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-xl shrink-0 group-hover:scale-110 transition-transform">
                          <Plus size={32} />
                        </div>
                        <span className="text-lg font-black text-emerald-600 uppercase tracking-widest">Add Course</span>
                      </button>
                    )}
                  </div>
                )}
                {filteredQBCourses.map(course => (
                  <button 
                    key={course.id}
                    onClick={() => { setSelectedQBCourseId(course.id); setFilterQuery(''); }}
                    className="group bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm transition-all hover:border-emerald-600/30 hover:shadow-2xl hover:shadow-emerald-600/5 text-left flex items-center justify-between relative overflow-hidden"
                  >
                    <div className="flex items-center gap-6">
                      <div className={`p-5 rounded-2xl transition-transform group-hover:scale-110 shadow-lg ${accentStyles.slate}`}>
                        <Book size={28} />
                      </div>
                      <div>
                        {renamingId === course.id ? (
                          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                            <input 
                              type="text"
                              value={renamingValue}
                              autoFocus
                              className="bg-white border-2 border-emerald-600/20 rounded-xl px-4 py-2 font-bold text-sm"
                              onChange={e => setRenamingValue(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') confirmRename();
                                if (e.key === 'Escape') cancelRenaming();
                              }}
                            />
                            <button onClick={confirmRename} className="p-2 bg-emerald-600 text-white rounded-lg"><X size={12} className="rotate-45"/></button>
                          </div>
                        ) : (
                          <>
                            <h3 className="font-black text-slate-900 line-clamp-1 text-lg tracking-tight">{course.name}</h3>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">{course.resources.length} Files</p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {isAuthorized && (
                        <div className="flex gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => startRenaming(course.id, course.name, e)} className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-emerald-600"><Edit2 size={14}/></button>
                          <button onClick={(e) => removeQBCourse(course.id, e)} className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-rose-600"><Trash2 size={14}/></button>
                        </div>
                      )}
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </button>
                ))}
                {filteredQBCourses.length === 0 && !isAuthorized && <EmptyState message="No courses found." />}
              </div>
            )}

            {/* QB STAGE 5: RESOURCES */}
            {selectedQBCourse && (
              <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-900/5 divide-y divide-slate-100">
                {isAuthorized && (
                  <div className={`p-8 ${addingType === 'resource' ? 'bg-emerald-50/50' : 'bg-emerald-50'}`}>
                    {addingType === 'resource' ? (
                      <div className="max-w-xl mx-auto space-y-4 animate-in slide-in-from-top-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input 
                            type="text" 
                            placeholder="Resource Name (e.g. Mid 2022)"
                            autoFocus
                            className="bg-white border-2 border-emerald-100 rounded-xl px-4 py-3 font-bold text-slate-900 focus:border-emerald-600 focus:ring-0 outline-none"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                          />
                          <input 
                            type="text" 
                            placeholder="Link (URL)"
                            className="bg-white border-2 border-emerald-100 rounded-xl px-4 py-3 font-bold text-slate-900 focus:border-emerald-600 focus:ring-0 outline-none"
                            value={newResourceLink}
                            onChange={(e) => setNewResourceLink(e.target.value)}
                          />
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex gap-2 p-1 bg-white/50 rounded-xl border border-emerald-100">
                            <button onClick={() => setNewResourceType('PDF')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${newResourceType === 'PDF' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>PDF</button>
                            <button onClick={() => setNewResourceType('Slide')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${newResourceType === 'Slide' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Slide</button>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={confirmAddResource} className="bg-emerald-600 text-white px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-900/10">Confirm Add</button>
                            <button onClick={() => setAddingType(null)} className="px-4 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-200"><X size={16}/></button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setAddingType('resource')}
                        className="w-full flex items-center justify-center gap-4 text-emerald-600 font-black uppercase tracking-widest hover:scale-105 transition-all"
                      >
                        <Plus size={24} /> Add Resource File
                      </button>
                    )}
                  </div>
                )}
                {filteredQBResources.map(item => (
                  <div key={item.id} className="relative group/item">
                    <ResourceListItem item={item} />
                    {isAuthorized && (
                      <button 
                        onClick={(e) => removeQBResource(item.id, e)}
                        className="absolute top-1/2 right-20 -translate-y-1/2 p-4 bg-rose-50 text-rose-500 rounded-2xl opacity-0 group-hover/item:opacity-100 transition-all hover:bg-rose-500 hover:text-white z-20"
                      >
                        <Trash2 size={24} />
                      </button>
                    )}
                  </div>
                ))}
                {filteredQBResources.length === 0 && !isAuthorized && <EmptyState message="No resources match your query." />}
              </div>
            )}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* STANDARD STAGE 1: SEMESTERS */}
            {!selectedSemester && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {filteredSemesters.map(sem => (
                  <button 
                    key={sem.id}
                    onClick={() => { setSelectedSemesterId(sem.id); setFilterQuery(''); }}
                    className="group bg-slate-50 p-16 rounded-[4rem] border border-slate-100 shadow-sm transition-all hover:shadow-2xl hover:shadow-emerald-600/10 hover:-translate-y-2 text-center hover:bg-white"
                  >
                    <div className={`w-24 h-24 mx-auto mb-8 rounded-[2.2rem] flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-2xl ${accentStyles[info.color as keyof typeof accentStyles]}`}>
                      <Calendar size={48} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{sem.name}</h3>
                    <div className="mt-8 flex items-center justify-center gap-2 text-[11px] font-black text-emerald-600 uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">
                      {sem.courses.length} Units <ChevronRight size={14} />
                    </div>
                  </button>
                ))}
                {filteredSemesters.length === 0 && <EmptyState message="No matching semesters." />}
              </div>
            )}

            {/* STANDARD STAGE 2: COURSES */}
            {selectedSemester && !selectedCourse && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map(course => (
                  <button 
                    key={course.id}
                    onClick={() => { setSelectedCourseId(course.id); setFilterQuery(''); }}
                    className="group bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm transition-all hover:border-emerald-600/30 hover:shadow-2xl hover:shadow-emerald-600/5 text-left flex items-center justify-between"
                  >
                    <div className="flex items-center gap-6">
                      <div className={`p-5 rounded-2xl transition-transform group-hover:scale-110 shadow-lg ${accentStyles[info.color as keyof typeof accentStyles]}`}>
                        <Book size={28} />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 line-clamp-1 text-lg tracking-tight">{course.name}</h3>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">{course.resources.length} Files</p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                      <ChevronRight size={20} />
                    </div>
                  </button>
                ))}
                {filteredCourses.length === 0 && <EmptyState message="No modules available." />}
              </div>
            )}

            {/* STANDARD STAGE 3: RESOURCES */}
            {selectedCourse && (
              <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-900/5 divide-y divide-slate-100">
                {filteredResources.map(item => (
                  <ResourceListItem key={item.id} item={item} />
                ))}
                {filteredResources.length === 0 && <EmptyState message="No resources match your query." />}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const SearchBar: React.FC<{ value: string; onChange: (v: string) => void; placeholder: string }> = ({ value, onChange, placeholder }) => (
  <div className="relative w-full sm:w-80 group">
    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-300 group-focus-within:text-emerald-600 transition-colors">
      <Filter size={20} />
    </div>
    <input 
      type="text"
      placeholder={placeholder}
      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-12 text-sm font-black text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600/20 transition-all outline-none"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    {value && (
      <button 
        onClick={() => onChange('')} 
        className="absolute inset-y-0 right-4 flex items-center text-slate-300 hover:text-emerald-600 p-2 transition-colors"
      >
        <X size={18} />
      </button>
    )}
  </div>
);

const ResourceListItem: React.FC<{ item: Resource }> = ({ item }) => (
  <Link 
    to={`/resource/${item.id}`}
    className="flex items-center justify-between p-6 md:p-8 hover:bg-slate-50 transition-all group px-8 md:px-12"
  >
    <div className="flex items-center gap-5 md:gap-8">
      <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl shadow-xl group-hover:scale-110 transition-transform shrink-0 ${
        item.type === 'Slide' ? 'bg-slate-900 text-emerald-500 border border-emerald-600/20' : 'bg-emerald-600 text-white'
      }`}>
        {item.type === 'Slide' ? <Monitor size={22} className="md:w-7 md:h-7" /> : <FileText size={22} className="md:w-7 md:h-7" />}
      </div>
      <div>
        <h4 className="text-base md:text-2xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1 leading-tight tracking-tighter capitalize">
          {item.title}
        </h4>
        <div className="flex items-center gap-3 mt-1.5 md:mt-2">
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">{item.type}</span>
          <div className="w-1 h-1 rounded-full bg-slate-200"></div>
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0">Open File</span>
        </div>
      </div>
    </div>
    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-emerald-600 group-hover:text-white transition-all group-hover:translate-x-2 shrink-0">
      <ChevronRight size={24} />
    </div>
  </Link>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="col-span-full py-24 text-center bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200">
    <FileSearch size={72} className="mx-auto text-slate-200 mb-8" />
    <p className="text-slate-400 font-black text-xl tracking-tighter">{message}</p>
    <p className="text-slate-300 text-sm mt-3 font-bold">Refine your search parameters or check another section.</p>
  </div>
);

export default SectionMaterialsPage;