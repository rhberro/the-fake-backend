import { InputManager } from './input';

describe('source/input.ts', () => {
  describe('InputManager', () => {
    let inputManager: InputManager;

    beforeEach(() => {
      inputManager = new InputManager();
    });

    describe('createProxyManager', () => {
      it('returns an instance of ProxyManager', () => {
        expect(inputManager).toMatchObject<InputManager>(inputManager);
      });
    });
  });
});
