import { Dirent, readFileSync, readdirSync } from 'fs';
import { basename, dirname, extname, join, parse } from 'path';

/**
 * Return a boolean indicating that given dirent is a file or not.
 *
 * @param dirent The dirent object
 * @return A boolean indicating that the dirent name matches the text
 */
export function direntIsFile(dirent: Dirent): boolean {
  return dirent.isFile();
}

/**
 * Return a boolean indicating that the dirent name includes the text.
 *
 * @param text The text to match
 * @param dirent The dirent object
 * @return A boolean indicating that the dirent name includes the text
 */
export function direntFilenameMatchText(text: string, dirent: Dirent): boolean {
  return parse(dirent.name).name === text;
}

/**
 * Read the file and parse its content as json.
 *
 * @param path The file path
 * @return The file content
 */
export function readJSONFileSync(path: string): any {
  return JSON.parse(readFileSync(path).toString());
}

/**
 * Read the fixture file.
 *
 * @param path The fixture path
 * @return The fixture content
 */
export function readFixtureFileSync(path: string): any {
  if (extname(path) === '.json') {
    return readJSONFileSync(path);
  }

  return readFileSync(path);
}

/**
 * Find the file path of a given dirname and basename.
 *
 * @param dir The file dirname
 * @param base The file basename
 * @param scenario An optional custom scenario for a fixture file
 * @return File path if found
 */
export function findFilePathByDirnameAndBasename(
  dir: string,
  base: string,
  scenario?: string
): string {
  const fullBasename = scenario ? `${base}--${scenario}` : base;

  const [fixture] = readdirSync(dir, { withFileTypes: true })
    .filter(direntIsFile)
    .filter((dirent) => direntFilenameMatchText(fullBasename, dirent));

  if (!fixture) {
    throw new Error('Fixture not found');
  }

  return join(dir, fixture.name);
}

/**
 * Scan the fixture path of a given path, searching also as a folder with an index file.
 *
 * @param path The search path
 * @param scenario An optional custom scenario for a fixture file
 * @return The fixture path
 */
export function scanFixturePath(path: string, scenario?: string): string {
  const folder = dirname(path);
  const file = basename(path);

  const pathDirnameFixtureDirectory = join('data', folder);
  const pathFixtureDirectory = join('data', path);

  try {
    const indexFixture = findFilePathByDirnameAndBasename(
      pathFixtureDirectory,
      'index',
      scenario
    );

    return indexFixture;
  } catch (error) {
    const fixture = findFilePathByDirnameAndBasename(
      pathDirnameFixtureDirectory,
      file,
      scenario
    );

    return fixture;
  }
}

/**
 * Read the first file that matches a valid fixture of a given path and scenario.
 *
 * @param path The search path
 * @param scenario An optional custom scenario for a fixture file
 * @return The file content
 */
export function readFixturePathSync(path: string, scenario?: string): any {
  const fixturePath = scanFixturePath(path, scenario);

  return readFixtureFileSync(fixturePath);
}

/**
 * Read a fixture file using the extension when available, or by scanning the whole directory.
 *
 * @param path The file path
 * @param fallbackPath The fallback file path
 * @param scenario An optional custom scenario for a fixture file
 * @return The file content.
 */
export function readFixtureSync(
  path: string,
  fallbackPath?: string,
  scenario?: string
): any {
  const extension = extname(path);

  try {
    return extension
      ? readFixtureFileSync(path)
      : readFixturePathSync(path, scenario);
  } catch (error) {
    if (fallbackPath) {
      try {
        return readFixturePathSync(fallbackPath, scenario);
      } catch (fallbackError) {
        console.error(
          'You probably forgot to create the fallback fixture file',
          fallbackPath,
          fallbackError
        );
      }
    } else {
      console.error(
        'You probably forgot to create the fixture file.',
        path,
        error
      );
    }
  }
}
