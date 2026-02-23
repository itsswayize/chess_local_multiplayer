import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, timer, Subscription } from 'rxjs';
import { MoveValidatorService } from './move-validator.service';
import { GameStatus } from '../../shared/models/chess.models';

@Injectable({ providedIn: 'root' })
export class GameStateService implements OnDestroy {
  private whiteTime = 600; 
  private blackTime = 600;
  private timerSubscription?: Subscription;

  public whiteTime$ = new BehaviorSubject<number>(600);
  public blackTime$ = new BehaviorSubject<number>(600);
  private statusSubject = new BehaviorSubject<GameStatus | null>(null);
  public status$ = this.statusSubject.asObservable();

  constructor(private validator: MoveValidatorService) {
    this.statusSubject.next(this.validator.getGameStatus());
  }

  private startTimer() {
  this.timerSubscription?.unsubscribe();
  // Ensure we only start counting after 1 second has passed
  this.timerSubscription = timer(1000, 1000).subscribe(() => {
    const status = this.statusSubject.value;
    if (!status || status.isCheckmate || status.isDraw) return;

    if (status.turn === 'w') {
      if (this.whiteTime > 0) {
        this.whiteTime--;
        this.whiteTime$.next(this.whiteTime);
      } else {
        this.handleTimeout('b'); // Black wins on time
      }
    } else {
      if (this.blackTime > 0) {
        this.blackTime--;
        this.blackTime$.next(this.blackTime);
      } else {
        this.handleTimeout('w'); // White wins on time
      }
    }
  });
}

private handleTimeout(winner: 'w' | 'b') {
  this.timerSubscription?.unsubscribe();
  alert(`Game Over: ${winner === 'w' ? 'White' : 'Black'} wins on time!`);
}

// Add promotion?: string to the parameters
  public move(from: string, to: string, promotion?: string): boolean {
    // Pass the promotion down to the validator
    const success = this.validator.makeMove(from, to, promotion);
    if (success) {
      if (!this.timerSubscription) this.startTimer();
      const status = this.validator.getGameStatus();
      this.statusSubject.next(status);
    }
    return success;
  }

public getLatestStatus(): GameStatus | null {
  return this.statusSubject.value;
}

  public resetGame(): void {
    this.validator.reset();
    this.timerSubscription?.unsubscribe();
    this.timerSubscription = undefined;
    this.whiteTime = 600;
    this.blackTime = 600;
    this.whiteTime$.next(600);
    this.blackTime$.next(600);
    this.statusSubject.next(this.validator.getGameStatus());
  }

  ngOnDestroy() {
    this.timerSubscription?.unsubscribe();
  }
}
