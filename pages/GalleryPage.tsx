import React, { useState } from 'react';
import { Camera, Layers, X, Maximize2, ImageOff, Filter, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { GalleryAlbum } from '../types';

interface GalleryPageProps {
  albums: GalleryAlbum[];
}

const GalleryPage: React.FC<GalleryPageProps> = ({ albums }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<{albumId: string, index: number} | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Helper to convert Google Drive links to direct image links
  const resolveImageUrl = (url: string) => {
    if (!url) return '';
    const trimmedUrl = url.trim();
    
    // Google Drive / Docs
    if (trimmedUrl.includes('drive.google.com') || trimmedUrl.includes('docs.google.com')) {
      const id = trimmedUrl.match(/\/d\/([^/?#\s]+)/)?.[1] || trimmedUrl.match(/[?&]id=([^&\s]+)/)?.[1];
      // Using thumbnail endpoint which is often more reliable for public embedding
      if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
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
      if (srcMatch) return resolveImageUrl(srcMatch[1]);
    }

    return trimmedUrl;
  };

  const categories = ['All', ...albums.map(a => a.category)];
  const filteredAlbums = (activeCategory === 'All' 
    ? albums 
    : albums.filter(a => a.category === activeCategory))
    .map(album => ({
      ...album,
      images: album.images.filter(img => img.trim() !== '')
    }));

  const currentAlbum = selectedImageIndex ? filteredAlbums.find(a => a.id === selectedImageIndex.albumId) : null;
  const currentImageUrl = currentAlbum && selectedImageIndex ? resolveImageUrl(currentAlbum.images[selectedImageIndex.index]) : null;

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!selectedImageIndex || !currentAlbum) return;
    
    let newIndex = direction === 'next' ? selectedImageIndex.index + 1 : selectedImageIndex.index - 1;
    
    if (newIndex >= currentAlbum.images.length) newIndex = 0;
    if (newIndex < 0) newIndex = currentAlbum.images.length - 1;
    
    setSelectedImageIndex({ ...selectedImageIndex, index: newIndex });
  };

  return (
    <div className="py-12 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10 md:mb-12">
          <div className="inline-flex p-2.5 md:p-3 bg-emerald-50 text-emerald-600 rounded-xl md:rounded-2xl mb-4 shadow-sm">
            <Camera size={24} className="md:w-8 md:h-8" />
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">Memory Lane</h1>
          <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto">Capturing the journey of Textile Batch 58.</p>
        </div>

        {/* Category Filter */}
        <div className="flex items-center justify-center gap-2 mb-12 overflow-x-auto no-scrollbar py-2">
          <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-100">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeCategory === cat 
                    ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Content */}
        <div className="space-y-10 md:space-y-12">
          {filteredAlbums.length === 0 ? (
            <div className="text-center py-12 md:py-16 bg-slate-50 rounded-[1.5rem] md:rounded-[2rem] border-2 border-dashed border-slate-100">
              <ImageOff size={32} className="mx-auto text-slate-300 mb-3 md:w-10 md:h-10" />
              <p className="text-slate-400 text-xs md:text-sm font-bold">No photos found in this category.</p>
            </div>
          ) : (
            filteredAlbums.map((album) => (
              <div key={album.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <div className="p-2 bg-slate-900 text-white rounded-lg md:rounded-xl shadow-md">
                    <Layers size={14} className="md:w-4 md:h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-black text-slate-900 leading-none">{album.category}</h2>
                    <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 block">
                      {album.images.length} Photos
                    </span>
                  </div>
                  <div className="h-px bg-gradient-to-r from-slate-100 to-transparent flex-grow"></div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 md:gap-3">
                  {album.images.map((img, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setSelectedImageIndex({ albumId: album.id, index: idx })}
                      className="group relative overflow-visible rounded-lg md:rounded-xl bg-slate-50 aspect-square shadow-sm transition-all duration-300 cursor-zoom-in border border-slate-100 hover:z-50"
                    >
                      <div className="w-full h-full overflow-hidden rounded-lg md:rounded-xl group-hover:scale-150 group-hover:shadow-2xl group-hover:shadow-emerald-900/40 transition-all duration-300">
                        <img 
                          src={resolveImageUrl(img)} 
                          alt={`${album.category} ${idx}`} 
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=Invalid+Link';
                          }}
                        />
                      </div>
                      <div className="absolute inset-0 bg-emerald-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none rounded-lg md:rounded-xl group-hover:scale-150">
                        <Maximize2 size={12} className="text-white shadow-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImageIndex && currentImageUrl && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300"
          onClick={() => setSelectedImageIndex(null)}
        >
          {/* Controls */}
          <div className="absolute top-6 right-6 flex items-center gap-3 z-[110]">
            <a 
              href={currentImageUrl} 
              download 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <Download size={24} />
            </a>
            <button 
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
              onClick={() => setSelectedImageIndex(null)}
            >
              <X size={28} />
            </button>
          </div>

          {/* Navigation Buttons */}
          <button 
            className="absolute left-4 md:left-8 p-4 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all z-[110] hidden md:block"
            onClick={(e) => { e.stopPropagation(); navigateImage('prev'); }}
          >
            <ChevronLeft size={40} />
          </button>
          
          <button 
            className="absolute right-4 md:right-8 p-4 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all z-[110] hidden md:block"
            onClick={(e) => { e.stopPropagation(); navigateImage('next'); }}
          >
            <ChevronRight size={40} />
          </button>
          
          <div className="relative max-w-5xl w-full h-full flex items-center justify-center group">
            <img 
              src={currentImageUrl} 
              alt="Preview" 
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-300" 
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Mobile Navigation Overlay */}
            <div className="absolute inset-0 flex md:hidden">
              <div className="w-1/2 h-full" onClick={(e) => { e.stopPropagation(); navigateImage('prev'); }}></div>
              <div className="w-1/2 h-full" onClick={(e) => { e.stopPropagation(); navigateImage('next'); }}></div>
            </div>
          </div>
          
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <div className="px-6 py-2 bg-white/10 backdrop-blur-xl rounded-full text-white text-xs font-black uppercase tracking-widest border border-white/10">
              {currentAlbum?.category} • {selectedImageIndex.index + 1} / {currentAlbum?.images.length}
            </div>
            <div className="text-white/30 text-[9px] font-black uppercase tracking-[0.3em] mt-2">
              Tap sides to navigate • Click anywhere to close
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;