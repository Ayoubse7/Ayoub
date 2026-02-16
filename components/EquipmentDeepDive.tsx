
import React from 'react';
import { Lead, AppSettings } from '../types';
import { analyzeLeadBehavior, analyzeCatalogContent } from '../services/geminiService';

const EquipmentDeepDive: React.FC = () => {
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = React.useState<string>('');
  const [catalogAnalysis, setCatalogAnalysis] = React.useState<any>(null);
  const [leadAnalysis, setLeadAnalysis] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [step, setStep] = React.useState<'idle' | 'analyzing-catalog' | 'analyzing-lead'>('idle');

  React.useEffect(() => {
    const savedLeads = localStorage.getItem('sales_pl_leads');
    if (savedLeads) {
      const parsed = JSON.parse(savedLeads);
      setLeads(parsed);
      if (parsed.length > 0) setSelectedLeadId(parsed[0].id);
    }
  }, []);

  const handleFullProcess = async () => {
    const lead = leads.find(l => l.id === selectedLeadId);
    if (!lead) return;

    setLoading(true);
    setLeadAnalysis(null);
    
    try {
      // 1. Analyser le catalogue d'abord
      setStep('analyzing-catalog');
      const settingsStr = localStorage.getItem('sales_pl_settings');
      const settings: AppSettings = settingsStr ? JSON.parse(settingsStr) : {};
      
      const cAnalysis = await analyzeCatalogContent(settings.catalogDescription);
      setCatalogAnalysis(cAnalysis);

      // 2. Analyser le lead avec ce contexte
      setStep('analyzing-lead');
      const lAnalysis = await analyzeLeadBehavior(lead, cAnalysis);
      setLeadAnalysis(lAnalysis);
      
      setStep('idle');
    } catch (e) {
      console.error(e);
      setStep('idle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Selector Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <i className="fa-solid fa-microchip text-blue-600"></i> Deep Dive Comportemental
          </h2>
          <p className="text-xs text-slate-500 font-medium">L'IA analyse votre catalogue avant de calibrer l'approche prospect.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <select 
            value={selectedLeadId}
            onChange={(e) => setSelectedLeadId(e.target.value)}
            className="flex-1 md:w-64 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
          >
            {leads.map(l => (
              <option key={l.id} value={l.id}>{l.nom_entreprise}</option>
            ))}
          </select>
          <button 
            onClick={handleFullProcess}
            disabled={loading || !selectedLeadId}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-200"
          >
            {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-bolt"></i>}
            {loading ? 'Traitement IA...' : 'Lancer l\'Analyse'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="py-20 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="relative w-16 h-16 mx-auto mb-6">
             <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
             <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center">
                <i className={`fa-solid ${step === 'analyzing-catalog' ? 'fa-book' : 'fa-user-astronaut'} text-blue-600`}></i>
             </div>
          </div>
          <h4 className="font-bold text-slate-800">
            {step === 'analyzing-catalog' ? "Analyse de votre catalogue digital..." : "Décodage du profil prospect..."}
          </h4>
          <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto italic">
            Gemini construit une stratégie sur-mesure basée sur vos paramètres produits.
          </p>
        </div>
      )}

      {!loading && !leadAnalysis && (
        <div className="py-24 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <i className="fa-solid fa-wand-magic-sparkles text-2xl text-slate-300"></i>
          </div>
          <p className="text-slate-400 font-bold text-sm">Prêt pour une analyse de précision ?</p>
          <p className="text-xs text-slate-400 mt-1 px-4">L'IA va d'abord "lire" votre catalogue en paramètres avant d'analyser le lead.</p>
        </div>
      )}

      {leadAnalysis && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Catalog Insight Panel */}
          <div className="space-y-6">
            {catalogAnalysis && (
              <div className="bg-blue-600 text-white p-6 rounded-xl shadow-xl shadow-blue-200">
                <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-70">Cœur de votre offre</h3>
                <h4 className="font-bold text-lg mb-4">{catalogAnalysis.positionnement}</h4>
                <div className="space-y-2 mb-6">
                  {catalogAnalysis.points_forts?.map((pt: string, i: number) => (
                    <div key={i} className="flex gap-2 text-xs items-start">
                      <i className="fa-solid fa-check-circle mt-0.5 text-blue-300"></i>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-white/10 rounded-lg border border-white/20">
                  <p className="text-[10px] font-bold uppercase mb-1 opacity-70">Argument Massue</p>
                  <p className="text-xs italic leading-relaxed">"{catalogAnalysis.argument_massue}"</p>
                </div>
              </div>
            )}

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-wider">Matching Produits</h3>
              <div className="space-y-4">
                {leadAnalysis.product_matching.map((match: any, i: number) => (
                  <div key={i} className="group">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-700">{match.product_name}</span>
                      <span className="text-[10px] font-bold text-blue-600">{match.fit_score}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mb-2 overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{width: `${match.fit_score}%`}}></div>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-snug group-hover:text-slate-700 transition-colors">{match.why}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Behavioral & Sales Script */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white text-xl">
                    <i className="fa-solid fa-id-card-clip"></i>
                 </div>
                 <div>
                    <h3 className="font-bold text-slate-900">{leadAnalysis.profile}</h3>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Persona IA Analysé</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 {leadAnalysis.behavioral_traits.map((trait: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs font-medium text-slate-700">
                       <i className="fa-solid fa-circle-nodes text-blue-500"></i>
                       {trait}
                    </div>
                 ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                <i className="fa-solid fa-shield-virus text-amber-500"></i> Gestion des Objections (Contextuelle)
              </h3>
              <div className="space-y-4">
                {leadAnalysis.fears_and_objections.map((item: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl bg-amber-50/50 border border-amber-100 flex gap-4">
                    <i className="fa-solid fa-triangle-exclamation text-amber-500 mt-1"></i>
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-amber-900">{item.objection}</p>
                      <p className="text-xs text-slate-600 leading-relaxed"><span className="font-bold text-slate-800">Réplique :</span> {item.counter_argument}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-xl shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <i className="fa-solid fa-quote-right text-6xl text-white"></i>
              </div>
              <h3 className="text-sm font-bold text-blue-400 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-terminal"></i> SCRIPT D'APPROCHE SUR-MESURE
              </h3>
              <div className="font-mono text-[11px] leading-relaxed text-slate-300 whitespace-pre-wrap bg-white/5 p-4 rounded-lg border border-white/10 mb-6">
                {leadAnalysis.sales_script}
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => navigator.clipboard.writeText(leadAnalysis.sales_script)}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                >
                  <i className="fa-solid fa-copy mr-2"></i> Copier
                </button>
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-900">
                  <i className="fa-solid fa-paper-plane mr-2"></i> Utiliser ce script
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentDeepDive;
