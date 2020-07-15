import { resolve } from 'path';
import { readdirSync } from 'fs';

export function* getFilesRecursively(directory: string): Generator<string> {
    const dirents = readdirSync(directory, { 
        withFileTypes: true 
    });
    for (const dirent of dirents) {
        const result = resolve(directory, dirent.name);
        if (dirent.isDirectory()) {
            yield* getFilesRecursively(result);
        } else {
            yield result;
        }
    }
}