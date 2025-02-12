import { Component, Input } from '@angular/core';
import { Frame } from '../../models/frame';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-score',
  standalone: false,
  templateUrl: './score.component.html',
  styleUrl: './score.component.scss',
})
export class ScoreComponent {
  @Input() gameService?: GameService;

  frameNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  constructor() {}

  getFrameData(frameNumber: number): Frame | undefined {
    if (!this.gameService) {
      return undefined;
    }

    if (this.gameService.game.frames.length >= frameNumber) {
      return this.gameService.game.frames[frameNumber - 1];
    }

    return undefined;
  }

  getFrameInput(frameNumber: number): string {
    const frame = this.getFrameData(frameNumber);
    const description = frame
      ? this.gameService?.getRollsDescription(frame.rolls)
      : '';

    return description ?? '';
  }

  getFrameCumulativeScore(frameNumber: number): string {
    const frame = this.getFrameData(frameNumber);
    const display = frame?.completedScoring ?? false;
    const score = frame?.cumulativeScore;

    return score && display ? score.toString() : '';
  }
}
