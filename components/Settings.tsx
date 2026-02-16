
import React from 'react';
import { AppSettings } from '../types';

const SETTINGS_STORAGE_KEY = 'sales_pl_settings';

const DEFAULT_SETTINGS: AppSettings = {
  googleSheetLink: '',
  catalogLink: '',
  catalogDescription: '',
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
    // Migration check
    const oldSettings = localStorage.getItem('lableads_ma_settings');
    if (oldSettings && !localStorage.getItem(SETTINGS_STORAGE_KEY)) {
      localStorage.setItem(SETTINGS_STORAGE_KEY, oldSettings);
    }

    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
      } catch (e) {
        console.error("Erreur chargement réglages", e);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    <div className="max-w-4xl mx-auto animate-fadeIn pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Paramétrage Global</h2>
          <p className="text-slate-500 text-sm">Configurez vos liens externes et votre catalogue produit.</p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-100 animate-bounce">
            <i className="fa-solid fa-check-circle"></i>
            <span className="text-xs font-bold uppercase">Enregistré !</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <i className="fa-solid fa-database text-blue-600"></i> Export & Intégration
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lien Google Sheet (Source Leads)</label>
              <div className="relative">
                <i className="fa-solid fa-table absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input 
                  type="url" 
                  name="googleSheetLink"
                  value={settings.googleSheetLink}
                  onChange={handleChange}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email de Support</label>
              <div className="relative">
                <i className="fa-solid fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input 
                  type="email" 
                  name="supportEmail"
                  value={settings.supportEmail}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <i className="fa-solid fa-brain text-blue-600"></i> Intelligence Catalogue (Nouveau)
          </h3>
          <p className="text-xs text-slate-500 mb-4 italic">
            Insérez ici une description détaillée de vos produits. Gemini analysera ces données AVANT d'étudier les leads pour un matching parfait.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description textuelle du catalogue / Produits phares</label>
              <textarea 
                name="catalogDescription"
                value={settings.catalogDescription}
                onChange={handleChange}
                rows={6}
                placeholder="Ex: Nous vendons des spectromètres de marque X, idéaux pour l'agroalimentaire car ils sont portables et certifiés ISO..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none font-sans"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lien vers le catalogue (PDF/Web)</label>
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
          </div>
        </section>

        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <i className="fa-solid fa-share-nodes text-blue-600"></i> Réseaux Sociaux
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">LinkedIn</label>
              <input type="url" name="linkedinLink" value={settings.linkedinLink} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Instagram</label>
              <input type="url" name="instagramLink" value={settings.instagramLink} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Facebook</label>
              <input type="url" name="facebookLink" value={settings.facebookLink} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-4 pt-4">
          <button type="submit" className="px-10 py-4 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">
            <i className="fa-solid fa-floppy-disk"></i> Enregistrer les Paramètres
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
