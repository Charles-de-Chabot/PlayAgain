/**
 * Service d'IA local utilisant Transformers.js
 * Ce service est conçu comme un singleton pour ne charger le modèle qu'une seule fois.
 */
class AIService {
  private static instance: AIService;
  private extractor: any = null;

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Initialise le modèle (téléchargement au premier appel)
   */
  private async init() {
    if (!this.extractor) {
      console.log("📥 [AI] Initialisation du modèle Transformers.js...");
      // Import dynamique pour éviter les erreurs de build Turbopack
      const { pipeline, env } = await import('@xenova/transformers');
      
      // Configuration du cache local pour éviter les problèmes de permissions Docker
      env.cacheDir = './.next/cache/transformers';
      
      console.log("📥 [AI] Chargement du modèle 'all-MiniLM-L6-v2' (environ 80Mo)...");
      // On utilise un modèle léger d'embeddings (80Mo)
      this.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      console.log("✅ [AI] Modèle chargé et prêt !");
    }
  }

  /**
   * Transforme un texte en vecteur (embedding)
   */
  public async getEmbedding(text: string): Promise<number[]> {
    await this.init();
    const output = await this.extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  }

  /**
   * Calcule la similarité entre deux textes (0 à 1)
   */
  public cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

export const aiService = AIService.getInstance();
