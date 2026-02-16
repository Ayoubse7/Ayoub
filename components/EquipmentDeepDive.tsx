
import React from 'react';
import { Lead } from '../types';
import { analyzeLeadBehavior } from '../services/geminiService';

const EquipmentDeepDive: React.FC = () => {
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = React.useState<string>('');
  const [analysis, setAnalysis] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const savedLeads = localStorage.getItem('lableads_ma_leads');
    if (savedLeads) {
      const parsed = JSON.parse(savedLeads);
      setLeads(parsed);
      if (parsed.length > 0) setSelectedLeadId(parsed[0].id);
    }
  }, []);

  const handleAnalyze = async () => {
    const lead = leads.find(l => l.id === selectedLeadId);
    if (!lead) return;

    setLoading(true);
    try {
      const data = await analyzeLeadBehavior(lead);
      setAnalysis(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const currentLead = leads.find(l => l.id === selectedLeadId);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Lead Selector Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-900">Analyse Comportementale IA</h2>
          <p className="text-sm text-slate-500">Mappez vos produits sur les besoins spécifiques de chaque prospect.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <select 
            value={selectedLeadId}
            onChange={(e) => setSelectedLeadId(e.target.value)}
            className="flex-1 md:w-64 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            {leads.map(l => (
              <option key={l.id} value={l.id}>{l.nom_entreprise}</option>
            ))}
          </select>
          <button 
            onClick={handleAnalyze}
            disabled={loading || !selectedLeadId}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-brain"></i>}
            Lancer l'Analyse
          </button>
        </div>
      </div>

      {!analysis && !loading && (
        <div className="py-20 text-center bg-white rounded-xl border-2 border-dashed border-slate-200">
          <i className="fa-solid fa-wand-magic-sparkles text-4xl text-slate-200 mb-4"></i>
          <p className="text-slate-400 font-medium">Sélectionnez un lead pour découvrir son profil comportemental et son matching produit.</p>
        </div>
      )}

      {loading && (
        <div className="py-20 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 italic">Gemini décode la psychologie du prospect et calibre votre catalogue...</p>
        </div>
      )}

      {analysis && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Behavioral Profile */}
          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Profil Décideur</h3>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-xl">
                  <i className="fa-solid fa-user-tie"></i>
                </div>
                <div>
                  <h4 className="font-bold text-lg leading-tight">{analysis.profile}</h4>
                  <p className="text-[10px] text-slate-400 uppercase">Persona IA Détecté</p>
                </div>
              </div>
              <div className="space-y-2">
                {analysis.behavioral_traits.map((trait: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                    <i className="fa-solid fa-circle-check text-blue-500 text-[10px]"></i>
                    {trait}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Matching Catalogue</h3>
              <div className="space-y-4">
                {analysis.product_matching.map((match: any, i: number) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-700">{match.product_name}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${match.fit_score > 70 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {match.fit_score}% Fit
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mb-2">
                      <div className="bg-blue-600 h-full rounded-full" style={{width: `${match.fit_score}%`}}></div>
                    </div>
                    <p className="text-[10px] text-slate-500 italic">{match.why}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center/Right: Strategy */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                <i className="fa-solid fa-shield-halved text-amber-500"></i> TRAITEMENT DES OBJECTIONS PRÉDICTIF
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.fears_and_objections.map((item: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-100 bg-amber-50/30">
                    <p className="text-xs font-bold text-amber-800 mb-2 flex items-center gap-2">
                      <i className="fa-solid fa-triangle-exclamation"></i> {item.objection}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      <span className="font-bold text-slate-800">Contre-argument :</span> {item.counter_argument}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-phone-volume text-green-600"></i> SCRIPT D'APPROCHE PERSONNALISÉ
              </h3>
              <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 font-mono text-xs leading-relaxed text-slate-700 whitespace-pre-wrap">
                {analysis.sales_script}
              </div>
              <div className="mt-4 flex gap-3">
                <button className="flex-1 bg-slate-800 text-white py-2 rounded-lg text-xs font-bold hover:bg-slate-900 transition-all">
                  <i className="fa-solid fa-copy mr-2"></i> Copier le Script
                </button>
                <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all">
                  <i className="fa-solid fa-paper-plane mr-2"></i> Envoyer via Email
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
