import { showSpinnerUntil, consoleError, consoleLog, askBoolean, printJobProgress, consoleReference, printTable } from "../utils/console";
import { apiClient } from "../api/Client";
import yargs = require("yargs");
import { PlanResponse } from "../api/openapi";
import { handleValidationErrors } from "../utils/http";
import open from "open";

export type ProvisionOptions = FilterOptions & 
    { plan?: string, demo?: boolean; } &
    { skipConfirmation?: boolean; };

export interface FilterOptions {
    memory?: number;
    cpus?: number;
    disk?: number;
    data?: number;
}

export function filterOptions(yargs: yargs.Argv<{}>) {
    return yargs.options({
        "memory": {
            alias: "m",
            description: "The minimum amount of memory in megabytes.",
            type: "number",
            demand: false
        },
        "cpus": {
            alias: "c",
            description: "The minimum amount of CPUs.",
            type: "number",
            demand: false
        },
        "disk": {
            alias: "di",
            description: "The minimum disk size in gigabytes.",
            type: "number",
            demand: false
        },
        "data": {
            alias: "da",
            description: "The minimum monthly data transfer in gigabytes.",
            type: "number",
            demand: false
        }
    });
}

export async function getMatchingPlans(argv: FilterOptions) {
    let plans = await showSpinnerUntil(
        'Fetching plans from Dogger',
        async () => await apiClient.apiPlansGet());

    if(argv.cpus)
        plans = plans.filter(x => x.cpuCount! >= argv.cpus!);

    if(argv.data)
        plans = plans.filter(x => x.transferPerMonthInGigabytes! >= argv.data!);

    if(argv.disk)
        plans = plans.filter(x => x.diskSizeInGigabytes! >= argv.disk!);

    if(argv.memory)
        plans = plans.filter(x => x.ramSizeInMegabytes! >= argv.memory!);

    return plans;
}

export function printPlansTable(plans: PlanResponse[]) {
    printTable(plans.map(x => ({
        ["plan"]: x.id,
        cpus: x.cpuCount,
        ["data (GB)"]: x.transferPerMonthInGigabytes,
        ["memory (MB)"]: x.ramSizeInMegabytes,
        ["disk (GB)"]: x.diskSizeInGigabytes,
        ["$/mo"]: x.priceInHundreds! / 100
    })));
}

export async function provision(argv: ProvisionOptions) {
    if(argv.demo) {
        return await provisionDemo(argv);
    } else {
        return await provisionPlan(argv);
    }
}

async function provisionPlan(argv: ProvisionOptions) {
    let plans = await getMatchingPlans(argv);
    let plan = 
        (argv.plan && plans.find(x => x.id == argv.plan)) ||
        plans[0];

    if(!plan) {
        consoleError('No plan was found that matches the given criteria. Either specify a valid plan, or loosen up the search criteria.');
        yargs.showHelp();
        return false;
    }

    if(!plan.id)
        throw new Error();

    let additionalText = "";
    if(!argv.plan)
        additionalText = " because no plan was specified"

    consoleLog(`The following plan will be provisioned${additionalText}.\nTo see all plans, use the "dogger plan ls" command.`);
    printPlansTable([plan]);

    let looksOk = await askBoolean("Does that look OK?");
    if(!looksOk)
        return false;

    return await handleValidationErrors(
        async () => {
            let response = await showSpinnerUntil(
                'Sending provisioning request to Dogger',
                async () => await apiClient.apiPlansProvisionPlanIdPost(plan.id!));
            await printJobProgress(response.jobId);

            consoleLog(`Your instance was provisioned! Now you can use ${consoleReference("dogger-compose up")} to deploy to it.`)
        },
        {
            NO_PAYMENT_METHOD: async () => {
                consoleError("You do not have a payment method assigned yet.");
                
                let wantsToAddPaymentMethod = await askBoolean("Do you want to add a payment method now?");
                if(!wantsToAddPaymentMethod)
                    return;

                await open('https://dogger.io/dashboard');
            }
        });
}

async function provisionDemo(argv: ProvisionOptions) {
    return await handleValidationErrors(async () => {
        let response = await showSpinnerUntil('Sending provisioning request to Dogger', async () => await apiClient.apiPlansProvisionDemoPost());
        await printJobProgress(response.jobId);

        if(!argv.skipConfirmation)
            consoleLog(`Your instance was provisioned! Now you can use ${consoleReference("dogger-compose up --demo")} to deploy to it.`);
    }, {
        NO_PAYMENT_METHOD: async () => {
            consoleError("You do not have a payment method assigned yet.");
            let wantsToAddPaymentMethod = await askBoolean("Do you want to add a payment method now?");
            if (!wantsToAddPaymentMethod)
                return;

            await open('https://dogger.io/dashboard');
        },
        ALREADY_PROVISIONED: () => {
            consoleError("All of our demo servers are currently being used by someone else. Try again in an hour, since all demo servers have a temporary lifespan. Alternatively, consider provisioning a non-demo server.");
        }
    });
}
