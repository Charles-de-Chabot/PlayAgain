import prisma from "@/lib/prisma";

export interface FinanceFeeRules {
  commissionRate: number; // e.g. 5.0 for 5%
  flatFee: number;       // e.g. 0.70 for 0.70€
}

export const DEFAULT_FINANCE_FEE_RULES: FinanceFeeRules = {
  commissionRate: 5.0,
  flatFee: 0.70,
};

export async function getSystemConfig<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key },
    });
    if (!config) {
      return defaultValue;
    }
    return JSON.parse(config.value) as T;
  } catch (error) {
    console.error(`Error fetching system config for key ${key}:`, error);
    return defaultValue;
  }
}

export async function setSystemConfig<T>(key: string, value: T): Promise<boolean> {
  try {
    await prisma.systemConfig.upsert({
      where: { key },
      update: { value: JSON.stringify(value) },
      create: { key, value: JSON.stringify(value) },
    });
    return true;
  } catch (error) {
    console.error(`Error saving system config for key ${key}:`, error);
    return false;
  }
}
