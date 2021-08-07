import * as fs from 'fs';

type PartialFileSystem = {
  readFileSync(path: string, options: string): string;
  writeFileSync(path: string, data: string): void;
};

export interface FileStorageOptions {
  enabled: boolean;
  path?: string;
  fs?: PartialFileSystem;
}

const EMPTY_STORAGE = {};

const DEFAULT_OPTIONS = { enabled: false };

export class FileStorage<TKeys extends string> {
  private fs: PartialFileSystem;

  constructor(public options: FileStorageOptions = DEFAULT_OPTIONS) {
    this.fs = this.options.fs ?? fs;

    if (options.enabled) {
      this.initializeStorage();
    }
  }

  public isEmpty() {
    return Object.keys(this.getStorage()).length === 0;
  }

  public isInitialized() {
    try {
      if (!this.options.enabled || !this.options.path) return false;
      this.fs.readFileSync(this.options.path, 'utf-8');
      return true;
    } catch (e) {
      return false;
    }
  }

  public getItem<TData = unknown>(key: TKeys): TData | undefined {
    if (!this.isInitialized()) return;

    const storage = this.getStorage<TData>();
    return storage[key];
  }

  public setItem<TData = Record<string, unknown>>(key: TKeys, data: TData) {
    if (!this.isInitialized()) return;

    const storage = this.getStorage();
    storage[key] = data;

    if (this.options.path) {
      this.persist(storage);
    }
  }

  public clear() {
    this.persist(EMPTY_STORAGE);
  }

  private persist<TData = unknown>(data: Record<string, TData>) {
    if (this.options.path) {
      this.fs.writeFileSync(this.options.path, JSON.stringify(data, null, 2));
    }
  }

  private getStorage<TData = unknown>(): Record<TKeys, TData> {
    const fileContent = this.getSerializedStorage();
    try {
      return JSON.parse(fileContent);
    } catch (e) {
      throw new Error('Invalid file storage content');
    }
  }

  private initializeStorage(): void {
    if (!this.options.path) {
      throw new Error('FileStorage path option is missing');
    }

    if (!this.isInitialized()) {
      this.persist(EMPTY_STORAGE);
    }
  }

  private getSerializedStorage(): string {
    try {
      if (!this.options.path) return '{}';
      return this.fs.readFileSync(this.options.path, 'utf-8');
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
      this.initializeStorage();
      return this.getSerializedStorage();
    }
  }
}
