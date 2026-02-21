import React, { useState } from 'react';
import { AIProvider, GeneratedPrompt, AppState } from './types';
import { generatePinPrompts, generatePinDescription } from './services/aiService';
import ProviderSelector from './components/ProviderSelector';
import BlogInputForm from './components/BlogInputForm';
import ResultCard from './components/ResultCard';
import { Sparkles, AlertCircle, Download, ExternalLink } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    provider: AIProvider.GEMINI,
    apiKey: '',
    blogTitle: '',
    blogContent: '',
    isLoading: false,
    results: [],
    error: null,
  });

  const handleGenerate = async () => {
    if (!state.apiKey) {
      setState(s => ({ ...s, error: "Please enter an API Key to proceed." }));
      return;
    }
    if (!state.blogTitle || !state.blogContent) {
      setState(s => ({ ...s, error: "Please fill in both Blog Title and Content." }));
      return;
    }

    setState(s => ({ ...s, isLoading: true, error: null, results: [] }));

    try {
      const prompts = await generatePinPrompts({
        provider: state.provider,
        apiKey: state.apiKey,
        title: state.blogTitle,
        content: state.blogContent,
      });
      setState(s => ({ ...s, isLoading: false, results: prompts }));
    } catch (err: any) {
      setState(s => ({ ...s, isLoading: false, error: err.message || "Something went wrong." }));
    }
  };

  const handleGenerateDescription = async (index: number) => {
    const prompt = state.results[index];
    if (!prompt) return;

    // Set loading state for this specific prompt
    setState(s => ({
      ...s,
      results: s.results.map((p, i) => i === index ? { ...p, isDescriptionLoading: true } : p)
    }));

    try {
      const description = await generatePinDescription(
        state.provider,
        state.apiKey,
        prompt.seoTitle,
        prompt.visualStyle
      );

      setState(s => ({
        ...s,
        results: s.results.map((p, i) => i === index ? { ...p, description, isDescriptionLoading: false } : p)
      }));
    } catch (err: any) {
      console.error("Failed to generate description", err);
      setState(s => ({
        ...s,
        results: s.results.map((p, i) => i === index ? { ...p, isDescriptionLoading: false } : p),
        error: "Failed to generate description. Please try again."
      }));
    }
  };

  const handleGenerateAllDescriptions = async () => {
    if (state.results.length === 0) return;

    setState(s => ({
      ...s,
      results: s.results.map(p => ({ ...p, isDescriptionLoading: true }))
    }));

    try {
      const updatedResults = await Promise.all(
        state.results.map(async (prompt) => {
          try {
            const description = await generatePinDescription(
              state.provider,
              state.apiKey,
              prompt.seoTitle,
              prompt.visualStyle
            );
            return { ...prompt, description, isDescriptionLoading: false };
          } catch (err) {
            console.error(`Failed to generate description for pin ${prompt.id}`, err);
            return { ...prompt, isDescriptionLoading: false };
          }
        })
      );

      setState(s => ({
        ...s,
        results: updatedResults
      }));
    } catch (err: any) {
      console.error("Batch generation error", err);
      setState(s => ({
        ...s,
        error: "Batch generation failed. Please try again.",
        results: s.results.map(p => ({ ...p, isDescriptionLoading: false }))
      }));
    }
  };

  const [downloadClickCount, setDownloadClickCount] = useState(0);
  const [showSourceDownload, setShowSourceDownload] = useState(false);

  const handleDownloadAll = () => {
    // Secret trigger logic
    setDownloadClickCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        setShowSourceDownload(true);
        return 0;
      }
      return newCount;
    });

    // Reset counter after 2 seconds of inactivity
    setTimeout(() => setDownloadClickCount(0), 2000);

    if (state.results.length === 0) return;

    let fileContent = "";

    state.results.forEach((prompt, index) => {
      fileContent += `PIN ${index + 1}\n`;
      fileContent += `SEO Title: ${prompt.seoTitle}\n`;
      fileContent += `Overlay Text: ${prompt.overlayText}\n`;
      if (prompt.description) {
        fileContent += `Description: ${prompt.description}\n`;
      }
      fileContent += `Tags: ${prompt.tags.join(', ')}\n`;
      fileContent += `Visual Prompt: ${prompt.visualStyle}\n`;
      fileContent += `\n-----------------------------------\n\n`; 
    });

    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pingenie-seo-tags-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-brand-black text-zinc-100 pb-20">
      {/* Header */}
      <header className="border-b border-zinc-900 bg-brand-black/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-brand-red p-2 rounded-lg shadow-[0_0_15px_#dc2626]">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">PinGenie AI</h1>
              <p className="text-xs text-zinc-500">Premium Pinterest Architect</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <a 
              href="https://anees079.github.io/genius-ai-blog/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-brand-red/50 rounded-lg text-xs font-medium text-zinc-300 hover:text-white transition-all shadow-sm hover:shadow-[0_0_15px_rgba(220,38,38,0.2)] group"
            >
              <span>BlogGenius AI</span>
              <ExternalLink className="w-3 h-3 group-hover:text-brand-red transition-colors" />
            </a>
            <div className="hidden md:block text-xs font-mono text-zinc-600 border border-zinc-800 px-3 py-1 rounded-full">
              v1.0.0
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white leading-tight">
                Create Viral <span className="text-brand-red">Pins</span> in Seconds
              </h2>
              <p className="text-zinc-400">
                Transform your blog content into high-converting Pinterest visual descriptions, titles, and SEO tags using the world's best AI models.
              </p>
              
              {/* Creator Credit with Animation */}
              <div className="flex items-center gap-2 pt-2">
                <span className="h-px w-6 bg-zinc-800"></span>
                <span className="text-xs text-zinc-500 font-medium">Created by</span>
                <span className="text-sm font-bold bg-gradient-to-r from-brand-red via-white to-brand-red bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-x">
                  Anees Ur Rehman
                </span>
              </div>
            </div>

            <ProviderSelector
              selectedProvider={state.provider}
              onSelectProvider={(p) => setState(s => ({ ...s, provider: p }))}
              apiKey={state.apiKey}
              onApiKeyChange={(k) => setState(s => ({ ...s, apiKey: k }))}
            />

            <BlogInputForm
              title={state.blogTitle}
              content={state.blogContent}
              onTitleChange={(t) => setState(s => ({ ...s, blogTitle: t }))}
              onContentChange={(c) => setState(s => ({ ...s, blogContent: c }))}
              onSubmit={handleGenerate}
              isLoading={state.isLoading}
              disabled={!state.apiKey || !state.blogTitle || !state.blogContent}
            />
            
            {state.error && (
              <div className="bg-red-900/20 border border-red-900/50 p-4 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <p className="text-sm text-red-200">{state.error}</p>
              </div>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7">
            {state.results.length > 0 ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                 <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">Generated Concepts</h3>
                      <span className="text-sm text-zinc-500">{state.results.length} designs ready</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handleGenerateAllDescriptions}
                        disabled={state.results.some(r => r.isDescriptionLoading) || state.isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-red/10 hover:bg-brand-red/20 border border-brand-red/50 hover:border-brand-red text-brand-red rounded-lg text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Sparkles className="w-4 h-4" />
                        Generate All Descriptions
                      </button>

                      <button 
                        onClick={handleDownloadAll}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 rounded-lg text-sm text-white transition-all"
                      >
                        <Download className="w-4 h-4" />
                        Download .txt
                      </button>

                      {showSourceDownload && (
                        <a 
                          href="/api/download-source"
                          download="source-code.zip"
                          className="flex items-center gap-2 px-4 py-2 bg-green-900/20 hover:bg-green-900/30 border border-green-700/50 hover:border-green-500 rounded-lg text-sm text-green-400 transition-all animate-in fade-in zoom-in duration-300"
                        >
                          <Download className="w-4 h-4" />
                          Download Source
                        </a>
                      )}
                    </div>
                 </div>
                 <div className="grid grid-cols-1 gap-4">
                   {state.results.map((prompt, idx) => (
                     <ResultCard 
                       key={idx} 
                       prompt={prompt} 
                       index={idx} 
                       onGenerateDescription={() => handleGenerateDescription(idx)}
                     />
                   ))}
                 </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/30 p-8 text-center">
                 {state.isLoading ? (
                   <div className="animate-pulse flex flex-col items-center">
                     <div className="w-16 h-16 bg-brand-red/20 rounded-full flex items-center justify-center mb-4">
                        <Sparkles className="w-8 h-8 text-brand-red animate-spin" />
                     </div>
                     <h3 className="text-xl font-semibold text-white mb-2">Architecting your Pins...</h3>
                     <p className="text-zinc-500 max-w-sm">Generating SEO titles, analyzing keywords, and crafting visual prompts.</p>
                   </div>
                 ) : (
                   <>
                     <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-zinc-800">
                        <Sparkles className="w-8 h-8 text-zinc-700" />
                     </div>
                     <h3 className="text-lg font-semibold text-zinc-300 mb-2">No Prompts Yet</h3>
                     <p className="text-zinc-500 max-w-sm">Fill in your blog details and select an AI provider to generate premium Pinterest concepts.</p>
                   </>
                 )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;