
import { GoogleGenAI, Type } from "@google/genai";
import { MY_PRODUCTS } from "../constants";
import { Lead, Sector } from "../types";

/**
 * Récupère les données brutes d'une Google Sheet.
 * Transforme intelligemment l'URL pour éviter les problèmes de CORS et de redirection.
 */
export const fetchGoogleSheetData = async (sheetUrl: string): Promise<string> => {
  try {
    let url = sheetUrl.trim();
    
    // Nettoyage de l'URL si elle contient des paramètres de visualisation inutiles
    if (url.includes('/edit')) {
      url = url.split('/edit')[0];
    }

    // Cas 1 : URL "Publier sur le web" (contient /d/e/2PACX-...)
    if (url.includes('/d/e/')) {
      if (url.includes('/pubhtml')) {
        url = url.replace('/pubhtml', '/pub?output=csv');
      } else if (!url.includes('output=csv')) {
        const separator = url.includes('?') ? '&' : '?';
        url = `${url}${separator}output=csv`;
      }
    } 
    // Cas 2 : URL de partage standard (contient /d/ID_FICHIER)
    else if (url.includes('docs.google.com/spreadsheets/d/')) {
      const idMatch = url.match(/\/d\/([^/]+)/);
      if (idMatch && idMatch[1]) {
        const sheetId = idMatch[1];
        // Forcer l'export CSV qui est le format le plus stable pour fetch avec CORS
        url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      }
    }

    console.log("Tentative d'accès à :", url);

    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit' // Important pour éviter les problèmes de session Google
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}: Impossible d'accéder au fichier. Assurez-vous qu'il est partagé en "Lecteur" pour "Tous les utilisateurs disposant du lien".`);
    }

    const text = await response.text();

    // Détection critique : si Google renvoie une page HTML, c'est que l'accès est bloqué par une demande de connexion
    if (text.trim().startsWith('<!DOCTYPE html>') || text.trim().startsWith('<html')) {
      throw new Error("Accès Refusé : Le lien renvoie vers une page de connexion Google. Veuillez 'Publier sur le web' le document (Fichier > Partager > Publier sur le web) ou le mettre en partage public 'Lecteur'.");
    }

    if (text.length < 5) {
      throw new Error("Le fichier semble vide.");
    }

    return text;
  } catch (error: any) {
    console.error("Erreur fetch détaillée:", error);
    if (error.message === 'Failed to fetch') {
      throw new Error("Échec de connexion (CORS/Réseau) : Google bloque l'accès direct. Utilisez l'option 'Fichier > Partager > Publier sur le web' dans Google Sheets et copiez ce lien.");
    }
    throw error;
  }
};

/**
 * Convertit le contenu brut en liste de Leads via Gemini.
 * Force le traitement de TOUTES les lignes.
 */
export const parseLeadsFromSheet = async (textContent: string): Promise<Lead[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const validSectors = Object.values(Sector).join(", ");

  const prompt = `Tu es un expert en traitement de données massives. Voici des données brutes (CSV/TSV) issues d'une prospection :
  ---
  ${textContent}
  ---
  
  TA MISSION : Extraire ABSOLUMENT TOUTES les lignes de ce document. Ne résume pas, n'en oublie aucune.
  
  RÈGLES D'EXTRACTION :
  1. Chaque ligne de l'entrée doit devenir un objet dans le tableau JSON final.
  2. Mappe les colonnes vers ces champs :
     - "company_name" -> nom_entreprise
     - "industry" -> secteur (Mappe vers : ${validSectors})
     - "city" -> localisation.ville
     - "email" -> contact.email
     - "phone" -> contact.telephone
     - "decision_maker" -> contact.nom
     - "potential_needs" -> raison_opportunite (et liste les équipements dans equipements_interesses)
     - "priority_level" -> niveau_intention ("Haute", "Moyenne" ou "Basse")
  
  IMPORTANT :
  - Si un champ est vide, mets une chaîne vide "".
  - Retourne UNIQUEMENT le tableau JSON.
  - Assure-toi que chaque objet a une structure complète (localisation et contact présents).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // Version Pro pour gérer les longs contextes
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const parsed = JSON.parse(response.text || '[]');
    if (!Array.isArray(parsed)) return [];

    return parsed.map((lead: any, idx: number) => ({
      ...lead,
      id: lead.id || `L-${Date.now()}-${idx}`,
      localisation: lead.localisation || { ville: "Maroc", adresse: "" },
      contact: lead.contact || { nom: "", poste: "", email: "", telephone: "" },
      equipements_interesses: Array.isArray(lead.equipements_interesses) ? lead.equipements_interesses : []
    }));
  } catch (e) {
    console.error("Erreur parsing IA:", e);
    return [];
  }
};

export const analyzeLeadBehavior = async (lead: Lead) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Analyse comportementale pour : ${JSON.stringify(lead)}
  Catalogue : ${JSON.stringify(MY_PRODUCTS)}`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          profile: { type: Type.STRING },
          behavioral_traits: { type: Type.ARRAY, items: { type: Type.STRING } },
          product_matching: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                product_name: { type: Type.STRING },
                fit_score: { type: Type.NUMBER },
                why: { type: Type.STRING }
              }
            }
          },
          fears_and_objections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { objection: { type: Type.STRING }, counter_argument: { type: Type.STRING } }
            }
          },
          sales_script: { type: Type.STRING }
        }
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const generateLeadAnalysis = async (leadData: Lead) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Qualification complète pour : ${JSON.stringify(leadData)}.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          nom_entreprise: { type: Type.STRING },
          score_qualification: { type: Type.NUMBER },
          breakdown_score: {
            type: Type.OBJECT,
            properties: {
              taille_entreprise: { type: Type.NUMBER },
              intention_achat: { type: Type.NUMBER },
              budget_estime: { type: Type.NUMBER },
              timing: { type: Type.NUMBER },
              accessibilite: { type: Type.NUMBER }
            }
          },
          profil_comportemental: {
            type: Type.OBJECT,
            properties: {
              mots_cles: { type: Type.ARRAY, items: { type: Type.STRING } },
              niveau_engagement: { type: Type.STRING },
              derniere_activite: { type: Type.STRING }
            }
          },
          potentiel_commercial: {
            type: Type.OBJECT,
            properties: {
              valeur_deal_estimee: { type: Type.STRING },
              probabilite_conversion: { type: Type.STRING },
              cycle_vente_jours: { type: Type.NUMBER },
              urgence: { type: Type.STRING }
            }
          },
          enrichissement: {
            type: Type.OBJECT,
            properties: {
              ca_annuel: { type: Type.STRING },
              effectif: { type: Type.NUMBER },
              certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
              projets: { type: Type.STRING }
            }
          },
          recommandations: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });
  return JSON.parse(response.text || '{}');
};
