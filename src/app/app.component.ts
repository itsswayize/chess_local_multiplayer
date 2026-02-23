import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardComponent } from './features/board/board.component';
import { MoveFeedbackComponent } from './features/move-feedback/move-feedback.component';
import { ControlsComponent } from './features/controls/controls.component';
import { GameStateService } from './core/services/game-state.service';

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
export class AppComponent {
  title = 'chess-analyzer'; // Add this line back

  constructor(public gameState: GameStateService) {}

  get currentTurn(): string {
    const status = this.gameState.getLatestStatus();
    return status?.turn === 'w' ? 'white' : 'black';
  }
}