import { LogsResponse } from '../api/openapi';
import logUpdate = require('log-update');
import { getColorizationFunctionFromText } from "../utils/console";
import colors = require('colors/safe');
import { delay } from '../utils/time';

export async function printLogs(retrievalMethod: () => Promise<LogsResponse[]>, once: boolean) {
    const log = logUpdate.create(process.stdout, {
        showCursor: false
    });

    do {
        let logsResponses = await retrievalMethod();
        let logText = logsResponses
            .map(x => {
                var colorizationFunction = getColorizationFunctionFromText(x.containerImage!);
                const trimmedLogs = x.logs!
                    .split('\n')
                    .filter(x => !!x)
                    .map(x => x.trim())
                    .filter(x => !!x)
                    .join('\n');
                return colors.gray(x.containerImage + " (" + x.containerId + ")") + "\n" + colorizationFunction(trimmedLogs);
            })
            .join("\n\n");
        log(logText);
        await delay(1000);
    } while(!once);
}