import eco from "./eco.json";

import { MovePath, OpeningBookEntry } from "@/shared/types";

const book = eco as OpeningBookEntry[];
const bookByUci = new Map<string, OpeningBookEntry>();

for (const entry of book) {
  if (!bookByUci.has(entry.uci)) {
    bookByUci.set(entry.uci, entry);
  }
}

export function getECOByUciPath(uciPath: string) {
  if (!uciPath) return null;

  let cursor = uciPath;
  while (cursor) {
    const ecoEntry = bookByUci.get(cursor);
    if (ecoEntry) return ecoEntry;

    const pivot = cursor.lastIndexOf(",");
    if (pivot === -1) return null;
    cursor = cursor.slice(0, pivot);
  }

  return null;
}

export function getECO(path: MovePath) {
  if (path.length === 0) return null;
  return getECOByUciPath(path.map((move) => move.lan).join(","));
}
