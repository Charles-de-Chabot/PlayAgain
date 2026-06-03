import fs from "fs";
import path from "path";

export interface SeoConfig {
  title: string;
  description: string;
  keywords: string;
}

export interface SeoConfigs {
  [key: string]: SeoConfig;
}

export function getSeoMetadata(pageKey: string): { title: string; description: string; keywords?: string } | null {
  try {
    const configPath = path.join(process.cwd(), "config", "seo.json");
    if (!fs.existsSync(configPath)) {
      return null;
    }
    const content = fs.readFileSync(configPath, "utf8");
    const configs: SeoConfigs = JSON.parse(content);
    const pageConfig = configs[pageKey];
    if (pageConfig) {
      return {
        title: pageConfig.title,
        description: pageConfig.description,
        keywords: pageConfig.keywords,
      };
    }
  } catch (e) {
    console.error(`Error reading SEO config for pageKey "${pageKey}":`, e);
  }
  return null;
}
