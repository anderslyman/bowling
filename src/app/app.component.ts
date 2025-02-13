import { Component, OnInit } from '@angular/core';
import { ComponentsModule } from './components/components.module';
import { GameService } from './services/game.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [ComponentsModule, FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  public input = '';
  public error = '';

  constructor(public gameService: GameService) {}

  ngOnInit(): void {
    this.gameService.startNewGame();

    const seed = [10, 7, 3, 9];
    seed.forEach((pins) => this.gameService.roll(pins));
  }

  addInput(): void {
    const rollsRequested = this.input
      .split(',')
      .map((roll) => roll?.toLowerCase().trim());

    for (const roll of rollsRequested) {
      const parsed = this.gameService.parseInput(roll!);

      if (parsed instanceof Error) {
        this.error = parsed.message;
        return;
      }

      const error = this.gameService.roll(parsed);

      if (error instanceof Error) {
        this.error = error.message;
        return;
      }
    }

    this.input = '';
    this.error = '';
  }
}
