import { Injectable } from '@angular/core';
import { Chess, Move } from 'chess.js';
import { GameStatus } from '../../shared/models/chess.models';

@Injectable({ providedIn: 'root' })
export class MoveValidatorService {
  private chess = new Chess();

  constructor() {}

  // Validates and executes a move
  public makeMove(from: string, to: string, promotion: string = 'q'): boolean {
    try {
      const result = this.chess.move({ from, to, promotion });
      if (result) {
        this.lastMove = { from: result.from, to: result.to };
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  // Gets all legal moves for the current piece/position
  public getLegalMoves(square?: any): string[] {
    return this.chess.moves({ square, verbose: true }).map((m) => m.to);
  }

  public lastMove?: { from: string; to: string };

  // Gets current board state in FEN format
  public getFen(): string {
    return this.chess.fen();
  }

  // Checks the game status
  public getGameStatus(): GameStatus {
    return {
      fen: this.chess.fen(),
      turn: this.chess.turn() === 'w' ? 'w' : 'b',
      isCheck: this.chess.inCheck(),
      isCheckmate: this.chess.isCheckmate(),
      isDraw: this.chess.isDraw(),
      lastMove: this.lastMove,
      history: this.chess.history() // FIX: Return the Move History
    };
  }
  // Reset the game
public reset(): void {
    this.chess.reset();
    this.lastMove = undefined; // Clear last move on reset
  }
}
