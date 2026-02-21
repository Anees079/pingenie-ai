import React, { useState } from 'react';
import { GeneratedPrompt } from '../types';
import { Copy, Check, Palette, Type as TypeIcon, Droplet, WholeWord, Hash, Search, AlignLeft, Sparkles } from 'lucide-react';

interface Props {
  prompt: GeneratedPrompt;
  index: number;
  onGenerateDescription: () => void;
}

const ResultCard: React.FC<Props> = ({ prompt, index, onGenerateDescription }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const fullText = `IMAGE OVERLAY TEXT: ${prompt.overlayText}

FONT STYLE: ${prompt.fontStyle}
TEXT COLOR: ${prompt.textColor}

VISUAL PROMPT:
${prompt.visualStyle}`;
    
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="group relative bg-brand-dark rounded-xl border border-zinc-800 overflow-hidden hover:border-brand-red hover:shadow-[0_0_20px_rgba(220,38,38,0.2)] transition-all duration-300"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-red to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="p-6 space-y-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 text-brand-red font-bold text-sm">
              {index + 1}
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">Concept</span>
            </div>
          </div>
          <button
            onClick={handleCopy}
            className="text-zinc-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-zinc-800"
            title="Copy Visual Prompt Details"
          >
            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>

        <div className="space-y-4">
          
          {/* SEO Title */}
          <div className="space-y-1">
             <div className="flex items-center gap-2 text-zinc-500">
                <Search className="w-3 h-3" />
                <span className="text-xs uppercase tracking-wider font-semibold">SEO Pin Title</span>
             </div>
             <h3 className="text-white font-medium text-lg">{prompt.seoTitle}</h3>
          </div>

          {/* Main Overlay Text */}
          <div className="flex items-start gap-3 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">
            <TypeIcon className="w-4 h-4 text-brand-red mt-1 flex-shrink-0" />
            <div>
              <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold block mb-1">Image Text Overlay</span>
              <h4 className="font-bold text-white text-xl leading-snug font-serif italic">{prompt.overlayText}</h4>
            </div>
          </div>

          {/* Typography Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="flex items-start gap-3">
                <WholeWord className="w-4 h-4 text-zinc-500 mt-1 flex-shrink-0" />
                <div>
                   <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold block mb-0.5">Font Style</span>
                   <p className="text-zinc-300 text-sm font-medium">{prompt.fontStyle}</p>
                </div>
             </div>
             <div className="flex items-start gap-3">
                <Droplet className="w-4 h-4 text-zinc-500 mt-1 flex-shrink-0" />
                <div>
                   <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold block mb-0.5">Text Color</span>
                   <p className="text-zinc-300 text-sm font-medium">{prompt.textColor}</p>
                </div>
             </div>
          </div>
          
          {/* Visual Prompt */}
          <div className="flex items-start gap-3 pt-2 border-t border-zinc-800/50">
            <Palette className="w-4 h-4 text-zinc-500 mt-1 flex-shrink-0" />
            <div>
              <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold block mb-1">Visual Prompt</span>
              <p className="text-zinc-300 text-sm font-medium leading-relaxed">{prompt.visualStyle}</p>
            </div>
          </div>

          {/* Description Section */}
          <div className="flex items-start gap-3 pt-2 border-t border-zinc-800/50">
             <AlignLeft className="w-4 h-4 text-zinc-500 mt-1 flex-shrink-0" />
             <div className="w-full">
                <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold block mb-1">Pin Description</span>
                
                {prompt.description ? (
                  <p className="text-zinc-300 text-sm font-medium leading-relaxed mt-2 animate-in fade-in slide-in-from-top-2 duration-300">{prompt.description}</p>
                ) : (
                  <button 
                    onClick={onGenerateDescription}
                    disabled={prompt.isDescriptionLoading}
                    className="mt-2 text-xs flex items-center gap-2 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 rounded-lg text-zinc-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                  >
                    {prompt.isDescriptionLoading ? (
                      <>
                        <Sparkles className="w-3 h-3 animate-spin" />
                        Generating Description...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        Generate Description
                      </>
                    )}
                  </button>
                )}
             </div>
          </div>

           {/* Tags */}
           <div className="flex items-start gap-3 pt-2 border-t border-zinc-800/50">
            <Hash className="w-4 h-4 text-zinc-500 mt-1 flex-shrink-0" />
            <div>
              <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold block mb-2">Keywords & Tags</span>
              <div className="flex flex-wrap gap-2">
                {prompt.tags.map((tag, i) => (
                  <span key={i} className="text-xs bg-zinc-900 text-zinc-400 border border-zinc-700 px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ResultCard;