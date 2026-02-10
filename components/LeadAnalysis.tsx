
import React from 'react';
import { Lead, LeadAnalysis as ILeadAnalysis } from '../types';
import { generateLeadAnalysis } from '../services/geminiService';

interface LeadAnalysisProps {
  lead: Lead;
  onBack: () => void;
}

const LeadAnalysis: React.FC<LeadAnalysisProps> = ({ lead, onBack }) => {
  const [analysis, setAnalysis] = React.useState<ILeadAnalysis | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        const data = await generateLeadAnalysis(lead);
        setAnalysis(data);
      } catch (e) {
        console.error("Erreur lors de l'analyse", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [lead]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 text-sm animate-pulse">Gemini analyse les données du lead...</p>
      </div>
    );
  }

  if (!analysis) return null;

  // Constants for SVG circle
  const radius = 58;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="space-y-6 animate-fadeIn">
      <button 
        onClick={onBack}
        className="text-slate-500 hover:text-blue-600 text-sm font-medium flex items-center gap-2 mb-4 transition-colors"
      >
        <i className="fa-solid fa-arrow-left"></i> Retour à la liste
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score & Profile */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
            <div className="relative inline-flex items-center justify-center mb-4">
              <svg className="w-32 h-32">
                <circle className="text-slate-100" strokeWidth="8" stroke="currentColor" fill="transparent" r={radius} cx="64" cy="64" />
                {/* Fixed arithmetic operation error by using pre-calculated constants and explicit casting if necessary */}
                <circle 
                  className="text-blue-600" 
                  strokeWidth="8" 
                  strokeDasharray={circumference} 
                  strokeDashoffset={circumference * (1 - (analysis.score_qualification || 0) / 100)} 
                  strokeLinecap="round" 
                  stroke="currentColor" 
                  fill="transparent" 
                  r={radius} 
                  cx="64" 
                  cy="64" 
                />
              </svg>
              <div className="absolute text-3xl font-bold text-slate-900">{analysis.score_qualification}</div>
            </div>
            <h3 className="font-bold text-lg">{lead.nom_entreprise}</h3>
            <p className="text-slate-500 text-sm">{lead.secteur}</p>
            
            <div className="mt-6 space-y-2 text-left">
              {Object.entries(analysis.breakdown_score).map(([key, val]) => (
                <div key={key} className="flex flex-col">
                  <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold mb-1">
                    <span>{key.replace('_', ' ')}</span>
                    {/* Fixed arithmetic operation error by ensuring val is treated as a number */}
                    <span>{Number(val)}/20</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full" style={{width: `${(Number(val)/20)*100}%`}}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-sm font-bold mb-4 uppercase text-slate-400">Enrichissement Data</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">CA Annuel</span>
                <span className="text-sm font-semibold">{analysis.enrichissement.ca_annuel}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Effectif</span>
                <span className="text-sm font-semibold">{analysis.enrichissement.effectif} employés</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-500">Certifications</span>
                <div className="flex gap-1 flex-wrap">
                  {analysis.enrichissement.certifications.map((c, i) => (
                    <span key={i} className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-100">{c}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Potential & Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold mb-6 flex items-center gap-2">
              <i className="fa-solid fa-money-bill-trend-up text-blue-600"></i> POTENTIEL COMMERCIAL
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Valeur Deal</p>
                <p className="text-lg font-bold text-slate-900">{analysis.potentiel_commercial.valeur_deal_estimee}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Probabilité</p>
                <p className="text-lg font-bold text-blue-600">{analysis.potentiel_commercial.probabilite_conversion}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Cycle Vente</p>
                <p className="text-lg font-bold text-slate-900">{analysis.potentiel_commercial.cycle_vente_jours} Jours</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Urgence</p>
                <p className="text-xs font-bold text-amber-600 truncate">{analysis.potentiel_commercial.urgence}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold mb-6 flex items-center gap-2">
              <i className="fa-solid fa-lightbulb text-blue-600"></i> RECOMMANDATIONS STRATÉGIQUES
            </h3>
            <div className="space-y-3">
              {analysis.recommandations.map((rec, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-lg bg-blue-50 border-l-4 border-blue-500">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                    {i+1}
                  </span>
                  <p className="text-sm text-slate-700 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Profil Comportemental</h4>
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {analysis.profil_comportemental.mots_cles.map((m, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-medium border border-slate-200">
                      <i className="fa-solid fa-magnifying-glass text-[8px] mr-1 opacity-50"></i> {m}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Engagement:</span>
                  <span className="font-semibold text-green-600">{analysis.profil_comportemental.niveau_engagement}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-600 p-6 rounded-xl shadow-lg shadow-blue-200 flex flex-col justify-center items-center text-center text-white">
              <i className="fa-solid fa-headset text-3xl mb-3 opacity-50"></i>
              <h4 className="font-bold mb-2">Prêt à agir ?</h4>
              <p className="text-xs opacity-80 mb-4">Planifiez un appel ou envoyez une proposition personnalisée générée par IA.</p>
              <button className="w-full bg-white text-blue-600 font-bold py-2 rounded-lg text-sm hover:bg-blue-50 transition-colors">
                Générer Email Prospect
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadAnalysis;
