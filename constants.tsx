
import { Sector } from './types';

export const SECTORS_LIST = Object.values(Sector);

// Catalogue de vos produits pour l'analyse de matching
export const MY_PRODUCTS = [
  { id: 'PROD-HPLC-01', name: 'Chromatographe HPLC Ultra-Performance', category: 'Analytique', strengths: ['Rapidité', 'Précision extrême', 'Conformité FDA'] },
  { id: 'PROD-SPEC-02', name: 'Spectrophotomètre UV-Vis Digital', category: 'Optique', strengths: ['Interface tactile', 'Cloud sync', 'Maintenance facile'] },
  { id: 'PROD-HEMA-03', name: 'Automate Hématologie 5-Diff', category: 'Médical', strengths: ['Petit volume', 'Bas coût par test', 'Robuste'] },
  { id: 'PROD-BAL-04', name: 'Balance Analytique de Haute Précision', category: 'Pesage', strengths: ['Calibration auto', 'Anti-statique', 'ISO ready'] },
  { id: 'PROD-HOT-05', name: 'Hotte à Flux Laminaire Pro', category: 'Sécurité', strengths: ['Filtration HEPA H14', 'Économe en énergie', 'Silencieuse'] }
];

export const UI_COLORS = {
  primary: "#2563eb",
  secondary: "#64748b",
  success: "#22c55e",
  danger: "#ef4444",
  warning: "#f59e0b",
  info: "#06b6d4"
};
