
import React from 'react';

const MESSAGES = [
  "Initialisation du moteur de recherche IA...",
  "Analyse des actualités industrielles marocaines (L'Economiste, TelQuel, MAP)...",
  "Détection des signaux d'investissement et d'expansion...",
  "Extraction des projets de nouveaux laboratoires (OCP, Pharma, Santé)...",
  "Identification des contacts clés (Directeurs Techniques, Achats)...",
  "Filtrage des intentions d'achat sur LinkedIn & Appels d'offres...",
  "Calcul de la pertinence commerciale (Score Ma-IA)...",
  "Vérification des zones franches et parcs industriels (Casablanca, Tanger, Agadir)...",
  "Génération des 20 opportunités prioritaires basées sur le marché réel..."
];

const ScrapingLoader: React.FC = () => {
  const [msgIndex, setMsgIndex] = React.useState(0);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % MESSAGES.length);
    }, 2000);

    const progInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + (Math.random() * 8), 98));
    }, 400);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center space-y-6 border border-white/20">
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <i className="fa-solid fa-earth-africa text-2xl text-blue-600 animate-pulse"></i>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Analyse du Marché Marocain</h3>
          <p className="text-sm text-slate-500 h-10 flex items-center justify-center italic px-4">
            {MESSAGES[msgIndex]}
          </p>
        </div>

        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
          <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>{Math.round(progress)}% analysé</span>
          <span className="text-blue-600">Gemini Search Grounding ON</span>
        </div>
      </div>
    </div>
  );
};

export default ScrapingLoader;
