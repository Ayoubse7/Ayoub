
import React from 'react';
import { Lead } from '../types';

interface LeadCardProps {
  lead: Lead;
  onSelect: (lead: Lead) => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onSelect }) => {
  const getIntentionColor = (level: string) => {
    switch(level) {
      case "Haute": return "bg-green-100 text-green-700 border-green-200";
      case "Moyenne": return "bg-amber-100 text-amber-700 border-amber-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div 
      onClick={() => onSelect(lead)}
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">{lead.nom_entreprise}</h3>
          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1 font-medium">
            <i className="fa-solid fa-location-dot text-blue-500"></i> {lead.localisation?.ville || "Ville non spécifiée"}
          </p>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border whitespace-nowrap ${getIntentionColor(lead.niveau_intention)}`}>
          {lead.niveau_intention}
        </span>
      </div>

      {/* Opportunité détectée - Signal métier */}
      <div className="bg-blue-50/50 border border-blue-100/50 rounded-lg p-3 mb-4 flex-1">
        <p className="text-[10px] uppercase font-bold text-blue-600 mb-1 flex items-center gap-1">
          <i className="fa-solid fa-bolt-lightning animate-pulse"></i> Signal détecté
        </p>
        <p className="text-xs text-slate-700 font-medium leading-relaxed italic">
          "{lead.raison_opportunite || lead.mot_cle_declencheur || "Analyse en cours..."}"
        </p>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-[11px] text-slate-600">
          <i className="fa-solid fa-industry w-4 text-slate-400"></i>
          <span className="truncate">{lead.secteur}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-600">
          <i className="fa-solid fa-tags w-4 text-slate-400"></i>
          <div className="flex gap-1 overflow-hidden">
            {lead.equipements_interesses && Array.isArray(lead.equipements_interesses) && lead.equipements_interesses.slice(0, 2).map((eq, i) => (
              <span key={i} className="bg-slate-50 px-2 py-0.5 rounded text-[9px] border border-slate-100 font-semibold">{eq}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
        <div className="text-[9px] text-slate-400 font-medium">
          Détecté le {lead.date_capture ? new Date(lead.date_capture).toLocaleDateString() : 'N/A'}
        </div>
        <button className="text-blue-600 text-[10px] font-bold flex items-center gap-1 hover:translate-x-1 transition-transform">
          ANALYSER <i className="fa-solid fa-chevron-right text-[9px]"></i>
        </button>
      </div>
    </div>
  );
};

export default LeadCard;
