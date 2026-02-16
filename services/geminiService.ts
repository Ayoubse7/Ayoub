
import { GoogleGenAI, Type } from "@google/genai";
import { MY_PRODUCTS } from "../constants";
import { Lead, Sector } from "../types";

/**
 * Récupère les données brutes d'une Google Sheet.
 */
export const fetchGoogleSheetData = async (sheetUrl: string): Promise<string> => {
  try {
    let url = sheetUrl.trim();
    if (url.includes('/edit')) url = url.split('/edit')[0];

    if (url.includes('/d/e/')) {
      if (url.includes('/pubhtml')) url = url.replace('/pubhtml', '/pub?output=csv');
      else if (!url.includes('output=csv')) url = `${url}${url.includes('?') ? '&' : '?'}output=csv`;
    } 
    else if (url.includes('docs.google.com/spreadsheets/d/')) {
      const idMatch = url.match(/\/d\/([^/]+)/);
      if (idMatch && idMatch[1]) url = `https://docs.google.com/spreadsheets/d/${idMatch[1]}/export?format=csv`;
    }

    const response = await fetch(url, { method: 'GET', mode: 'cors', credentials: 'omit' });
    if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);

    const text = await response.text();
    if (text.trim().startsWith('<!DOCTYPE html>')) throw new Error("Accès Refusé : Fichier non publié sur le web.");
    return text;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Analyse le catalogue pour en extraire une stratégie commerciale.
 */
export const analyzeCatalogContent = async (catalogDescription: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Analyse ce catalogue d'équipements de laboratoire et définis la stratégie de vente :
  ---
  ${catalogDescription || JSON.stringify(MY_PRODUCTS)}
  ---
  Identifie : les points forts, les cibles idéales, le positionnement prix et les arguments massues.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            points_forts: { type: Type.ARRAY, items: { type: Type.STRING } },
            cibles_ideales: { type: Type.ARRAY, items: { type: Type.STRING } },
            argument_massue: { type: Type.STRING },
            positionnement: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Erreur analyse catalogue:", e);
    return null;
  }
};

/**
 * Analyse comportementale d'un lead basée sur un catalogue spécifique.
 */
export const analyzeLeadBehavior = async (lead: Lead, catalogContext: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
  CONTEXTE CATALOGUE : ${JSON.stringify(catalogContext)}
  LEAD À ANALYSER : ${JSON.stringify(lead)}
  
  En utilisant la stratégie du catalogue ci-dessus, analyse ce prospect.`;
  
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

export const parseLeadsFromSheet = async (textContent: string): Promise<Lead[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const validSectors = Object.values(Sector).join(", ");
  const prompt = `Extrais tous les leads de ce CSV en JSON : ${textContent}. Secteurs valides : ${validSectors}.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: { responseMimeType: "application/json" },
  });

  const parsed = JSON.parse(response.text || '[]');
  return parsed.map((lead: any, idx: number) => ({
    ...lead,
    id: lead.id || `L-${Date.now()}-${idx}`,
    localisation: lead.localisation || { ville: "Maroc", adresse: "" },
    contact: lead.contact || { nom: "", poste: "", email: "", telephone: "" },
    equipements_interesses: Array.isArray(lead.equipements_interesses) ? lead.equipements_interesses : [],
    date_capture: lead.date_capture || new Date().toISOString()
  }));
};

export const generateLeadAnalysis = async (leadData: Lead) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Analyse de qualification pour : ${JSON.stringify(leadData)}.`;
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
