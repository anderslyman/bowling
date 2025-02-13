import { Frame } from './frame';

export class Game {
  frames: Frame[] = [];
  currentFrame?: Frame;
  totalScore = 0;
  completedFramesScore = 0;
  isOver = false;
}
