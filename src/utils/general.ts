import { compare } from 'semver';

import packageJson = require('../metadata.json');
import { consoleWarn, consoleReference, consoleError, consoleVerbose } from './console';
import colors = require('colors/safe');
import fetch, { Response } from 'node-fetch';
import { globalState } from './auth/globals';

export function checkCommands(yargs: any, argv: any, numRequired: any) {
    if (argv._.length < numRequired) {
        yargs.showHelp()
    } else {
        // check for unknown command
    }
}

export function trimStart(text: string|undefined|null, trim: string) {
    if(!trim || !text)
        return text;

    while(text.indexOf(trim) === 0)
        text = text.substring(trim.length);

    return text;
}

export function handler<T>(callback: (args: T) => Promise<any>) {
    return async (args: T) => {
        globalState.setCurrentArguments(args);

        if(globalState.isVerbose) {
            consoleVerbose("Arguments: " + JSON.stringify(args));
        }

        if(process.env.DOGGER_NO_UPDATE !== "true") {
            try {
                var packageInformationResponse = await fetch('https://api.npms.io/v2/package/@dogger%2Fcli');
                var responseObject = await packageInformationResponse.json();

                var latestVersion = responseObject.collected.metadata.version;
                var currentVersion = packageJson.version;

                if (compare(latestVersion, currentVersion) > 0) {
                    consoleWarn(`There's a new version of @dogger/cli available (${colors.green(latestVersion)}). You're on ${colors.red(currentVersion)}.\nUpdate using ${consoleReference("npm i @dogger/cli -g")}.`);
                }
            } catch (e) {
                consoleWarn("Could not check for updates to @dogger/cli.");
            }
        }

        try {
            await callback(args);
        } catch(ex) {
            if(ex instanceof Response) {
                consoleError("Received an unexpected response from the server. Try again later.");

                if(ex.status !== 502)
                    consoleError("HTTP " + ex.status + ": " + (await ex.text() || "No response."));
            } else {
                if(isDevMode())
                    throw ex;
                
                consoleError("An unhandled error occured: " + ex);
            }
        }
    };
}

export function isDevMode() {
    return !!process.env.DOGGER_CLI_DEV;
}