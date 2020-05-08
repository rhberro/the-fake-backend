import { createInputManager } from './input';
import { InputManager } from './interfaces';

describe('source/input.ts', () => {
  describe('InputManager', () => {
    let inputManager: InputManager;

    beforeEach(() => {
      inputManager = createInputManager();
    });

    describe('createProxyManager', () => {
      it('returns an instance of ProxyManager', () => {
        expect(inputManager).toMatchObject<InputManager>(inputManager);
      });
    });
  });
});
