import { Frame } from './frame';

describe('Frame', () => {
  let frame: Frame;

  beforeEach(() => {
    frame = new Frame(1);
  });

  it('should create an instance', () => {
    expect(frame).toBeTruthy();
  });
});
