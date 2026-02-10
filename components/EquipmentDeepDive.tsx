
import React from 'react';
import { getMarketInsights } from '../services/geminiService';

const EQUIPMENT_CATEGORIES = [
  "HPLC", "Spectrophotomètre", "Analyseur Hématologie", "Balance Analytique", "Microscope", "Réacteur Chimique"
];

const EquipmentDeepDive: React.FC = () => {
  const [selected, setSelected] = React.useState(EQUIPMENT_CATEGORIES[0]);
  const [insights, setInsights] = React.useState<{text: string, sources: any[]} | null>(null);
  const [loading, setLoading] = React.useState(false);

  const fetchInsights = React.useCallback(async (eq: string) => {
    setLoading(true);
    try {
      const data = await getMarketInsights(eq);
      setInsights(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchInsights(selected);
  }, [selected, fetchInsights]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-wrap gap-2">
        {EQUIPMENT_CATEGORIES.map(eq => (
          <button
            key={eq}
            onClick={() => setSelected(eq)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              selected === eq 
              ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
              : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
            }`}
          >
            {eq}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[400px]">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center justify-between">
              <span>Analyse de Marché : {selected}</span>
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full uppercase tracking-wider">Gemini Search Grounding</span>
            </h3>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-400 text-sm italic">Recherche d'informations en temps réel sur le marché marocain...</p>
              </div>
            ) : insights ? (
              <div className="prose prose-slate max-w-none">
                <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">
                  {insights.text}
                </div>
                
                {insights.sources && insights.sources.length > 0 && (
                  <div className="mt-10 pt-6 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Sources et Références</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {insights.sources.map((source: any, idx: number) => (
                        <a 
                          key={idx} 
                          href={source.web?.uri || "#"} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-blue-300 transition-colors group"
                        >
                          <i className="fa-solid fa-link text-slate-400 group-hover:text-blue-500 text-xs"></i>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-semibold text-slate-700 truncate w-48">
                              {source.web?.title || "Lien source"}
                            </span>
                            <span className="text-[9px] text-slate-400 truncate w-48">{source.web?.uri}</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
                <div className="text-center py-20 text-slate-400 italic">Aucune donnée disponible.</div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-xl text-white shadow-xl shadow-blue-100">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <i className="fa-solid fa-bullseye"></i> Stratégie de Conversion
            </h4>
            <div className="space-y-4">
              <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/20">
                <p className="text-[10px] uppercase font-bold text-blue-100 mb-1">Argument Phare</p>
                <p className="text-xs font-medium">Service après-vente local avec techniciens certifiés basés à Casablanca.</p>
              </div>
              <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/20">
                <p className="text-[10px] uppercase font-bold text-blue-100 mb-1">Objection Fréquente</p>
                <p className="text-xs font-medium">Délai de livraison de 4 mois. Solution : Offrir une remise "pré-commande".</p>
              </div>
            </div>
            <button className="w-full bg-white text-blue-600 font-bold py-2.5 rounded-lg text-xs mt-6 hover:shadow-lg transition-all flex items-center justify-center gap-2">
              <i className="fa-solid fa-file-export"></i> Télécharger Rapport PDF
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h4 className="text-sm font-bold mb-4 text-slate-800">Segmentation Sectorielle</h4>
             <div className="space-y-3">
               {[
                 { s: "Pharmacie", p: 45 },
                 { s: "Médical", p: 25 },
                 { s: "Recherche", p: 20 },
                 { s: "Agro", p: 10 },
               ].map((seg, i) => (
                 <div key={i} className="space-y-1">
                   <div className="flex justify-between text-[11px] font-medium text-slate-600">
                     <span>{seg.s}</span>
                     <span>{seg.p}%</span>
                   </div>
                   <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-500" style={{width: `${seg.p}%`}}></div>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDeepDive;
