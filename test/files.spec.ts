import {
  direntIncludes,
  direntIsFile,
  readJSONFileSync,
  readFixtureFileSync,
  readFixturePathSync,
  readFixtureSync,
} from '../source/files';

const mock = require('mock-fs');

import { Dirent } from 'fs';
import { Buffer } from 'buffer';

describe('source/files.ts', () => {
  describe('direntIsFile', () => {
    it('returns true for a dirent that is a file', () => {
      const dirent = new Dirent();

      dirent.isFile = jest.fn(() => true);

      expect(direntIsFile(dirent)).toBe(true);
      expect(dirent.isFile).toBeCalled();
    });

    it('returns false for a dirent that is a file', () => {
      const dirent = new Dirent();

      dirent.isFile = jest.fn(() => false);

      expect(direntIsFile(dirent)).toBe(false);
      expect(dirent.isFile).toBeCalled();
    });
  });

  describe('direntIncludes', () => {
    it('returns true for a dirent that includes the text', () => {
      const dirent = new Dirent();

      dirent.name = 'dirent';

      expect(direntIncludes('dirent', dirent)).toEqual(true);
    });

    it('returns false for a dirent that does not include the text', () => {
      const dirent = new Dirent();

      dirent.name = 'dirent';

      expect(direntIncludes('dorent', dirent)).toEqual(false);
    });
  });

  describe('readJSONFileSync', () => {
    it('returns JSON content if file exists', () => {
      const data = readJSONFileSync('./test/data/success.json');

      expect(data).toEqual({
        success: true,
      });
    });
  });

  describe('readFixtureFileSync', () => {
    it('returns JSON content if extension is JSON', () => {
      const data = readFixtureFileSync('./test/data/success.json');

      expect(data).toEqual({
        success: true,
      });
    });

    it('returns raw file if extension is not JSON', () => {
      const data = readFixtureFileSync('./test/data/success.txt');

      expect(data).toBeInstanceOf(Buffer);
    });
  });

  describe('readFixturePathSync', () => {
    const permissions = ['write', 'read'];

    beforeEach(() => {
      mock({
        'data/users/123': {
          'permissions.json': JSON.stringify(permissions),
        },
      });
    });

    it('returns content if file is present', () => {
      const data = readFixturePathSync('users/123/permissions');

      expect(data).toEqual(permissions);
    });

    afterEach(() => {
      mock.restore();
    });
  });

  describe('readFixtureSync', () => {
    const customPermissions = ['write', 'read'];
    const genericPermissions = ['read'];

    beforeEach(() => {
      mock({
        'data/users/123': {
          'permissions.json': JSON.stringify(customPermissions),
        },
        'data/users/:id': {
          'permissions.json': JSON.stringify(genericPermissions),
        },
      });
    });

    it('loads data fixture if path is not a file', () => {
      const data = readFixtureSync('users/123/permissions');

      expect(data).toEqual(customPermissions);
    });

    it('loads file directly if path is a file', () => {
      const data = readFixtureSync('data/users/123/permissions.json');

      expect(data).toEqual(customPermissions);
    });

    it("loads fallback file if path doesn't match a file", () => {
      const data = readFixtureSync(
        'users/125/permissions',
        'users/:id/permissions'
      );

      expect(data).toEqual(genericPermissions);
    });

    afterEach(() => {
      mock.restore();
    });
  });
});
