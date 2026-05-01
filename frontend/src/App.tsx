import { Share2 } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center">
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Share2 size={32} />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">DataShare</h1>
        <p className="text-slate-400 mb-8">
          Partagez vos fichiers volumineux de manière sécurisée et éphémère.
        </p>
        
        <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-6 rounded-xl transition-colors">
          Commencer
        </button>
      </div>
    </div>
  );
}

export default App;
