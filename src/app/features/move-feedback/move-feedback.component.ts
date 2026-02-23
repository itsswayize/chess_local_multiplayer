import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStateService } from '../../core/services/game-state.service';

interface MovePair {
  number: number;
  white: string;
  black: string;
}

@Component({
  selector: 'app-move-feedback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './move-feedback.component.html',
  styleUrls: ['./move-feedback.component.css']
})
export class MoveFeedbackComponent implements OnInit {
  movePairs: MovePair[] = [];

  constructor(private gameState: GameStateService) {}

  ngOnInit() {
    this.gameState.status$.subscribe(status => {
      if (status) {
        this.formatHistory(status.history);
      }
    });
  }

  private formatHistory(history: string[]) {
    this.movePairs = [];
    for (let i = 0; i < history.length; i += 2) {
      this.movePairs.push({
        number: Math.floor(i / 2) + 1,
        white: history[i],
        black: history[i + 1] || ''
      });
    }
  }
}