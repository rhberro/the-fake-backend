import { Dirent, readFileSync, readdirSync } from 'fs';
import { basename, dirname, extname, join, parse } from 'path';

/**
 * Return a boolean indicating that given dirent is a file or not.
 *
 * @param {Dirent} dirent The dirent object.
 *
 * @return {boolean} A boolean indicating that the dirent name matches the text.
 */
export function direntIsFile(dirent: Dirent): boolean {
  return dirent.isFile();
}

/**
 * Return a boolean indicating that the dirent name includes the text.
 *
 * @param {string} text The text to match.
 * @param {Dirent} dirent The dirent object.
 *
 * @return {boolean} A boolean indicating that the dirent name includes the text.
 */
export function direntIncludes(text: string, dirent: Dirent): boolean {
  return parse(dirent.name).name === text;
}

/**
 * Read the file and parse its content as json.
 *
 * @param {string} path The file path.
 *
 * @return {any} The file content.
 */
export function readJSONFileSync(path: string): any {
  return JSON.parse(readFileSync(path).toString());
}

/**
 * Read the fixture file.
 *
 * @param {string} path The fixture path.
 *
 * @return {any} The fixture content.
 */
export function readFixtureFileSync(path: string): any {
  if (extname(path) === '.json') {
    return readJSONFileSync(path);
  }

  return readFileSync(path);
}

/**
 * Read the first fixture file using path's dirname that matches the path's basename.
 *
 * @param {string} path The file path.
 *
 * @return {any} The file content.
 */
export function readFixturePathSync(path: string): any {
  const folder = dirname(path);
  const file = basename(path);

  const directory = join('data', folder);

  const direntIncludesFilename = direntIncludes.bind(null, file);

  const [fixture] = readdirSync(directory, { withFileTypes: true })
    .filter(direntIsFile)
    .filter(direntIncludesFilename);

  return readFixtureFileSync(join(directory, fixture.name));
}

/**
 * Read a fixture file using the extension when available or by reading the whole directory.
 *
 * @param {string} path The file path.
 *
 * @return {any} The file content.
 */
export function readFixtureSync(path: string): any {
  const extension = extname(path);

  try {
    return extension
      ? readFixtureFileSync(path)
      : readFixturePathSync(path);
  } catch (error) {
    console.error('You probably forgot to create the fixture file.', path, error);
  }
}
