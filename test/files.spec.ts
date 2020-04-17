import { direntIncludes, direntIsFile } from '../source/files';

import { Dirent } from 'fs';

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
});
