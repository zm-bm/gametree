import type { OpeningBookEntry } from "@/types";

type EcoLookup = (uciPath: string) => OpeningBookEntry | null;
type EcoModule = { getECOByUciPath: EcoLookup };

let cachedEcoLookup: EcoLookup | null = null;
let ecoLookupModulePromise: Promise<EcoModule> | null = null;

const loadEcoLookup = async (): Promise<EcoLookup> => {
  if (cachedEcoLookup) return cachedEcoLookup;

  if (!ecoLookupModulePromise) {
    ecoLookupModulePromise = import("./eco");
  }

  const module = await ecoLookupModulePromise;
  cachedEcoLookup = module.getECOByUciPath;
  return cachedEcoLookup;
};

export const getECOByUciPathIfReady = (uciPath: string): OpeningBookEntry | null | undefined => {
  if (!uciPath) return null;
  if (!cachedEcoLookup) return undefined;

  try {
    return cachedEcoLookup(uciPath);
  } catch {
    return null;
  }
};

export const getECOByUciPathLazy = async (uciPath: string): Promise<OpeningBookEntry | null> => {
  if (!uciPath) return null;

  try {
    const lookup = await loadEcoLookup();
    return lookup(uciPath);
  } catch {
    return null;
  }
};

export const __resetOpeningLazyCacheForTests = () => {
  cachedEcoLookup = null;
  ecoLookupModulePromise = null;
};

