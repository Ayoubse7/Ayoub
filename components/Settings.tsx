
import React from 'react';
import { AppSettings } from '../types';

const SETTINGS_STORAGE_KEY = 'lableads_ma_settings';

const DEFAULT_SETTINGS: AppSettings = {
  googleSheetLink: '',
  catalogLink: '',
  storeLink: '',
  instagramLink: '',
  facebookLink: '',
  linkedinLink: '',
  supportEmail: 'contact@votre-entreprise.ma'
};

interface SettingsProps {
  onSave?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onSave }) => {
  const [settings, setSettings] = React.useState<AppSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch (e) {
        console.error("Erreur chargement réglages", e);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
    if (onSave) onSave();
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Paramétrage Global</h2>
          <p className="text-slate-500 text-sm">Configurez vos liens externes et canaux de communication.</p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-100 animate-bounce">
            <i className="fa-solid fa-check-circle"></i>
            <span className="text-xs font-bold uppercase">Enregistré & Sync !</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <i className="fa-solid fa-database text-blue-600"></i> Export & Intégration
          </h3>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
              <p className="text-xs text-blue-700 font-medium leading-relaxed">
                <i className="fa-solid fa-circle-info mr-2"></i>
                Une fois enregistré, LabLeads importera automatiquement les données depuis votre Google Sheet. Assurez-vous que le fichier est <strong>Publié sur le web</strong> (Fichier > Partager).
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lien Google Sheet (Sauvegarde Leads)</label>
              <div className="relative">
                <i className="fa-solid fa-table absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input 
                  type="url" 
                  name="googleSheetLink"
                  value={settings.googleSheetLink}
                  onChange={handleChange}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email pour Notifications & Envois</label>
              <div className="relative">
                <i className="fa-solid fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input 
                  type="email" 
                  name="supportEmail"
                  value={settings.supportEmail}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <i className="fa-solid fa-shop text-blue-600"></i> Liens Commerciaux
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Catalogue Digital</label>
              <div className="relative">
                <i className="fa-solid fa-book-open absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input 
                  type="url" 
                  name="catalogLink"
                  value={settings.catalogLink}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Store / E-commerce</label>
              <div className="relative">
                <i className="fa-solid fa-cart-shopping absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input 
                  type="url" 
                  name="storeLink"
                  value={settings.storeLink}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <i className="fa-solid fa-share-nodes text-blue-600"></i> Réseaux Sociaux
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">LinkedIn</label>
              <div className="relative">
                <i className="fa-brands fa-linkedin absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input type="url" name="linkedinLink" value={settings.linkedinLink} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Instagram</label>
              <div className="relative">
                <i className="fa-brands fa-instagram absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input type="url" name="instagramLink" value={settings.instagramLink} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Facebook</label>
              <div className="relative">
                <i className="fa-brands fa-facebook absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input type="url" name="facebookLink" value={settings.facebookLink} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-4 pt-4">
          <button type="submit" className="px-10 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-2xl shadow-blue-300 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
            <i className="fa-solid fa-floppy-disk"></i> Enregistrer & Lancer la Sync IA
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
