/**
 * Service d'IA local utilisant Transformers.js
 * Ce service est conçu comme un singleton pour ne charger le modèle qu'une seule fois.
 */
class AIService {
  private static instance: AIService;
  private extractor: any = null;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): AIService {
    // Évite la duplication lors des rechargements à chaud (hot reload) Next.js en stockant l'instance globalement
    const globalSpace = globalThis as any;
    if (!globalSpace.aiServiceInstance) {
      globalSpace.aiServiceInstance = new AIService();
    }
    return globalSpace.aiServiceInstance;
  }

  /**
   * Initialise le modèle (téléchargement au premier appel)
   * Protégé contre les appels asynchrones concurrents (Race Conditions)
   */
  private async init() {
    if (this.extractor) return;

    if (!this.initPromise) {
      this.initPromise = (async () => {
        console.log("📥 [AI] Initialisation du modèle Transformers.js...");
        // Import dynamique pour éviter les erreurs de build Turbopack
        const { pipeline, env } = await import('@xenova/transformers');
        
        // Configuration du cache local pour éviter les problèmes de permissions Docker
        env.cacheDir = './.next/cache/transformers';
        
        console.log("📥 [AI] Chargement du modèle 'all-MiniLM-L6-v2' (environ 80Mo)...");
        // On utilise un modèle léger d'embeddings (80Mo)
        this.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        console.log("✅ [AI] Modèle chargé et prêt !");
      })();
    }

    await this.initPromise;
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
