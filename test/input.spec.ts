import { createInputManager } from '../source/input';
import { InputManager } from '../source/interfaces';

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
