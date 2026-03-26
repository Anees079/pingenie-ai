import React, { useState } from 'react';
import { PenTool, FileText, Link as LinkIcon, DownloadCloud } from 'lucide-react';

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
  const [docUrl, setDocUrl] = useState('');
  const [isFetchingDoc, setIsFetchingDoc] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);

  const handleFetchDoc = async () => {
    if (!docUrl) return;
    
    setIsFetchingDoc(true);
    setDocError(null);
    
    try {
      const urls = docUrl.split('\n').map(u => u.trim()).filter(u => u);
      if (urls.length === 0) return;

      const results = await Promise.all(urls.map(async (url) => {
        const match = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
        if (!match || !match[1]) {
          throw new Error(`Invalid Google Docs URL: ${url}`);
        }
        const docId = match[1];
        
        const txtTargetUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;
        const htmlTargetUrl = `https://docs.google.com/document/d/${docId}/export?format=html`;

        const fetchWithProxy = async (targetUrl: string) => {
          const proxies = [
            `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`,
            `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
            `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`
          ];

          let lastError = null;
          for (const proxy of proxies) {
            try {
              const res = await fetch(proxy);
              if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
              
              if (proxy.includes('allorigins.win/get')) {
                const data = await res.json();
                if (data.contents !== null) return data.contents;
              } else {
                return await res.text();
              }
            } catch (e) {
              lastError = e;
              console.warn(`Proxy ${proxy} failed:`, e);
            }
          }
          throw lastError || new Error('All proxies failed');
        };

        const [text, html] = await Promise.all([
          fetchWithProxy(txtTargetUrl),
          fetchWithProxy(htmlTargetUrl)
        ]);

        if (text.trim().toLowerCase().startsWith('<!doctype html>')) {
          throw new Error(`Document is not public or requires login: ${url}`);
        }

        const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
        let title = titleMatch && titleMatch[1] ? titleMatch[1].trim() : '';

        if (!title || title === 'Google Docs') {
          const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
          if (lines.length > 0) {
            title = lines[0];
          }
        }

        return { title, content: text };
      }));
      
      if (results.length === 1) {
        if (results[0].title) {
          onTitleChange(results[0].title);
        }
        onContentChange(results[0].content);
      } else {
        // Multiple docs
        const combinedTitle = results.map((r, i) => `Doc ${i + 1}: ${r.title || 'Untitled'}`).join(' | ');
        const combinedContent = results.map((r, i) => `--- Document ${i + 1}: ${r.title || 'Untitled'} ---\n${r.content}`).join('\n\n');
        
        onTitleChange(combinedTitle);
        onContentChange(combinedContent);
      }
      
      setDocUrl(''); // Clear after successful fetch
    } catch (err: any) {
      setDocError(err.message || 'Failed to fetch documents. Make sure they are public.');
    } finally {
      setIsFetchingDoc(false);
    }
  };

  return (
    <div className="bg-brand-dark p-6 rounded-xl border border-zinc-800 shadow-xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <span className="w-1 h-6 bg-brand-red rounded-full mr-3"></span>
            Blog Details
          </div>
        </h3>
        
        <div className="space-y-4">
          <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800/50 mb-6">
            <label className="block text-sm font-medium text-zinc-400 mb-2">Import from Google Docs (Public, one link per line)</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <LinkIcon className="h-4 w-4 text-zinc-600" />
                </div>
                <textarea
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  placeholder="https://docs.google.com/document/d/...&#10;https://docs.google.com/document/d/..."
                  rows={3}
                  className="block w-full pl-10 pr-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all custom-scrollbar resize-none"
                />
              </div>
              <button
                onClick={handleFetchDoc}
                disabled={isFetchingDoc || !docUrl}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-start pt-3 gap-2 h-auto"
              >
                {isFetchingDoc ? (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <DownloadCloud className="h-4 w-4" />
                )}
                Fetch
              </button>
            </div>
            {docError && <p className="text-brand-red text-xs mt-2">{docError}</p>}
          </div>

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
