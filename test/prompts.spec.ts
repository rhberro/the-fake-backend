import { prompt } from 'inquirer';
import { mocked } from 'ts-jest/utils';

import {
  promptRoutePath,
  promptRouteMethodType,
  promptRouteMethodOverride,
  promptProxy,
} from '../source/prompts';

jest.mock('inquirer', () => ({
  registerPrompt: jest.fn(),
  prompt: jest.fn(),
}));

describe('source/prompts.ts', () => {
  describe('promptRoutePath', () => {
    it('calls inquirer prompt', () => {
      const paths = ['/users', '/dogs'];
      promptRoutePath(paths);
      expect(mocked(prompt)).toHaveBeenCalledWith([
        {
          type: 'autocomplete',
          name: 'url',
          message: 'Search for the endpoint URL:',
          source: expect.any(Function),
        },
      ]);
    });
  });

  describe('promptRouteMethodType', () => {
    it('calls inquirer prompt', () => {
      const methodTypes = ['GET', 'POST'];
      promptRouteMethodType(methodTypes);
      expect(mocked(prompt)).toHaveBeenCalledWith([
        {
          type: 'autocomplete',
          name: 'type',
          message: 'Select the type:',
          source: expect.any(Function),
        },
      ]);
    });
  });

  describe('promptRouteMethodOverride', () => {
    it('calls inquirer prompt', () => {
      const overrides = ['Dogoo', 'Doggernaut'];
      promptRouteMethodOverride(overrides);
      expect(mocked(prompt)).toHaveBeenCalledWith([
        {
          type: 'autocomplete',
          name: 'name',
          message: 'Select the override settings:',
          source: expect.any(Function),
        },
      ]);
    });
  });

  describe('promptProxy', () => {
    it('calls inquirer prompt', () => {
      const proxies = ['First', 'Second'];
      promptProxy(proxies);
      expect(mocked(prompt)).toHaveBeenCalledWith([
        {
          type: 'autocomplete',
          name: 'proxy',
          message: 'Select the proxy:',
          source: expect.any(Function),
        },
      ]);
    });
  });
});
