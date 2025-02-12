import { Frame } from './frame';

export class Game {
  frames: Frame[] = [];
  currentFrame?: Frame;
  totalScore = 0;
}
