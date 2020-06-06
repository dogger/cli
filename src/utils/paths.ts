import fs = require('fs');
import os = require('os');
import path = require('path');

export function getDoggerPath() {
    return path.join(
        os.homedir(),
        "dogger");
}

export function ensureDoggerPath() {
    const path = getDoggerPath();
    if (!fs.existsSync(path))
        fs.mkdirSync(path);

    return path;
}