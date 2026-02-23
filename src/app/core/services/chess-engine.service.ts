import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ChessEngineService {
  private worker: Worker | null = null;
  private prevEvaluation: number = 0.0;

  constructor() {
    // Initialize Stockfish Worker (assuming stockfish.js is in assets)
    this.worker = new Worker('assets/engine/stockfish.js');
    this.worker.onmessage = (e) => this.handleEngineMessage(e.data);
  }

  analyzePosition(fen: string) {
    this.worker?.postMessage(`position fen ${fen}`);
    this.worker?.postMessage('go depth 15');
  }

  private handleEngineMessage(message: string) {
  if (message.includes('score cp')) {
    const currentEval = this.extractScore(message);
    const evalDrop = Math.abs(this.prevEvaluation - currentEval);
    
    let classification: 'Good' | 'Inaccuracy' | 'Mistake' | 'Blunder' = 'Good';

    // PRD Classification Rules
    if (evalDrop > 3.0) classification = 'Blunder';
    else if (evalDrop > 1.0) classification = 'Mistake';
    else if (evalDrop > 0.3) classification = 'Inaccuracy';
    else classification = 'Good';

    console.log(`Move Quality: ${classification} (Drop: ${evalDrop.toFixed(2)})`);
    
    // Update the previous eval for the next turn
    this.prevEvaluation = currentEval;
  }
}

  private extractScore(m: string): number {
    const parts = m.split(' ');
    const scoreIndex = parts.indexOf('cp');
    return parseInt(parts[scoreIndex + 1]) / 100;
  }


}