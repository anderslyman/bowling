import { Component, OnInit } from '@angular/core';
import { ComponentsModule } from './components/components.module';
import { GameService } from './services/game.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [ComponentsModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  public input = '';

  constructor(public gameService: GameService) {}

  ngOnInit(): void {
    this.gameService.startNewGame();

    const seed = [10, 7, 3, 9, 0, 10, 0, 8, 8, 2, 0, 6, 10, 10, 10, 8, 1];
    seed.forEach((pins) => this.gameService.roll(pins));
  }

  addInput(): void {
    const rollsRequested = this.input
      .split(',')
      .map((roll) => roll?.toLowerCase().trim());
    rollsRequested.forEach((roll) =>
      this.gameService.roll(this.parseInput(roll!))
    );

    this.input = '';
  }

  parseInput(input: string) {
    if (input === 'x' || input === 'strike') {
      return 10;
    } else if (input === '/' || input === 'spare') {
      // Subtract the previous roll from 10 to get the number of pins knocked over
      const currentRolls = this.gameService.game.currentFrame?.rolls || [];
      const lastRoll = currentRolls[currentRolls.length - 1] || 0;

      return 10 - lastRoll;
    } else if (input === '-' || input === 'miss') {
      return 0;
    } else if (input === '') {
      return 0;
    } else {
      if (isNaN(parseInt(input, 10))) {
        return 0;
      } else {
        return parseInt(input, 10);
      }
    }
  }
}
