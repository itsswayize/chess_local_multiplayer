export type Color = 'w' | 'b';

export interface Move {
  from: string;
  to: string;
  promotion?: string;
  san?: string; 
}

export interface GameStatus {
  fen: string;
  turn: Color;
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  lastMove?: { from: string; to: string };
  history: string[]; /* Added: Stores ['e4', 'e5', 'Nf3'...] */
}
export interface Evaluation {
  score: number;
  label: 'Great' | 'Good' | 'Inaccuracy' | 'Mistake' | 'Blunder';
}