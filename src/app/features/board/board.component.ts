import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { GameStateService } from '../../core/services/game-state.service';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  boardGrid: any[][] = [];
  
  pieceImages: { [key: string]: string } = {
    'p': 'assets/pieces/bp.png',
    'r': 'assets/pieces/br.png',
    'n': 'assets/pieces/bn.png',
    'b': 'assets/pieces/bb.png',
    'q': 'assets/pieces/bq.png',
    'k': 'assets/pieces/bk.png',
    'P': 'assets/pieces/wp.png',
    'R': 'assets/pieces/wr.png',
    'N': 'assets/pieces/wn.png',
    'B': 'assets/pieces/wb.png',
    'Q': 'assets/pieces/wq.png',
    'K': 'assets/pieces/wk.png'
  };

  // --- New variables for pawn promotion ---
  pendingPromotion: { from: string, to: string, toRank: number, toFile: number } | null = null;
  promotionColor: 'w' | 'b' = 'w';

  // CHANGED: constructor uses 'public' so the template can access gameState.status$
  constructor(public gameState: GameStateService) {}

  ngOnInit(): void {
    this.gameState.status$.subscribe(status => {
      if (status) this.renderBoard(status.fen);
    });
  }

  // Add this method inside your BoardComponent class
  isKingInCheck(piece: string | null, row: number, col: number): boolean {
    if (!piece) return false;

    // Retrieve current game status from the service
    // We use the current turn to identify which king should be highlighted red
    const status = this.gameState.getLatestStatus(); 
    if (!status || !status.isCheck) return false;

    const isWhiteTurn = status.turn === 'w';
    
    // Check if the piece is the King belonging to the side currently in check
    // 'K' is white king, 'k' is black king
    const isTargetKing = isWhiteTurn ? piece === 'K' : piece === 'k';
    
    return isTargetKing;
  }

  renderBoard(fen: string) {
    const rows = fen.split(' ')[0].split('/');
    this.boardGrid = rows.map(row => {
      const boardRow: any[] = [];
      for (const char of row) {
        if (isNaN(parseInt(char))) boardRow.push(char);
        else for (let i = 0; i < parseInt(char); i++) boardRow.push(null);
      }
      return boardRow;
    });
  }

  // --- Update your existing onDrop method ---
  onDrop(event: any, rIdx: number, cIdx: number) {
    const from = event.item.data;
    const to = this.getAlgebraicCoords(rIdx, cIdx);

    // Grab the image element to easily check if the moving piece is a pawn
    const imgElement = event.item.element.nativeElement as HTMLImageElement;
    const isWhitePawn = imgElement.src.includes('wp.png');
    const isBlackPawn = imgElement.src.includes('bp.png');

    // If White reaches rank index 0, or Black reaches rank index 7, it's a promotion
    const isPromotion = (isWhitePawn && rIdx === 0) || (isBlackPawn && rIdx === 7);

    if (isPromotion) {
      // Pause the move and show the UI
      this.pendingPromotion = { from, to, toRank: rIdx, toFile: cIdx };
      this.promotionColor = isWhitePawn ? 'w' : 'b';
      return; 
    }

    // Normal move execution
    this.gameState.move(from, to);
  }

  public getAlgebraicCoords(row: number, col: number): string {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    return files[col] + ranks[row];
  }

  // --- Add these new helper methods ---
  confirmPromotion(piece: string) {
    if (this.pendingPromotion) {
      this.gameState.move(this.pendingPromotion.from, this.pendingPromotion.to, piece);
      this.pendingPromotion = null;
    }
  }

  cancelPromotion() {
    this.pendingPromotion = null;
  }

  // Dynamically positions the popup exactly over the target square
  getPromotionStyle() {
    if (!this.pendingPromotion) return {};
    const isWhite = this.promotionColor === 'w';
    return {
      'left': `calc(${this.pendingPromotion.toFile} * 12.5%)`,
      'top': isWhite ? '0' : 'auto',
      'bottom': isWhite ? 'auto' : '0'
    };
  }
}