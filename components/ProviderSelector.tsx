import React from 'react';
import { AIProvider } from '../types';
import { Bot, Zap, Cpu, Key } from 'lucide-react';

interface Props {
  selectedProvider: AIProvider;
  onSelectProvider: (provider: AIProvider) => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

const ProviderSelector: React.FC<Props> = ({ selectedProvider, onSelectProvider, apiKey, onApiKeyChange }) => {
  const providers = [
    { id: AIProvider.GEMINI, name: 'Gemini', icon: Zap, color: 'text-blue-400', desc: 'Google DeepMind' },
    { id: AIProvider.OPENAI, name: 'OpenAI', icon: Bot, color: 'text-green-400', desc: 'GPT-4o' },
    { id: AIProvider.GROQ, name: 'Groq', icon: Cpu, color: 'text-orange-400', desc: 'Llama 3.3 on GroqCloud' },
  ];

  return (
    <div className="space-y-6 bg-brand-dark p-6 rounded-xl border border-zinc-800 shadow-xl">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <span className="w-1 h-6 bg-brand-red rounded-full mr-3"></span>
          Select Intelligence
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {providers.map((p) => {
            const Icon = p.icon;
            const isSelected = selectedProvider === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectProvider(p.id)}
                className={`
                  relative overflow-hidden group p-4 rounded-lg border transition-all duration-300 flex flex-col items-center justify-center gap-2
                  ${isSelected 
                    ? 'bg-gradient-to-br from-zinc-900 to-zinc-950 border-brand-red shadow-[0_0_20px_rgba(220,38,38,0.3)]' 
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800'}
                `}
              >
                <Icon className={`w-8 h-8 ${p.color} ${isSelected ? 'animate-pulse' : ''}`} />
                <div className="text-center">
                  <div className={`font-bold ${isSelected ? 'text-white' : 'text-zinc-400'}`}>{p.name}</div>
                  <div className="text-xs text-zinc-500">{p.desc}</div>
                </div>
                {isSelected && (
                  <div className="absolute top-0 right-0 w-3 h-3 bg-brand-red rounded-bl-lg shadow-[0_0_10px_#dc2626]"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative">
        <label className="block text-sm font-medium text-zinc-400 mb-2">API Key</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Key className="h-5 w-5 text-zinc-500 group-focus-within:text-brand-red transition-colors" />
          </div>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder={
              selectedProvider === AIProvider.GROQ 
                ? "Enter Groq API Key (starts with gsk_)" 
                : `Enter your ${selectedProvider} API Key`
            }
            className="block w-full pl-10 pr-3 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all shadow-inner"
          />
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          Your key is used locally in your browser and is never stored on our servers.
        </p>
      </div>
    </div>
  );
};

export default ProviderSelector;