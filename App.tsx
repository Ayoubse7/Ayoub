
import React from 'react';
import { Lead } from './types';
import { SECTORS_LIST } from './constants';
import LeadCard from './components/LeadCard';
import LeadAnalysis from './components/LeadAnalysis';
import Dashboard from './components/Dashboard';
import EquipmentDeepDive from './components/EquipmentDeepDive';
import ScrapingLoader from './components/ScrapingLoader';
import Settings from './components/Settings';
import { generateDailyLeads } from './services/geminiService';

type ViewState = 'dashboard' | 'leads' | 'deepdive' | 'analysis' | 'settings';

const STORAGE_KEY = 'lableads_ma_leads';
const LAST_SCRAPE_KEY = 'lableads_ma_last_scrape';

const App: React.FC = () => {
  const [currentView, setCurrentView] = React.useState<ViewState>('dashboard');
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null);
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [filterSector, setFilterSector] = React.useState<string>('Tous');
  const [isScraping, setIsScraping] = React.useState(false);

  // 1. Initial Load from LocalStorage
  React.useEffect(() => {
    const savedLeads = localStorage.getItem(STORAGE_KEY);
    if (savedLeads) {
      try {
        setLeads(JSON.parse(savedLeads));
      } catch (e) {
        console.error("Erreur chargement storage", e);
      }
    }
  }, []);

  // 2. Daily Check Logic
  React.useEffect(() => {
    const checkDailyScrape = () => {
      const today = new Date().toISOString().split('T')[0];
      const lastScrape = localStorage.getItem(LAST_SCRAPE_KEY);
      
      if (lastScrape !== today) {
        handleStartScraping();
      }
    };

    const timer = setTimeout(checkDailyScrape, 1000);
    return () => clearTimeout(timer);
  }, []);

  // 3. Save to LocalStorage whenever leads change
  React.useEffect(() => {
    if (leads.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    }
  }, [leads]);

  const filteredLeads = leads.filter(l => filterSector === 'Tous' || l.secteur === filterSector);

  const handleStartScraping = async () => {
    if (isScraping) return;
    setIsScraping(true);
    try {
      const newLeads = await generateDailyLeads();
      if (newLeads && Array.isArray(newLeads)) {
        setLeads(prevLeads => {
          const existingIds = new Set(prevLeads.map(l => l.id));
          const existingNames = new Set(prevLeads.map(l => l.nom_entreprise.toLowerCase()));
          
          const uniqueNewLeads = newLeads.filter(l => 
            !existingIds.has(l.id) && 
            !existingNames.has(l.nom_entreprise.toLowerCase())
          );
          
          const merged = [...uniqueNewLeads, ...prevLeads];
          return merged.sort((a, b) => new Date(b.date_capture).getTime() - new Date(a.date_capture).getTime());
        });

        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(LAST_SCRAPE_KEY, today);
      }
    } catch (e) {
      console.error("Erreur lors du scraping", e);
    } finally {
      setTimeout(() => setIsScraping(false), 2000);
    }
  };

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
    setCurrentView('analysis');
  };

  const navItems = [
    { id: 'dashboard' as ViewState, label: 'Tableau de Bord', icon: 'fa-gauge-high' },
    { id: 'leads' as ViewState, label: 'Liste des Leads', icon: 'fa-list-check' },
    { id: 'deepdive' as ViewState, label: 'Analyse Profonde', icon: 'fa-magnifying-glass-chart' },
    { id: 'settings' as ViewState, label: 'Paramétrage', icon: 'fa-sliders' },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {isScraping && <ScrapingLoader />}

      <aside className="w-full lg:w-64 bg-slate-900 text-white flex flex-col sticky top-0 h-auto lg:h-screen z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50">
            <i className="fa-solid fa-microscope text-xl"></i>
          </div>
          <h1 className="font-bold text-xl tracking-tight">LabLeads <span className="text-blue-500">MA</span></h1>
        </div>

        <nav className="flex-1 px-4 mt-6">
          <ul className="space-y-1">
            {navItems.map(item => (
              <li key={item.id}>
                <button
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    currentView === item.id || (currentView === 'analysis' && item.id === 'leads')
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <i className={`fa-solid ${item.icon} w-5`}></i>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-6 border-t border-slate-800 mt-auto">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
              AD
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold truncate">Admin LabLeads</span>
              <span className="text-[10px] text-slate-500 truncate">Prospecteur Certifié</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-y-auto max-h-screen">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h2 className="text-slate-800 font-bold text-lg capitalize">
              {currentView === 'analysis' ? 'Analyse du Lead' : navItems.find(n => n.id === currentView)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-500 uppercase">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                IA Live Scanning
             </div>
             <button className="relative p-2 text-slate-500 hover:text-blue-600 transition-colors">
               <i className="fa-solid fa-bell"></i>
               {leads.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
             </button>
          </div>
        </header>

        <div className="p-6 bg-slate-50/50 flex-1">
          {currentView === 'dashboard' && <Dashboard leads={leads} />}
          
          {currentView === 'leads' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                    <input 
                      type="text" 
                      placeholder="Rechercher une entreprise..." 
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <select 
                    value={filterSector}
                    onChange={(e) => setFilterSector(e.target.value)}
                    className="bg-slate-50 border border-slate-200 py-2 px-3 rounded-lg text-sm text-slate-600 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Tous">Tous les Secteurs</option>
                    {SECTORS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                        const settings = JSON.parse(localStorage.getItem('lableads_ma_settings') || '{}');
                        if (settings.googleSheetLink) window.open(settings.googleSheetLink, '_blank');
                        else alert('Veuillez configurer le lien Google Sheet dans les paramètres.');
                    }}
                    className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition-all"
                  >
                    <i className="fa-solid fa-file-export"></i> Exporter
                  </button>
                  <button 
                    onClick={handleStartScraping}
                    disabled={isScraping}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-md shadow-blue-200 disabled:opacity-50"
                  >
                    <i className={`fa-solid fa-sync-alt ${isScraping ? 'animate-spin' : ''}`}></i> 
                    Actualiser
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {filteredLeads.map(lead => (
                  <LeadCard key={lead.id} lead={lead} onSelect={handleSelectLead} />
                ))}
              </div>
            </div>
          )}

          {currentView === 'analysis' && selectedLead && (
            <LeadAnalysis 
              lead={selectedLead} 
              onBack={() => {
                setCurrentView('leads');
                setSelectedLead(null);
              }} 
            />
          )}

          {currentView === 'deepdive' && <EquipmentDeepDive />}
          
          {currentView === 'settings' && <Settings />}
        </div>
        
        <footer className="bg-white border-t border-slate-200 p-4 sticky bottom-0 z-30 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <div className="flex items-center gap-4">
            <span>Dernière Mise à Jour: {new Date().toLocaleTimeString()}</span>
            <span className="text-green-600 font-bold">{leads.length} Opportunités Stockées</span>
          </div>
          <div className="flex gap-4">
             <button onClick={() => setCurrentView('settings')} className="hover:text-blue-600 transition-colors">Configuration</button>
             <button className="hover:text-blue-600 transition-colors" onClick={() => { if(confirm('Réinitialiser toutes les données ?')) { localStorage.clear(); window.location.reload(); } }}>Réinitialiser</button>
          </div>
        </footer>
      </main>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
