import React from 'react';
import { MessageSquare, Sparkles, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-[#111b21] transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-[#202c33] rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-800 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-6">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center justify-center gap-2">
          Quantum Heaps Chat <Sparkles className="w-5 h-5 text-amber-500" />
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Senior Frontend Take-Home Architecture Scaffolding
        </p>

        <div className="mt-6 p-4 rounded-xl bg-gray-50 dark:bg-[#111b21] border border-gray-100 dark:border-gray-800/60 text-left space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>React 18 + Vite + TypeScript (Strict Mode)</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Tailwind CSS with Dark Mode & Slack/WhatsApp Themes</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Redux Toolkit & React Redux Configured</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>React Hook Form & Lucide Icons Integrated</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Vitest + React Testing Library Ready</span>
          </div>
        </div>
      </div>
    </main>
  );
};

export default App;
