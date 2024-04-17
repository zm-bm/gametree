import Stockfish from 'stockfish/src/stockfish-nnue-16.js?worker'

export default class Engine {
  private worker: Worker | null = null;
  private dispatch: React.Dispatch<React.SetStateAction<string>> | null = null;

  constructor() {
    this.initWorker();
    this.postMessage('uci');
  }

  private initWorker(): void {
    if (typeof Stockfish !== 'undefined') {
      this.worker = new Stockfish();
      this.worker.onmessage = this.onmessage;
      this.worker.onerror = this.handleError;
    } else {
      console.error("Web Workers are not supported in this environment.");
    }
  }

  private onmessage = (event: MessageEvent<string>): void => {
    const { data } = event;
    console.log('> ', data);
    if (this.dispatch) {
      this.dispatch(data)
    }
  };

  public addDispatch = (dispatch: React.Dispatch<React.SetStateAction<string>>) => {
    this.dispatch = dispatch;
  }

  private handleError = (event: ErrorEvent): void => {
    console.error(`Worker error: ${event.message}`, event);
  };

  public postMessage(cmd: string): void {
    if (this.worker) {
      this.worker.postMessage(cmd);
    } else {
      console.error("Worker is not initialized.");
    }
  }

  public terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}
