import { withCredentials } from '../utils/auth';
import { CommandModule } from 'yargs';
import { consoleLog, consoleReference, showSpinnerUntil, printTable, askBoolean, printJobProgress, consoleError, consoleWarn } from '../utils/console';
import yargs = require('yargs');
import { handler } from '../utils/general';
import { apiClient } from '../api/Client';
import { handleValidationErrors } from '../utils/http';

type DestroyOptions = 
    { ["cluster-id"]: string; };

export = {
    command: "cluster",
    describe: "Commands regarding your current clusters.",
    builder: yargs => yargs
        .command({
            command: "ls", 
            describe: "Lists all clusters and their instances.",
            builder: argv => argv,
            handler: handler(withCredentials(async (_argv: any) => {
                let clusters = await showSpinnerUntil(
                    'Fetching your clusters from Dogger',
                    async () => await apiClient.apiClustersGet());
                let pairs = clusters
                    .flatMap(c => c
                        .instances
                        ?.map(i => ({
                            cluster: c,
                            instance: i
                        })))
                    .filter(x => !!x)
                    .map(x => x!);
                if(pairs.length === 0)
                    consoleWarn(`You do not have any clusters available.`);

                printTable(pairs
                    .map(x => ({
                        ["cluster"]: x.cluster.id,
                        ["ip"]: x.instance.publicIpAddressV4
                    })));
                consoleLog(`For help on how to provision a new instance, type ${consoleReference("dogger plan provision --help")}.`);
            }))
        })
        .command({
            command: "destroy [cluster-id]", 
            describe: "Destroys a given cluster.",
            builder: yargs => yargs
                .positional("cluster-id", {
                    type: "string",
                    demandOption: true
                }),
            handler: handler(withCredentials(async argv => {
                const sure = await askBoolean("Are you sure?");
                if(!sure)
                    return;

                await handleValidationErrors(
                    async () => {
                        await showSpinnerUntil(
                            'Sending destroy request to Dogger',
                            async () => await apiClient.apiClustersClusterIdDestroyPost(argv["cluster-id"]));
                    },
                    {
                        CLUSTER_NOT_FOUND: () => {
                            consoleError("The given cluster was not present in your account.");
                        }
                    });
            }))
        } as CommandModule<{}, DestroyOptions>)
        .demandCommand(),
    handler: () => {
        yargs.showHelp();
    }
} as CommandModule<{}>;