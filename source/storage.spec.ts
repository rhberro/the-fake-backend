import { FileStorage } from './storage';
import { fs as inMemoryFileSystem, vol } from 'memfs';

describe('FileStorage', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('throws an error when file is invalid', () => {
    inMemoryFileSystem.writeFileSync('/.storage', 'abc');
    createFileStorage();
    expect(() => {
      createFileStorage().getItem('foo');
    }).toThrow('Invalid file storage content');
  });

  it('throws an error when path is missing', () => {
    expect(() => {
      new FileStorage({ enabled: true });
    }).toThrow('FileStorage path option is missing');
  });

  it('does not initializes store if disabled', () => {
    expect(() => {
      new FileStorage({ enabled: false, path: '/.storage' });
      inMemoryFileSystem.readFileSync('/.storage', 'utf-8');
    }).toThrowError("ENOENT: no such file or directory, open '/.storage'");
  });

  it('properly creates an empty storage when the storage file does not exist', () => {
    createFileStorage();
    expect(inMemoryFileSystem.readFileSync('/.storage', 'utf-8')).toEqual('{}');
  });

  it('properly creates a storage with the content of a existing file', () => {
    inMemoryFileSystem.writeFileSync(
      '/.storage',
      '{ "foo": { "key": "value" } }'
    );
    createFileStorage();
    expect(createFileStorage().getItem('foo')).toEqual({ key: 'value' });
  });

  it('sets and gets item from storage', () => {
    expect(() => {
      createFileStorage().setItem('foo', { key: 'value' });
    }).not.toThrow();

    expect(createFileStorage().getItem('foo')).toEqual({ key: 'value' });
  });

  it('gets an unexisting item from storage', () => {
    expect(createFileStorage().getItem('foo')).toEqual(undefined);
  });
});

function createFileStorage() {
  return new FileStorage<'foo'>({
    enabled: true,
    path: '/.storage',
    fs: inMemoryFileSystem as any,
  });
}
