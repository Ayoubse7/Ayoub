
import React from 'react';
import { Sector, Lead } from './types';

export const SECTORS_LIST = Object.values(Sector);

export const MOCK_LEADS: Lead[] = [
  {
    id: "LEAD-20260207-001",
    nom_entreprise: "Laboratoires PharmaCare",
    secteur: Sector.PHARMACY,
    contact: {
      nom: "Dr. Amina Benjelloun",
      poste: "Directrice Qualité",
      email: "a.benjelloun@pharmacare.ma",
      telephone: "+212 522 123 456"
    },
    localisation: {
      ville: "Casablanca",
      adresse: "Zone Industrielle Ain Sebaa"
    },
    source: "LinkedIn Sales Navigator",
    mot_cle_declencheur: "acheter chromatographe HPLC Maroc",
    // Fix: Added missing required property raison_opportunite
    raison_opportunite: "Projet d'extension du laboratoire de contrôle qualité suite à l'obtention de nouvelles autorisations de mise sur le marché.",
    niveau_intention: "Haute",
    equipements_interesses: ["HPLC", "Spectrophotomètre", "Balance analytique"],
    date_capture: "2026-02-07 09:15:00"
  },
  {
    id: "LEAD-20260207-002",
    nom_entreprise: "Clinique Atlas",
    secteur: Sector.MEDICAL,
    contact: {
      nom: "Ahmed Mansouri",
      poste: "Gestionnaire Achats",
      email: "a.mansouri@cliniqueatlas.ma",
      telephone: "+212 522 987 654"
    },
    localisation: {
      ville: "Rabat",
      adresse: "Agdal"
    },
    source: "Google Maps",
    mot_cle_declencheur: "équipement laboratoire analyse médicale",
    // Fix: Added missing required property raison_opportunite
    raison_opportunite: "Ouverture d'une nouvelle unité de diagnostic cardiologique nécessitant des équipements d'analyse de pointe.",
    niveau_intention: "Haute",
    equipements_interesses: ["Analyseur hématologie", "Automate biochimie"],
    date_capture: "2026-02-07 10:30:00"
  },
  {
      id: "LEAD-20260207-003",
      nom_entreprise: "Cimenterie du Sud",
      secteur: Sector.CEMENT,
      contact: {
        nom: "Youssef Zaki",
        poste: "Chef Labo R&D",
        email: "y.zaki@cimentsud.ma",
        telephone: "+212 528 555 111"
      },
      localisation: {
        ville: "Agadir",
        adresse: "Route de Biougra"
      },
      source: "Web Monitoring",
      mot_cle_declencheur: "matériel test résistance béton",
      // Fix: Added missing required property raison_opportunite
      raison_opportunite: "Mise à niveau du laboratoire central pour se conformer aux nouvelles normes de durabilité et environnementales.",
      niveau_intention: "Moyenne",
      equipements_interesses: ["Presse à béton", "Étuve"],
      date_capture: "2026-02-07 11:00:00"
  },
  {
    id: "LEAD-20260207-004",
    nom_entreprise: "AgroLab Morocco",
    secteur: Sector.AGRO,
    contact: {
      nom: "Khadija Idrissi",
      poste: "Responsable Qualité",
      email: "k.idrissi@agrolab.ma",
      telephone: "+212 522 444 333"
    },
    localisation: {
      ville: "Meknès",
      adresse: "Quartier Industriel"
    },
    source: "LinkedIn",
    mot_cle_declencheur: "analyseur composition aliments",
    // Fix: Added missing required property raison_opportunite
    raison_opportunite: "Création d'un département R&D dédié à l'analyse nutritionnelle pour l'exportation vers le marché européen.",
    niveau_intention: "Haute",
    equipements_interesses: ["Analyseur NIR", "Hotte à flux laminaire"],
    date_capture: "2026-02-07 11:45:00"
  }
];

export const UI_COLORS = {
  primary: "#2563eb",
  secondary: "#64748b",
  success: "#22c55e",
  danger: "#ef4444",
  warning: "#f59e0b",
  info: "#06b6d4"
};
