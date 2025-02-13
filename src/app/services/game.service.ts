import { Injectable } from '@angular/core';
import { Game } from '../models/game';
import { Frame } from '../models/frame';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  game: Game = new Game();

  startNewGame() {
    this.game = new Game();
  }

  parseInput(input: string): number | Error {
    if (input === 'x' || input === 'strike') {
      return 10;
    } else if (input === '/' || input === 'spare') {
      // Subtract the previous roll from 10 to get the number of pins knocked over
      const currentRolls = this.game.currentFrame?.rolls || [];
      const lastRoll = currentRolls[currentRolls.length - 1];

      if (lastRoll === undefined) {
        return new Error('Cannot roll a spare on the first roll.');
      }

      return 10 - lastRoll;
    } else if (input === '-' || input === 'miss') {
      return 0;
    } else {
      const number = parseInt(input, 10);

      if (isNaN(number) || number < 0 || number > 10 || input.includes('.')) {
        return new Error('Invalid input: ' + input);
      }

      return number;
    }
  }

  roll(pins: number): void | Error {
    if (!this.game.currentFrame || !this.game.currentFrame.isActive) {
      if (!this.createNextFrame()) {
        this.game.isOver = true;

        return new Error('Game is over');
      }
    }

    const frame = this.game.currentFrame!;

    if (pins > frame.pinsRemaining) {
      return new Error('Number of pins knocked over exceed pins remaining');
    }

    frame.rolls.push(pins);
    frame.rollsRemaining--;
    frame.pinsRemaining -= pins;

    const isLastFrame = frame.frameNumber === 10;

    if (isLastFrame) {
      if (frame.rolls.length === 1) {
        if (pins === 10) {
          frame.pinsRemaining = 10;
        }
      } else if (frame.rolls.length === 2) {
        const firstRoll = frame.rolls[0];

        if (firstRoll === 10 && pins === 10) {
          // Two strikes
          frame.pinsRemaining = 10;
        }

        if (firstRoll + pins === 10) {
          // Spare
          frame.pinsRemaining = 10;
        }

        if (firstRoll + pins < 10) {
          frame.isActive = false;
          frame.rollsRemaining = 0;
        }
      } else if (frame.rolls.length === 3) {
        frame.isActive = false;
        frame.rollsRemaining = 0;
      }
    } else if (pins === 10 || frame.rolls.length === 2) {
      frame.isActive = false;
      frame.rollsRemaining = 0;
    }

    if (!frame.isActive) {
      this.createNextFrame();
    }

    this.updateScores();

    if (
      this.game.currentFrame?.frameNumber === 10 &&
      this.game.currentFrame.rollsRemaining === 0
    ) {
      this.game.isOver = true;
    }
  }

  updateScores(): number {
    for (let i = 0; i < this.game.frames.length; i++) {
      const frame = this.game.frames[i];
      frame.score = 0;
      const isTenthFrame = frame.frameNumber === 10;

      if (isTenthFrame) {
        frame.score += frame.rolls.reduce((a, b) => a + b, 0);
      } else {
        const isStrike = frame.rolls.length === 1 && frame.rolls[0] === 10;
        const isSpare =
          frame.rolls.length === 2 && frame.rolls[0] + frame.rolls[1] === 10;

        if (isStrike) {
          const nextRolls = this.getNextRolls(this.game.frames, i);

          frame.score += 10 + nextRolls.reduce((a, b) => a + b, 0);
        } else if (isSpare) {
          const nextRolls = this.getNextRolls(this.game.frames, i);

          frame.score += 10 + (nextRolls.length > 0 ? nextRolls[0] : 0);
        } else {
          frame.score += frame.rolls.reduce((a, b) => a + b, 0);
        }
      }

      frame.cumulativeScore =
        frame.score + (this.game.frames[i - 1]?.cumulativeScore || 0);

      this.updateFrameScoreComplete(frame);
    }

    this.game.totalScore = this.game.frames.reduce((a, b) => a + b.score, 0);

    for (let i = this.game.frames.length - 1; i >= 0; i--) {
      const frame = this.game.frames[i];

      if (frame.completedScoring) {
        this.game.completedFramesScore = frame.cumulativeScore;
        break;
      }
    }

    return this.game.totalScore;
  }

  getRollsDescription(rolls: number[]): string {
    const len = rolls.length;

    return rolls
      .map((roll, i, arr) => this.getRollDescription(roll, i, arr, len))
      .join(' ');
  }

  createNextFrame(): boolean {
    const isLastFrame = this.game.frames.length === 10;

    if (isLastFrame) {
      return false;
    }

    this.game.currentFrame = new Frame(this.game.frames.length + 1);
    this.game.frames.push(this.game.currentFrame);

    return true;
  }

  private updateFrameScoreComplete(frame: Frame) {
    const isLastFrame = frame.frameNumber === 10;

    if (isLastFrame) {
      if (frame.rolls.length === 3) {
        frame.completedScoring = true;
      } else {
        if (frame.rolls.length === 2 && frame.rolls[0] + frame.rolls[1] < 10) {
          frame.completedScoring = true;
        }
      }
    } else {
      const isStrike = frame.rolls.length === 1 && frame.rolls[0] === 10;
      const isSpare =
        frame.rolls.length === 2 && frame.rolls[0] + frame.rolls[1] === 10;

      if (isStrike) {
        if (
          this.getNextRolls(this.game.frames, frame.frameNumber - 1).length >= 2
        ) {
          frame.completedScoring = true;
        }
      } else if (isSpare) {
        if (
          this.getNextRolls(this.game.frames, frame.frameNumber - 1).length >= 1
        ) {
          frame.completedScoring = true;
        }
      } else {
        frame.completedScoring = !frame.isActive;
      }
    }
  }

  private getNextRolls(frames: Frame[], currentFrameIndex: number): number[] {
    const rolls = [];

    if (currentFrameIndex === 10) {
      return frames[currentFrameIndex].rolls;
    }

    if (frames[currentFrameIndex + 1]) {
      const nextFrame = frames[currentFrameIndex + 1];
      rolls.push(nextFrame.rolls[0]);

      if (nextFrame.rolls.length > 1) {
        rolls.push(nextFrame.rolls[1]);
      } else if (frames[currentFrameIndex + 2]) {
        rolls.push(frames[currentFrameIndex + 2].rolls[0]);
      }
    }

    return rolls.filter((r) => r !== undefined);
  }

  private getRollDescription(
    roll: number,
    i: number,
    arr: number[],
    len: number
  ) {
    if (roll === 0) {
      return '-';
    } else if (i > 0) {
      const lastRoll = arr[i - 1];

      // Handle last frame with potentially 3 rolls
      if (len === 3) {
        if (i === 1) {
          // 2nd roll
          // Note: misses already handled above
          if (lastRoll === 10) {
            return roll === 10 ? 'X' : roll.toString();
          } else {
            return lastRoll + roll === 10 ? '/' : roll.toString();
          }
        } else {
          // 3rd roll
          // Note: misses already handled above
          const firstRoll = arr[0];

          if (roll === 10) {
            return 'X';
          }

          if (firstRoll === 10) {
            if (lastRoll === 10) {
              return roll.toString();
            } else {
              return roll + lastRoll === 10 ? '/' : roll.toString();
            }
          } else if (lastRoll + firstRoll === 10) {
            return roll.toString();
          } else {
            return roll.toString();
          }
        }
      } else {
        // Check for spares
        return lastRoll + roll === 10 ? '/' : roll.toString();
      }
    } else {
      return roll === 10 ? 'X' : roll.toString();
    }
  }
}
