import Throttling from '../source/interfaces/Throttling';
import ThrottlingManager from '../source/interfaces/ThrottlingManager';
import { createThrottlingManager } from '../source/throttling';

describe('source/throttling.ts', () => {
  let throttlingManager: ThrottlingManager;

  const throttlings: Array<Throttling> = [
    { name: 'First', values: [0, 5] },
    { name: 'Second', values: [5, 10] },
    { name: 'Third', values: [10, 20] },
  ];

  beforeEach(() => {
    throttlingManager = createThrottlingManager(throttlings);
  });

  describe('createThrottlingManager', () => {
    it('returns an instance of ThrottlingManager', () => {
      expect(throttlingManager).toMatchObject<ThrottlingManager>(
        throttlingManager
      );
    });
  });

  describe('getAll', () => {
    it('returns all the throttlings', () => {
      expect(throttlingManager.getAll()).toEqual(throttlings);
    });
  });

  describe('getCurrent', () => {
    it('returns null as the initial throttling', () => {
      expect(throttlingManager.getCurrent()).toEqual(null);
    });

    it('returns the first throttling after a toggle', () => {
      throttlingManager.toggleCurrent();
      expect(throttlingManager.getCurrent()).toEqual(throttlings[0]);
    });
  });

  describe('getCurrentDelay', () => {
    it('returns 0 as the initial throttling', () => {
      expect(throttlingManager.getCurrentDelay()).toEqual(0);
    });

    it('returns a number between the first throttling values', () => {
      const currentDelay =
        throttlingManager.toggleCurrent() ||
        throttlingManager.getCurrentDelay();
      expect(currentDelay).toBeGreaterThanOrEqual(throttlings[0].values[0]);
      expect(currentDelay).toBeLessThanOrEqual(throttlings[0].values[1]);
    });
  });

  describe('toggleCurrent', () => {
    it('returns null as the initial throttling', () => {
      expect(throttlingManager.getCurrent()).toEqual(null);
    });

    it('returns null after toggling from last throttling', () => {
      throttlingManager.toggleCurrent();
      throttlingManager.toggleCurrent();
      throttlingManager.toggleCurrent();
      throttlingManager.toggleCurrent();
      expect(throttlingManager.getCurrent()).toEqual(null);
    });
  });
});
