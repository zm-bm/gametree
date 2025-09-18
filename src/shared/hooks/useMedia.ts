import { useEffect, useState } from "react";

export function useMedia(query: string) {
  const [match, set] = useState<boolean>(() => window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const handleChange = () => set(media.matches);

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [query]);

  return match;
}