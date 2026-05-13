/**
 * Registre des gammes de produits par marque.
 * Permet de déterminer le niveau technique théorique d'un produit.
 */
export const BRAND_REGISTRY: Record<string, any> = {
  // SKI / MONTAGNE
  "ROSSIGNOL": {
    ranges: [
      { name: "HERO", level: "PRO", keywords: ["elite", "st", "lt", "racing"] },
      { name: "EXPERIENCE", level: "INTERMEDIATE", keywords: ["all mountain", "polyvalent"] },
      { name: "PURSUIT", level: "BEGINNER", keywords: ["piste", "facile"] }
    ]
  },
  "SALOMON": {
    ranges: [
      { name: "S/RACE", level: "PRO", keywords: ["pro", "rush", "fis"] },
      { name: "S/MAX", level: "ADVANCED", keywords: ["blast", "ti"] },
      { name: "QST", level: "INTERMEDIATE", keywords: ["freeride", "lumen"] }
    ]
  },
  "HEAD": {
    ranges: [
      { name: "WORLD CUP", level: "PRO", keywords: ["rebels", "i.speed"] },
      { name: "KORE", level: "ADVANCED", keywords: ["freeride", "lightweight"] }
    ]
  },
  // TENNIS / PADEL
  "WILSON": {
    ranges: [
      { name: "PRO STAFF", level: "PRO", keywords: ["federer", "autograph", "v13", "v14"] },
      { name: "BLADE", level: "ADVANCED", keywords: ["control", "feel"] },
      { name: "ULTRA", level: "INTERMEDIATE", keywords: ["power", "v4"] }
    ]
  },
  "BABOLAT": {
    ranges: [
      { name: "PURE DRIVE", level: "ADVANCED", keywords: ["power", "blue"] },
      { name: "PURE AERO", level: "ADVANCED", keywords: ["nadal", "spin"] },
      { name: "PURE STRIKE", level: "PRO", keywords: ["control", "white"] }
    ]
  },
  // CYCLISME
  "SPECIALIZED": {
    ranges: [
      { name: "S-WORKS", level: "PRO", keywords: ["tarmac", "roubaix", "venge", "epic"] },
      { name: "EXPERT", level: "ADVANCED", keywords: ["carbon", "tiagra", "105"] },
      { name: "ALLEZ", level: "BEGINNER", keywords: ["sport", "alu"] }
    ]
  },
  "TREK": {
    ranges: [
      { name: "MADONE", level: "PRO", keywords: ["slr", "sl", "race"] },
      { name: "DOMANE", level: "INTERMEDIATE", keywords: ["endurance", "confort"] },
      { name: "EMONDA", level: "ADVANCED", keywords: ["climb", "light"] }
    ]
  },
  "CANYON": {
    ranges: [
      { name: "AEROAD", level: "PRO", keywords: ["cfr", "slx"] },
      { name: "ULTIMATE", level: "ADVANCED", keywords: ["climb", "cf"] },
      { name: "ENDURACE", level: "INTERMEDIATE", keywords: ["long ride", "al"] }
    ]
  },
  // OUTDOOR / TEXTILE TECHNIQUE
  "ARC'TERYX": {
    ranges: [
      { name: "ALPHA", level: "PRO", keywords: ["climbing", "alpine", "sv", "ar"] },
      { name: "BETA", level: "ADVANCED", keywords: ["all round", "gore-tex"] },
      { name: "GAMMA", level: "INTERMEDIATE", keywords: ["softshell", "hiking"] }
    ]
  },
  "PATAGONIA": {
    ranges: [
      { name: "NANO PUFF", level: "INTERMEDIATE", keywords: ["insulation", "lightweight"] },
      { name: "R1", level: "ADVANCED", keywords: ["technical fleece", "climbing"] }
    ]
  },
  // GOLF
  "TAYLORMADE": {
    ranges: [
      { name: "STEALTH", level: "ADVANCED", keywords: ["driver", "carbonwood"] },
      { name: "P790", level: "PRO", keywords: ["irons", "forged"] },
      { name: "SIM", level: "INTERMEDIATE", keywords: ["max", "forgiveness"] }
    ]
  },
  // SNOWBOARD / SURF
  "BURTON": {
    ranges: [
      { name: "CUSTOM", level: "ADVANCED", keywords: ["flying v", "camber"] },
      { name: "PROCESS", level: "INTERMEDIATE", keywords: ["park", "freestyle"] },
      { name: "ANON", level: "INTERMEDIATE", keywords: ["helmet", "goggles"] }
    ]
  }
};

/**
 * Fonction pour extraire le niveau théorique basé sur le titre/description
 */
export function getTheoreticalLevel(brandName: string, text: string): string | null {
  if (!brandName) return null;
  
  const brand = BRAND_REGISTRY[brandName.toUpperCase()];
  if (!brand) return null;

  const upperText = text.toUpperCase();
  
  for (const range of brand.ranges) {
    // Si le nom de la gamme est présent dans le texte
    if (upperText.includes(range.name.toUpperCase())) {
      return range.level;
    }
    // Sinon on cherche les mots clés spécifiques
    if (range.keywords.some((k: string) => upperText.includes(k.toUpperCase()))) {
      return range.level;
    }
  }

  return null;
}
