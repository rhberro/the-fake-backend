import { InputManager } from './input';

describe('source/input.ts', () => {
  describe('InputManager', () => {
    let inputManager: InputManager;

    beforeEach(() => {
      inputManager = new InputManager();
    });

    describe('constructor', () => {
      it('returns an instance of InputManager', () => {
        expect(inputManager).toMatchObject<InputManager>(inputManager);
      });
    });
  });
});
