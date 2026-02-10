
export enum Sector {
  PHARMACY = "Pharmacie",
  MEDICAL = "Médical/Clinique",
  AGRO = "Agroalimentaire",
  CHEMISTRY = "Chimie",
  MINING = "Mines",
  COSMETICS = "Cosmétique",
  ENVIRONMENT = "Environnement/Eau",
  CEMENT = "Cimenterie",
  RESEARCH = "Recherche/Universités"
}

export interface Contact {
  nom: string;
  poste: string;
  email: string;
  telephone: string;
}

export interface Localization {
  ville: string;
  adresse: string;
}

export interface Lead {
  id: string;
  nom_entreprise: string;
  secteur: Sector;
  contact: Contact;
  localisation: Localization;
  source: string;
  mot_cle_declencheur: string;
  raison_opportunite: string;
  niveau_intention: "Haute" | "Moyenne" | "Basse";
  equipements_interesses: string[];
  date_capture: string;
}

export interface AppSettings {
  googleSheetLink: string;
  catalogLink: string;
  storeLink: string;
  instagramLink: string;
  facebookLink: string;
  linkedinLink: string;
  supportEmail: string;
}

export interface BreakdownScore {
  taille_entreprise: number;
  intention_achat: number;
  budget_estime: number;
  timing: number;
  accessibilite: number;
}

export interface PotentielCommercial {
  valeur_deal_estimee: string;
  probabilite_conversion: string;
  cycle_vente_jours: number;
  urgence: string;
}

export interface Enrichment {
  ca_annuel: string;
  effectif: number;
  certifications: string[];
  projets: string;
}

export interface LeadAnalysis {
  id: string;
  nom_entreprise: string;
  score_qualification: number;
  breakdown_score: BreakdownScore;
  profil_comportemental: {
    mots_cles: string[];
    niveau_engagement: string;
    derniere_activite: string;
  };
  potentiel_commercial: PotentielCommercial;
  enrichissement: Enrichment;
  recommandations: string[];
}
