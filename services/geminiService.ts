
import { GoogleGenAI, Type } from "@google/genai";

export const generateDailyLeads = async () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const todayDate = new Date().toISOString().split('T')[0];
  
  const prompt = `Agis en tant qu'expert en intelligence économique B2B au Maroc. 
  Aujourd'hui nous sommes le ${todayDate}. 
  RECHERCHE activement les actualités industrielles, les appels d'offres et les annonces de projets pour 2024-2025 sur :
  - "Nouveaux laboratoires de contrôle qualité Maroc"
  - "Extensions d'unités industrielles pharmaceutiques Casablanca/Tanger"
  - "Investissements OCP laboratoires R&D"
  - "Nouveaux centres de diagnostic médical privés Maroc"
  - "Certifications ISO 17025 entreprises agroalimentaires Maroc"

  Génère ensuite une liste de EXACTEMENT 20 leads potentiels. 
  Pour chaque lead, identifie une "raison_opportunite" basée sur des signaux réels (ex: "Extension d'usine annoncée hier", "Nouveau budget R&D validé pour 2025").

  IMPORTANT: Renvoie uniquement un tableau JSON pur sans balises markdown, suivant cette structure :
  {
    "id": "LEAD-2025-XXX (id unique)",
    "nom_entreprise": "Nom Réel ou très plausible",
    "secteur": "Pharmacie | Médical/Clinique | Agroalimentaire | Chimie | Mines | Cosmétique | Environnement/Eau | Cimenterie | Recherche/Universités",
    "contact": { "nom": "Nom", "poste": "Poste", "email": "Email", "telephone": "Tel" },
    "localisation": { "ville": "Ville Marocaine", "adresse": "Adresse" },
    "source": "Source du signal",
    "mot_cle_declencheur": "Signal détecté",
    "raison_opportunite": "Description précise du besoin détecté",
    "niveau_intention": "Haute | Moyenne | Basse",
    "equipements_interesses": ["Eq1", "Eq2"],
    "date_capture": "${todayDate}"
  }`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }]
    },
  });

  try {
    const text = response.text || '[]';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const cleanJson = jsonMatch ? jsonMatch[0] : text;
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("Erreur parsing leads avec Search", e);
    return [];
  }
};

export const generateLeadAnalysis = async (leadData: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Analyse ce lead de prospection B2B au Maroc : ${JSON.stringify(leadData)}. 
  Fournis une analyse structurée en JSON avec scores de qualification et recommandations basées sur l'opportunité spécifique détectée (${leadData.raison_opportunite}).`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 0 },
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
    },
  });

  return JSON.parse(response.text || '{}');
};

export const getMarketInsights = async (equipmentName: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
       model: "gemini-3-flash-preview",
       contents: `Donne-moi les dernières tendances et concurrents pour l'équipement de laboratoire "${equipmentName}" au Maroc en 2024-2025.`,
       config: {
         tools: [{googleSearch: {}}],
       },
    });
    return {
        text: response.text || '',
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
};
