import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

@Injectable()
export class LocalStorageService {
  private readonly root: string;

  constructor(config: ConfigService) {
    this.root = path.resolve(
      process.cwd(),
      config.getOrThrow<string>('MEDIA_ROOT'),
    );
  }

  async save(key: string, buffer: Buffer) {
    const fullPath = this.resolve(key);
    await mkdir(path.dirname(fullPath), { recursive: true });
    await writeFile(fullPath, buffer, { flag: 'wx' });
    return key;
  }

  async delete(key: string) {
    try {
      await unlink(this.resolve(key));
    } catch (error) {
      if (!this.isMissingFileError(error)) {
        throw error;
      }
    }
  }

  private resolve(key: string) {
    const normalizedKey = key.replaceAll('\\', '/');

    if (normalizedKey.includes('..') || normalizedKey.startsWith('/')) {
      throw new Error('Unsafe storage key');
    }

    const fullPath = path.resolve(this.root, normalizedKey);
    if (!fullPath.startsWith(`${this.root}${path.sep}`)) {
      throw new Error('Storage key escaped root');
    }

    return fullPath;
  }

  private isMissingFileError(error: unknown): error is NodeJS.ErrnoException {
    return error instanceof Error && 'code' in error && error.code === 'ENOENT';
  }
}
