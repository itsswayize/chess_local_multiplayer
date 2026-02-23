import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardComponent } from './features/board/board.component';
import { MoveFeedbackComponent } from './features/move-feedback/move-feedback.component';
import { ControlsComponent } from './features/controls/controls.component';
import { GameStateService } from './core/services/game-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    BoardComponent, 
    MoveFeedbackComponent, 
    ControlsComponent
  ], 
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'chess-analyzer';
  
  whiteCapturedPieces: string[] = []; 
  blackCapturedPieces: string[] = []; 
  
  // New variables to track material advantage
  whiteAdvantage: number = 0;
  blackAdvantage: number = 0;
  
  private statusSub?: Subscription;

  constructor(public gameState: GameStateService) {}

  ngOnInit() {
    this.statusSub = this.gameState.status$.subscribe(status => {
      if (status?.fen) {
        this.calculateCapturedPieces(status.fen);
      }
    });
  }

  ngOnDestroy() {
    this.statusSub?.unsubscribe();
  }

  get currentTurn(): string {
    const status = this.gameState.getLatestStatus();
    return status?.turn === 'w' ? 'white' : 'black';
  }

  private calculateCapturedPieces(fen: string) {
    const boardPart = fen.split(' ')[0];
    
    const initialCounts: Record<string, number> = {
      'p': 8, 'n': 2, 'b': 2, 'r': 2, 'q': 1, 
      'P': 8, 'N': 2, 'B': 2, 'R': 2, 'Q': 1  
    };

    // Standard piece values for material calculation
    const pieceValues: Record<string, number> = {
      'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9,
      'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9
    };

    const currentCounts: Record<string, number> = {};
    let whiteMaterial = 0;
    let blackMaterial = 0;

    // Count pieces and calculate total material on the board
    for (const char of boardPart) {
      if (initialCounts[char] !== undefined) {
        currentCounts[char] = (currentCounts[char] || 0) + 1;
        
        // Calculate material points
        if (char === char.toUpperCase()) {
          whiteMaterial += pieceValues[char]; // White piece
        } else {
          blackMaterial += pieceValues[char]; // Black piece
        }
      }
    }

    // Calculate advantage
    if (whiteMaterial > blackMaterial) {
      this.whiteAdvantage = whiteMaterial - blackMaterial;
      this.blackAdvantage = 0;
    } else if (blackMaterial > whiteMaterial) {
      this.blackAdvantage = blackMaterial - whiteMaterial;
      this.whiteAdvantage = 0;
    } else {
      this.whiteAdvantage = 0;
      this.blackAdvantage = 0;
    }

    const whiteCaptured: string[] = [];
    const blackCaptured: string[] = [];

    const pieces = [
      { char: 'q', img: 'bq.png' }, { char: 'r', img: 'br.png' }, 
      { char: 'b', img: 'bb.png' }, { char: 'n', img: 'bn.png' }, { char: 'p', img: 'bp.png' },
      { char: 'Q', img: 'wq.png' }, { char: 'R', img: 'wr.png' }, 
      { char: 'B', img: 'wb.png' }, { char: 'N', img: 'wn.png' }, { char: 'P', img: 'wp.png' }
    ];

    for (const p of pieces) {
      const start = initialCounts[p.char];
      const current = currentCounts[p.char] || 0;
      const capturedCount = start - current;

      for (let i = 0; i < capturedCount; i++) {
        if (p.char === p.char.toLowerCase()) {
          whiteCaptured.push(`assets/pieces/${p.img}`);
        } else {
          blackCaptured.push(`assets/pieces/${p.img}`);
        }
      }
    }

    this.whiteCapturedPieces = whiteCaptured;
    this.blackCapturedPieces = blackCaptured;
  }
}