import fs from 'fs';
import path from 'path';

import { getDoggerPath, ensureDoggerPath } from '../paths';

export function persistRefreshToken(token: string) {
    const doggerPath = ensureDoggerPath();
    fs.writeFileSync(
        path.join(
            doggerPath,
            'token'),
        token);
}

export function getPersistedRefreshToken() {
    const tokenPath = path.join(
        getDoggerPath(),
        'token');

    if (!fs.existsSync(tokenPath))
        return null;

    let refreshToken = fs
        .readFileSync(tokenPath)
        .toString();

    return refreshToken;
}