import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';
import { Frame } from '../models/frame';

describe('GameService', () => {
  let service: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('roll() should create a new frame when the first roll is submitted', () => {
    service.roll(5);
    expect(service.game.currentFrame).toBeTruthy();
    expect(service.game.frames.length).toBe(1);
  });

  it('roll() should create a new frame when the current frame is closed', () => {
    service.roll(5);
    service.roll(3);
    service.roll(1);
    expect(service.game.currentFrame).toBeTruthy();
    expect(service.game.frames.length).toBe(2);
  });

  it('createNextFrame() should return true if current frame is < 10', () => {
    for (let i = 0; i < 9; i++) {
      service.createNextFrame();
    }

    expect(service.createNextFrame()).toBeTrue();
  });

  it('createNextFrame() should return false if current frame is 10', () => {
    for (let i = 0; i < 10; i++) {
      service.createNextFrame();
    }

    expect(service.createNextFrame()).toBeFalse();
  });
});

describe('GameService roll', () => {
  let service: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameService);
  });

  it('should be active after one roll', () => {
    service.roll(1);
    expect(service.game.currentFrame!.isActive).toBeTrue();
  });

  it('should be inactive after two rolls', () => {
    service.roll(1);
    service.roll(2);
    expect(service.game.currentFrame!.isActive).toBeFalse();
  });

  it('should be inactive after three rolls on the 10th frame', () => {
    service.game.currentFrame = new Frame(10);
    service.roll(8);
    service.roll(2);
    service.roll(3);
    expect(service.game.currentFrame!.isActive).toBeFalse();
  });

  it('should be active after two rolls on the 10th frame', () => {
    service.game.currentFrame = new Frame(10);
    service.roll(1);
    service.roll(9);
    expect(service.game.currentFrame!.isActive).toBeTrue();
  });

  it('should be inactive after two non-strike or spare rolls on the 10th frame', () => {
    service.game.currentFrame = new Frame(10);
    service.roll(1);
    service.roll(2);
    expect(service.game.currentFrame!.isActive).toBeFalse();
  });

  it('roll() should fail on 1st roll if number of pins knocked over exceed pins remaining', () => {
    expect(service.roll(11)).toBeInstanceOf(Error);
  });

  it('roll() should fail on 2nd roll if number of pins knocked over exceed pins remaining', () => {
    service.roll(5);
    expect(service.roll(8)).toBeInstanceOf(Error);
  });

  it('roll() should succeed on 2nd roll if number of pins knocked over is <= pins remaining', () => {
    service.roll(5);
    expect(service.roll(5)).toBeUndefined();
  });

  it('roll() should fail on 3rd roll if number of pins knocked over exceed pins remaining on the 10th frame', () => {
    service.game.currentFrame = new Frame(10);
    service.roll(2);
    expect(service.roll(9)).toBeInstanceOf(Error);
  });

  it('roll() should succeed on 3rd roll if there are 3 strikes on the 10th frame', () => {
    service.game.currentFrame = new Frame(10);
    service.roll(10);
    service.roll(10);
    expect(service.roll(10)).toBeUndefined();
  });

  it('roll() should succeed on 2nd roll if there are 2 strikes on the 10th frame', () => {
    service.game.currentFrame = new Frame(10);
    service.roll(10);
    expect(service.roll(10)).toBeUndefined();
  });
});

describe('GameService roll descriptions', () => {
  let service: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameService);
  });

  [
    [[], ''],

    // One roll
    [[0], '-'],
    [[9], '9'],
    [[10], 'X'],

    // Two rolls
    [[0, 10], '- /'],
    [[0, 0], '- -'],
    [[0, 1], '- 1'],
    [[5, 5], '5 /'],
    [[1, 2], '1 2'],

    // Three rolls
    [[0, 0, 0], '- - -'],
    [[0, 0, 1], '- - 1'], // Not valid, but the function should handle it
    [[0, 1, 2], '- 1 2'], // Not valid, but the function should handle it
    [[5, 5, 5], '5 / 5'],
    [[1, 9, 1], '1 / 1'],
    [[10, 0, 0], 'X - -'],
    [[10, 0, 1], 'X - 1'],
    [[10, 0, 10], 'X - X'],
    [[10, 10, 0], 'X X -'],
    [[10, 10, 10], 'X X X'],
    [[10, 10, 0], 'X X -'],
    [[10, 0, 0], 'X - -'],
    [[10, 5, 5], 'X 5 /'],
    [[1, 2, 3], '1 2 3'], // Not valid, but the function should handle it
  ].forEach((testCase) => {
    const rolls = <number[]>testCase[0];
    const expected = <string>testCase[1];

    it(`getRollsDescription() : [${rolls.join(
      ', '
    )}] should return "${expected}"`, () => {
      expect(service.getRollsDescription(rolls)).toBe(expected);
    });
  });
});

describe('GameService scoring', () => {
  let service: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameService);
  });

  [
    [[10], 10], // 1 Strike
    [[10, 10], 30], // 2 Strikes
    [[10, 10, 10, 10, 10, 10, 10, 10, 10], 240], // 9 Strikes
    [[10, 10, 10, 10, 10, 10, 10, 10, 10, /* Last Frame */ 10, 10, 10], 300], // Perfect game

    // Standard games
    [
      [10, 7, 3, 9, 0, 10, 0, 8, 8, 2, 0, 6, 10, 10, 10, 8, 1],
      167,
      [20, 39, 48, 66, 74, 84, 90, 120, 148, 167],
    ],
    [
      [8, 2, 5, 4, 9, 0, 10, 10, 5, 5, 5, 3, 6, 3, 9, 1, 9, 1, 10],
      149,
      [15, 24, 33, 58, 78, 93, 101, 110, 129, 149],
    ],
    [
      [6, 4, 9, 0, 10, 10, 10, 10, 8, 0, 10, 10, 9, 1, 9],
      210,
      [19, 28, 58, 88, 116, 134, 142, 171, 191, 210],
    ],
    [
      [4, 6, 4, 6, 4, 6, 4, 6, 4, 6, 4, 6, 4, 6, 4, 6, 4, 6, 7, 3, 10],
      149,
      [14, 28, 42, 56, 70, 84, 98, 112, 129, 149],
    ],
    [
      [6, 4, 6, 4, 6, 4, 6, 4, 6, 4, 6, 4, 6, 4, 6, 4, 6, 4, 10, 10, 0],
      168,
      [16, 32, 48, 64, 80, 96, 112, 128, 148, 168],
    ],
  ].forEach((testCase) => {
    const rolls = <number[]>testCase[0];
    const expected = <number>testCase[1];
    const cumulativeScores = <number[]>testCase[2] || [];

    it(`A game of [${rolls.join(
      ', '
    )}] should return a total score of "${expected}"`, () => {
      rolls.forEach((roll) => service.roll(roll));
      expect(service.game.totalScore).toBe(expected);
    });

    if (cumulativeScores.length) {
      it(`A game of [${rolls.join(
        ', '
      )}] should return cumulative scores of "[${cumulativeScores.join(
        ', '
      )}]"`, () => {
        rolls.forEach((roll) => service.roll(roll));

        for (let i = 0; i < cumulativeScores.length; i++) {
          expect(service.game.frames[i].cumulativeScore).toBe(
            cumulativeScores[i]
          );
        }
      });
    }
  });
});

describe('GameService scoring completions', () => {
  let service: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameService);
  });

  [
    [[1], false, 1],
    [[2, 3], true, 5],

    // Spares
    [[8, 2], false, 10],
    [[8, 2, 3], true, 13],

    // Strikes
    [[10], false, 10],
    [[10, 1], false, 11],
    [[10, 1, 2], true, 13],
  ].forEach((testCase) => {
    const rolls = <number[]>testCase[0];
    const firstRoll = rolls[0];
    const scoringComplete = <boolean>testCase[1];
    const expected = <number>testCase[2];

    it(`A roll of ${firstRoll} should return a score of ${expected} and marked ${
      scoringComplete ? 'complete' : 'incomplete'
    } if followed by rolls: [${rolls.slice(1).join(', ')}]`, () => {
      rolls.forEach((roll) => service.roll(roll));

      expect(service.game.frames[0].completedScoring).toBe(scoringComplete);
      expect(service.game.frames[0].cumulativeScore).toBe(expected);
    });
  });
});
