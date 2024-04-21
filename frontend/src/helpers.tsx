export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...funcArgs: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return function(...args: Parameters<T>): void {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

export const recommendedThreads = () => {
  var rec = navigator.hardwareConcurrency - (navigator.hardwareConcurrency % 2 ? 0 : 1)
  rec = Math.max(rec, 1)
  return Math.min(rec, 32)
}

export const parseSpeed = (line: string) => {
  const speed = line.match(/nps (\w+)/);
  return speed ? +speed[1] : undefined;
}

export const setOption = (name: string, value: string | number) =>
  `setoption name ${name} value ${value}`

export const setPos = (fen: string) => `position fen ${fen}`
