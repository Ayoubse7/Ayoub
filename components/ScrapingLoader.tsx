
import React from 'react';

const MESSAGES = [
  "Connexion sécurisée à Google Sheets...",
  "Récupération des données brutes (Export CSV)...",
  "Gemini IA : Identification des colonnes et mapping...",
  "Nettoyage des données et formatage des contacts...",
  "Analyse sémantique des raisons d'opportunité...",
  "Attribution des scores d'intention par IA...",
  "Finalisation de l'importation dans votre tableau de bord..."
];

const ScrapingLoader: React.FC = () => {
  const [msgIndex, setMsgIndex] = React.useState(0);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % MESSAGES.length);
    }, 1800);

    const progInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + (Math.random() * 10), 99));
    }, 300);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center space-y-6">
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 border-4 border-blue-50 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <i className="fa-solid fa-cloud-arrow-down text-2xl text-blue-600"></i>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900">Synchronisation IA</h3>
          <p className="text-sm text-slate-500 h-10 flex items-center justify-center px-4 leading-snug italic">
            {MESSAGES[msgIndex]}
          </p>
        </div>

        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
        
        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>{Math.round(progress)}% complété</span>
          <span className="text-blue-600">Sync Active</span>
        </div>
      </div>
    </div>
  );
};

export default ScrapingLoader;
