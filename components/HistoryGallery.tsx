
import React from 'react';
import { HistoryItem } from '../types';
import { Download, Trash2, Clock, Image as ImageIcon } from 'lucide-react';

interface HistoryGalleryProps {
  history: HistoryItem[];
  onDelete: (id: string) => void;
  onClear: () => void;
  t: any;
}

const HistoryGallery: React.FC<HistoryGalleryProps> = ({ history, onDelete, onClear, t }) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 mt-6 sm:mt-8 border-t border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="text-blue-500 dark:text-blue-400 w-5 h-5 sm:w-6 sm:h-6" />
          {t.history_title}
        </h3>
        <button
          onClick={onClear}
          className="text-xs text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 flex items-center gap-1 transition-colors bg-slate-100 dark:bg-slate-800/50 px-2 py-1 rounded"
        >
          <Trash2 size={12} /> {t.clear_all}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {history.map((item) => (
          <div 
            key={item.id} 
            className="group relative bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10 flex flex-row sm:flex-col"
          >
            {/* Image Container */}
            <div className="w-1/3 sm:w-full aspect-[16/9] bg-slate-100 dark:bg-slate-900 relative overflow-hidden sm:aspect-video">
              <img 
                src={item.imageUrl} 
                alt={item.mainText} 
                className="w-full h-full object-cover sm:transition-transform sm:duration-500 sm:group-hover:scale-105"
                loading="lazy"
              />
              
              {/* Overlay Actions (Desktop) */}
              <div className="hidden sm:flex absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center gap-3 backdrop-blur-[2px]">
                <a 
                  href={item.imageUrl} 
                  download={`history_thumbnail-${item.id}.png`}
                  className="p-2 bg-white text-slate-900 rounded-full hover:bg-blue-50 transition-colors shadow-md"
                  title="Download"
                >
                  <Download size={18} />
                </a>
                <button
                  onClick={() => onDelete(item.id)}
                  className="p-2 bg-red-500/20 text-red-200 border border-red-500/50 rounded-full hover:bg-red-500 hover:text-white transition-colors backdrop-blur-sm"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Meta Info */}
            <div className="p-3 w-2/3 sm:w-full flex flex-col justify-between">
              <div>
                <p className="text-slate-900 dark:text-white font-medium text-sm truncate" title={item.mainText}>
                  {item.mainText || "Untitled Thumbnail"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                   <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                    <ImageIcon size={10} /> {item.aspectRatio}
                  </span>
                </div>
              </div>

              {/* Mobile Actions */}
              <div className="flex sm:hidden items-center justify-end gap-3 mt-2">
                <a 
                  href={item.imageUrl} 
                  download={`history_thumbnail-${item.id}.png`}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <Download size={16} />
                </a>
                <button
                  onClick={() => onDelete(item.id)}
                  className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                >
                  <Trash2 size={16} />
                </button>
              </div>

               <div className="hidden sm:flex items-center justify-between mt-1">
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryGallery;
