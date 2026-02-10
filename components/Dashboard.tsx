
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import { UI_COLORS } from '../constants';
import { Lead } from '../types';

interface DashboardProps {
  leads: Lead[];
}

const COLORS = [UI_COLORS.primary, UI_COLORS.info, UI_COLORS.success, UI_COLORS.warning, UI_COLORS.secondary];

const Dashboard: React.FC<DashboardProps> = ({ leads }) => {
  const today = new Date().toISOString().split('T')[0];

  // 1. Sector Distribution (Real Data)
  const sectorCounts = leads.reduce((acc: any, lead) => {
    acc[lead.secteur] = (acc[lead.secteur] || 0) + 1;
    return acc;
  }, {});

  const dataSecteur = Object.keys(sectorCounts).map(key => ({
    name: key,
    value: sectorCounts[key]
  }));

  // 2. Real KPI Calculations
  const leadsToday = leads.filter(l => l.date_capture.startsWith(today)).length;
  const leadGoal = 20;
  const progressPercent = Math.min((leadsToday / leadGoal) * 100, 100);

  // Calculate Avg Score based on Intention Levels (Real approximation)
  const totalScore = leads.reduce((acc, l) => {
    if (l.niveau_intention === "Haute") return acc + 90;
    if (l.niveau_intention === "Moyenne") return acc + 60;
    return acc + 30;
  }, 0);
  const avgScore = leads.length > 0 ? Math.round(totalScore / leads.length) : 0;

  // Real Pipeline Value (Assuming average 25k EUR per interested equipment)
  const totalEquipments = leads.reduce((acc, l) => acc + l.equipements_interesses.length, 0);
  const pipelineValue = totalEquipments * 25000;

  // 3. Generation Trend (Real Data grouped by day)
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const dataTrends = last7Days.map(date => {
    const count = leads.filter(l => l.date_capture.startsWith(date)).length;
    const dayLabel = new Date(date).toLocaleDateString('fr-FR', { weekday: 'short' });
    return { day: dayLabel, leads: count };
  });

  // 4. Real Equipment Demand
  const equipmentFrequency: Record<string, number> = {};
  leads.forEach(l => {
    l.equipements_interesses.forEach(eq => {
      equipmentFrequency[eq] = (equipmentFrequency[eq] || 0) + 1;
    });
  });

  const topEquipments = Object.entries(equipmentFrequency)
    .map(([name, count]) => ({ 
      name, 
      count, 
      val: `${(count * 30000).toLocaleString()} EUR` 
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: "Leads Aujourd'hui", 
            val: `${leadsToday}/${leadGoal}`, 
            sub: `${progressPercent.toFixed(0)}% de l'objectif quotidien`, 
            icon: "fa-rocket", 
            color: "text-blue-600", 
            bg: "bg-blue-50" 
          },
          { 
            label: "Score de Qualification", 
            val: `${avgScore}/100`, 
            sub: "Basé sur les signaux d'intention", 
            icon: "fa-star", 
            color: "text-amber-600", 
            bg: "bg-amber-50" 
          },
          { 
            label: "Valeur du Pipeline", 
            val: `${pipelineValue.toLocaleString()} EUR`, 
            sub: `${totalEquipments} équipements identifiés`, 
            icon: "fa-sack-dollar", 
            color: "text-green-600", 
            bg: "bg-green-50" 
          },
          { 
            label: "Base Totale", 
            val: `${leads.length} Leads`, 
            sub: "Historique complet stocké", 
            icon: "fa-database", 
            color: "text-purple-600", 
            bg: "bg-purple-50" 
          },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-transform hover:scale-[1.02]">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${kpi.bg} ${kpi.color}`}>
                <i className={`fa-solid ${kpi.icon}`}></i>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">{kpi.label}</p>
                <h3 className="text-xl font-bold text-slate-900">{kpi.val}</h3>
                <p className="text-[10px] text-slate-400">{kpi.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Trend */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold mb-6 flex items-center gap-2">
            <i className="fa-solid fa-chart-line text-blue-600"></i> HISTORIQUE DE CAPTURE (7 derniers jours)
          </h3>
          <div className="h-64 w-full">
            {leads.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataTrends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="leads" 
                    stroke={UI_COLORS.primary} 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: UI_COLORS.primary }} 
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 italic text-xs">
                Aucun historique de capture disponible.
              </div>
            )}
          </div>
        </div>

        {/* Sector Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold mb-6 flex items-center gap-2">
            <i className="fa-solid fa-chart-pie text-blue-600"></i> RÉPARTITION PAR SECTEUR
          </h3>
          <div className="h-64 w-full">
            {leads.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataSecteur}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {dataSecteur.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{fontSize: '11px'}} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 italic text-xs">
                En attente de données sectorielles...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Equipment Demand */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <i className="fa-solid fa-ranking-star text-blue-600"></i> TOP ÉQUIPEMENTS DÉTECTÉS
          </h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Temps Réel</span>
        </div>
        
        {topEquipments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {topEquipments.map((item, i) => (
              <div key={i} className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex flex-col items-center text-center transition-all hover:border-blue-200 hover:bg-blue-50/20">
                <span className="text-xl font-bold text-blue-600">#{i+1}</span>
                <p className="text-sm font-semibold text-slate-800 mt-1 truncate w-full px-2" title={item.name}>{item.name}</p>
                <div className="mt-3 w-full border-t border-slate-200 pt-2 flex justify-between text-[10px] text-slate-500 uppercase font-bold">
                  <span>{item.count} leads</span>
                  <span className="text-blue-600">{item.val}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-slate-400 italic text-sm">
            Analysez des leads pour identifier les équipements demandés.
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
