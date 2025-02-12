export class Frame {
  frameNumber: number;
  rolls: number[] = [];
  rollsRemaining: number = 2;
  pinsRemaining: number = 10;
  isActive: boolean = true;
  score = 0;
  cumulativeScore = 0;
  completedScoring = false;

  constructor(frameNumber: number) {
    this.frameNumber = frameNumber;

    if (frameNumber === 10) {
      this.rollsRemaining = 3;
    }
  }
}
