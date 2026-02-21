import React from 'react';
import { PenTool, FileText } from 'lucide-react';

interface Props {
  title: string;
  content: string;
  onTitleChange: (val: string) => void;
  onContentChange: (val: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  disabled: boolean;
}

const BlogInputForm: React.FC<Props> = ({ title, content, onTitleChange, onContentChange, onSubmit, isLoading, disabled }) => {
  return (
    <div className="bg-brand-dark p-6 rounded-xl border border-zinc-800 shadow-xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <span className="w-1 h-6 bg-brand-red rounded-full mr-3"></span>
          Blog Details
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Blog Title</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PenTool className="h-4 w-4 text-zinc-600" />
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="e.g., 10 Tips for Minimalist Living"
                className="block w-full pl-10 pr-3 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Content / Excerpt</label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <FileText className="h-4 w-4 text-zinc-600" />
              </div>
              <textarea
                value={content}
                onChange={(e) => onContentChange(e.target.value)}
                rows={6}
                placeholder="Paste your blog post content or a detailed summary here..."
                className="block w-full pl-10 pr-3 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all custom-scrollbar resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={disabled || isLoading}
        className={`
          w-full py-4 rounded-lg font-bold text-lg uppercase tracking-wider transition-all duration-300
          ${disabled 
            ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
            : 'bg-brand-red hover:bg-red-700 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] active:scale-[0.98]'}
        `}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating Magic...
          </span>
        ) : (
          'Generate Pin Prompts'
        )}
      </button>
    </div>
  );
};

export default BlogInputForm;
