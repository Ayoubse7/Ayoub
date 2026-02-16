
import React from 'react';
import { Lead } from './types';
import { SECTORS_LIST } from './constants';
import LeadCard from './components/LeadCard';
import LeadAnalysis from './components/LeadAnalysis';
import Dashboard from './components/Dashboard';
import EquipmentDeepDive from './components/EquipmentDeepDive';
import ScrapingLoader from './components/ScrapingLoader';
import Settings from './components/Settings';
import { fetchGoogleSheetData, parseLeadsFromSheet } from './services/geminiService';

type ViewState = 'dashboard' | 'leads' | 'deepdive' | 'analysis' | 'settings';

const STORAGE_KEY = 'lableads_ma_leads';
const SETTINGS_KEY = 'lableads_ma_settings';

const App: React.FC = () => {
  const [currentView, setCurrentView] = React.useState<ViewState>('dashboard');
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null);
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [filterSector, setFilterSector] = React.useState<string>('Tous');
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // 1. Charger les leads du localStorage au démarrage
  React.useEffect(() => {
    const savedLeads = localStorage.getItem(STORAGE_KEY);
    if (savedLeads) {
      try {
        const parsed = JSON.parse(savedLeads);
        if (Array.isArray(parsed)) setLeads(parsed);
      } catch (e) { console.error(e); }
    }
  }, []);

  const handleSyncLeads = async () => {
    const settingsStr = localStorage.getItem(SETTINGS_KEY);
    const settings = settingsStr ? JSON.parse(settingsStr) : {};
    
    if (!settings.googleSheetLink) {
      setErrorMessage("Veuillez configurer un lien Google Sheet dans les paramètres.");
      return;
    }

    setIsSyncing(true);
    setErrorMessage(null);
    
    try {
      const csvData = await fetchGoogleSheetData(settings.googleSheetLink);
      const importedLeads = await parseLeadsFromSheet(csvData);
      
      if (importedLeads && importedLeads.length > 0) {
        setLeads(importedLeads);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(importedLeads));
      } else {
        throw new Error("Gemini n'a pu extraire aucun lead. Vérifiez que votre tableau contient bien des données.");
      }
    } catch (e: any) {
      console.error("Erreur sync:", e.message);
      setErrorMessage(e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredLeads = leads.filter(l => filterSector === 'Tous' || l.secteur === filterSector);

  const navItems = [
    { id: 'dashboard' as ViewState, label: 'Tableau de Bord', icon: 'fa-gauge-high' },
    { id: 'leads' as ViewState, label: 'Mes Leads (Sheet)', icon: 'fa-table-list' },
    { id: 'deepdive' as ViewState, label: 'Analyse Profonde', icon: 'fa-brain' },
    { id: 'settings' as ViewState, label: 'Paramétrage', icon: 'fa-sliders' },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {isSyncing && <ScrapingLoader />}

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
                  onClick={() => {
                    setCurrentView(item.id);
                    setErrorMessage(null);
                  }}
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
        
        <div className="p-6 border-t border-slate-800 mt-auto bg-slate-900">
           <div className="text-[10px] text-slate-500 font-bold uppercase mb-2 text-center">Statut Intégration</div>
           <div className="flex items-center justify-center gap-2 bg-slate-800/50 py-2 rounded-lg">
              <span className={`w-2 h-2 rounded-full ${leads.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></span>
              <span className="text-[10px] text-slate-300 font-bold">{leads.length} leads synchronisés</span>
           </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-y-auto max-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-40">
          <h2 className="text-slate-800 font-bold text-lg">
             {currentView === 'analysis' ? 'Analyse Stratégique' : navItems.find(n => n.id === currentView)?.label}
          </h2>
          <div className="flex items-center gap-4">
             <button 
                onClick={handleSyncLeads}
                disabled={isSyncing}
                className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 flex items-center gap-2"
             >
                <i className={`fa-solid fa-arrows-rotate ${isSyncing ? 'animate-spin' : ''}`}></i> 
                Sync Google Sheet
             </button>
          </div>
        </header>

        <div className="p-6 flex-1">
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-xl shadow-sm animate-fadeIn">
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-triangle-exclamation mt-1"></i>
                <div>
                  <h4 className="font-bold text-sm">Erreur de Synchronisation</h4>
                  <p className="text-xs leading-relaxed">{errorMessage}</p>
                  <button onClick={() => setCurrentView('settings')} className="mt-2 text-[10px] font-bold underline uppercase hover:text-red-900">
                    Vérifier les paramètres
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentView === 'dashboard' && <Dashboard leads={leads} />}
          
          {currentView === 'leads' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                      <i className="fa-solid fa-filter text-sm"></i>
                   </div>
                   <div>
                      <h3 className="text-sm font-bold text-slate-900">Filtrage par Secteur</h3>
                      <p className="text-[10px] text-slate-500">Affinez votre base par industrie labo</p>
                   </div>
                </div>
                <select 
                  value={filterSector}
                  onChange={(e) => setFilterSector(e.target.value)}
                  className="w-full md:w-64 bg-slate-50 border border-slate-200 py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer shadow-inner"
                >
                  <option value="Tous">Tous les Secteurs ({leads.length})</option>
                  {SECTORS_LIST.map(s => {
                    const count = leads.filter(l => l.secteur === s).length;
                    return <option key={s} value={s}>{s} ({count})</option>;
                  })}
                </select>
              </div>

              {leads.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="fa-solid fa-cloud-arrow-down text-4xl text-slate-200"></i>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Base de données vide</h3>
                  <p className="text-sm text-slate-400 mb-8 max-w-xs mx-auto">Connectez votre Google Sheet dans les paramètres pour commencer l'importation automatique.</p>
                  <button onClick={() => setCurrentView('settings')} className="bg-blue-600 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all">
                    Configurer l'importation
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {filteredLeads.map(lead => (
                    <LeadCard key={lead.id} lead={lead} onSelect={(l) => { setSelectedLead(l); setCurrentView('analysis'); }} />
                  ))}
                </div>
              )}
            </div>
          )}

          {currentView === 'analysis' && selectedLead && (
            <LeadAnalysis lead={selectedLead} onBack={() => setCurrentView('leads')} />
          )}

          {currentView === 'deepdive' && <EquipmentDeepDive />}
          {currentView === 'settings' && <Settings onSave={() => { handleSyncLeads(); setCurrentView('leads'); }} />}
        </div>
      </main>
    </div>
  );
};

export default App;
