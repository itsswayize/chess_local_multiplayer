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
    'p': 'assets/pieces/bp.png', 'r': 'assets/pieces/br.png', 'n': 'assets/pieces/bn.png',
    'b': 'assets/pieces/bb.png', 'q': 'assets/pieces/bq.png', 'k': 'assets/pieces/bk.png',
    'P': 'assets/pieces/wp.png', 'R': 'assets/pieces/wr.png', 'N': 'assets/pieces/wn.png',
    'B': 'assets/pieces/wb.png', 'Q': 'assets/pieces/wq.png', 'K': 'assets/pieces/wk.png'
  };

  // --- Pawn Promotion State ---
  pendingPromotion: { from: string, to: string, toRank: number, toFile: number } | null = null;
  promotionColor: 'w' | 'b' = 'w';

  // --- Click-to-Move State ---
  selectedSquare: string | null = null;
  legalMoves: string[] = [];

  constructor(public gameState: GameStateService) {}

  ngOnInit(): void {
    this.gameState.status$.subscribe(status => {
      if (status) this.renderBoard(status.fen);
    });
  }

  isKingInCheck(piece: string | null, row: number, col: number): boolean {
    if (!piece) return false;
    const status = this.gameState.getLatestStatus(); 
    if (!status || !status.isCheck) return false;
    return (status.turn === 'w') ? piece === 'K' : piece === 'k';
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

  // --- CLICK-TO-MOVE LOGIC ---
  onSquareClick(rIdx: number, cIdx: number) {
    const algebraic = this.getAlgebraicCoords(rIdx, cIdx);
    const clickedPiece = this.boardGrid[rIdx][cIdx];
    const status = this.gameState.getLatestStatus();
    
    // Safety check - do nothing if game is over
    if (!status || status.isCheckmate || status.isDraw) return;
    const currentTurn = status.turn;

    if (this.selectedSquare) {
      // 1. Clicked the exact same square -> Deselect
      if (this.selectedSquare === algebraic) {
        this.clearSelection();
        return;
      }

      // 2. Clicked a valid legal move destination -> Execute Move
      if (this.legalMoves.includes(algebraic)) {
        const selectedRIdx = this.getRankIdx(this.selectedSquare);
        const selectedCIdx = this.getFileIdx(this.selectedSquare);
        const selectedPiece = this.boardGrid[selectedRIdx][selectedCIdx];
        
        // Handle Pawn Promotion on Click
        const isWhitePawn = selectedPiece === 'P';
        const isBlackPawn = selectedPiece === 'p';
        const isPromotion = (isWhitePawn && rIdx === 0) || (isBlackPawn && rIdx === 7);

        if (isPromotion) {
          this.pendingPromotion = { from: this.selectedSquare, to: algebraic, toRank: rIdx, toFile: cIdx };
          this.promotionColor = isWhitePawn ? 'w' : 'b';
          this.clearSelection(); 
          return;
        }

        // Standard Move execution
        this.gameState.move(this.selectedSquare, algebraic);
        this.clearSelection();
        return;
      }

      // 3. Clicked another friendly piece -> Switch Selection
      if (clickedPiece && this.isPieceOfColor(clickedPiece, currentTurn)) {
        this.selectSquare(algebraic);
        return;
      }

      // 4. Clicked anywhere else (invalid square) -> Deselect
      this.clearSelection();
    } else {
      // No piece selected yet -> Select it if it belongs to the current turn's player
      if (clickedPiece && this.isPieceOfColor(clickedPiece, currentTurn)) {
        this.selectSquare(algebraic);
      }
    }
  }

  // Helpers for click-to-move
  private isPieceOfColor(piece: string, color: 'w' | 'b'): boolean {
    if (!piece) return false;
    return color === 'w' ? piece === piece.toUpperCase() : piece === piece.toLowerCase();
  }

  private selectSquare(algebraic: string) {
    this.selectedSquare = algebraic;
    this.legalMoves = this.gameState.getLegalMoves(algebraic);
  }

  private clearSelection() {
    this.selectedSquare = null;
    this.legalMoves = [];
  }

  isLegalMove(rIdx: number, cIdx: number): boolean {
    if (!this.selectedSquare) return false;
    return this.legalMoves.includes(this.getAlgebraicCoords(rIdx, cIdx));
  }

  private getRankIdx(algebraic: string): number {
    return 8 - parseInt(algebraic[1]);
  }

  private getFileIdx(algebraic: string): number {
    return algebraic.charCodeAt(0) - 97; 
  }

  // --- DRAG AND DROP LOGIC ---
  onDrop(event: any, rIdx: number, cIdx: number) {
    this.clearSelection(); // Prevent visual glitches if user drags while a piece is clicked
    const from = event.item.data;
    const to = this.getAlgebraicCoords(rIdx, cIdx);

    const imgElement = event.item.element.nativeElement as HTMLImageElement;
    const isWhitePawn = imgElement.src.includes('wp.png');
    const isBlackPawn = imgElement.src.includes('bp.png');
    const isPromotion = (isWhitePawn && rIdx === 0) || (isBlackPawn && rIdx === 7);

    if (isPromotion) {
      this.pendingPromotion = { from, to, toRank: rIdx, toFile: cIdx };
      this.promotionColor = isWhitePawn ? 'w' : 'b';
      return; 
    }

    this.gameState.move(from, to);
  }

  public getAlgebraicCoords(row: number, col: number): string {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    return files[col] + ranks[row];
  }

  // --- PROMOTION MODAL HELPERS ---
  confirmPromotion(piece: string) {
    if (this.pendingPromotion) {
      this.gameState.move(this.pendingPromotion.from, this.pendingPromotion.to, piece);
      this.pendingPromotion = null;
    }
  }

  cancelPromotion() {
    this.pendingPromotion = null;
  }

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