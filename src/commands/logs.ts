import { CommandModule } from 'yargs';
import { consoleLog, consoleReference } from '../utils/console';
import yargs = require('yargs');
import { handler } from '../utils/general';
import { printLogs } from './logs.shared';
import { apiClient } from '../api/Client';
import { withCredentials } from '../utils/auth/middleware';

interface LogsOptions {
    follow: boolean;
}

export = {
    command: "logs",
    describe: "Fetch the logs of an instance.",
    builder: yargs => yargs
        .options({
            "follow": {
                type: "boolean",
                demand: false,
                default: false,
                description: "Follows log output."
            }
        }),
    handler: handler(withCredentials(async argv => {
        await printLogs(
            async () => await apiClient.apiClustersClusterIdLogsGet(null),
            !argv.follow);
    }))
} as CommandModule<{}, LogsOptions>;