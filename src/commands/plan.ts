import { withCredentials } from '../utils/auth';
import { CommandModule } from 'yargs';
import { consoleLog, consoleReference } from '../utils/console';
import yargs = require('yargs');
import { handler } from '../utils/general';
import { printPlansTable, filterOptions, getMatchingPlans, ProvisionOptions, provision, FilterOptions } from './plan.shared';

export = {
    command: "plan",
    describe: "Commands regarding available plans.",
    builder: yargs => yargs
        .command({
            command: "ls", 
            describe: "Lists all available plans.",
            builder: filterOptions,
            handler: handler(async argv => {
                let plans = await getMatchingPlans(argv);
                printPlansTable(plans);
                consoleLog(`For help on how to provision a plan, type ${consoleReference("dogger plan provision --help")}.`);
            })
        })
        .command({
            command: "provision <plan>", 
            describe: "Provisions a server with a given plan.",
            builder: yargs => filterOptions(yargs)
                .positional("plan", {
                    type: "string"
                })
                .options({
                    "demo": {
                        type: "boolean",
                        demand: false,
                        description: "Provisions a demo, if one is available."
                    }
                })
                .conflicts("demo", "plan")
                .conflicts("demo", "memory")
                .conflicts("demo", "cpus")
                .conflicts("demo", "disk")
                .conflicts("demo", "data"),
            handler: handler(withCredentials(provision))
        } as CommandModule<{}, ProvisionOptions>)
        .demandCommand(),
    handler: () => {
        yargs.showHelp();
    }
} as CommandModule<{}, FilterOptions>;