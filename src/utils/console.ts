import readline = require('readline');
import { Table } from 'console-table-printer';
import { apiClient } from '../api/Client';
import ora = require('ora');
import { delay } from './time';
import colors = require('colors/safe');
import stringHash = require('string-hash');

function createInteractiveConsole() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}

export async function ask(question: string) {
    return new Promise<string>((resolve, reject) => {
        const interactiveConsole = createInteractiveConsole();
        interactiveConsole.on('close', reject);

        interactiveConsole.question(`${colors.yellow(question)}\n`, (answer) => {
            resolve(answer?.trim());
            interactiveConsole.off('close', reject);
            interactiveConsole.close();

            console.log('');
        });
    });
}

export async function showSpinnerUntil<T>(description: string, operation: (stopSpinner: () => void) => Promise<T>) {
    const spinner = ora({
        text: description,
        color: "cyan",
        stream: process.stdout
    }).start();

    const stopper = () => spinner.stop();
    try {
        let result = await operation(stopper);
        return result;
    } finally {
        stopper();
    }
}

export function consoleReference(command: string): string {
    return colors.gray(command);
}

export function consoleVerbose(text: string) {
    console.log();
    console.log(colors.gray(text));
}

export function consoleError(text: string) {
    console.error(colors.red(text));
}

export function consoleWarn(text: string) {
    console.log(colors.yellow(text));
}

export function consoleLog(text: string) {
    console.log(colors.cyan(text));
}

export async function showSpinnerWhile(initialDescription: string, tick: () => Promise<string|false>) {
    const spinner = ora({
        text: initialDescription,
        color: "cyan",
        stream: process.stdout
    });

    spinner.start();

    try {
        while(true) {
            let description = await tick();
            if(description === false)
                break;

            spinner.text = description;

            await delay(2000);
        }
    } finally {
        spinner.stop();
    }
}

export async function printJobProgress(jobId: string|null|undefined) {
    if(!jobId)
        throw new Error("No job ID was supplied.");

    await showSpinnerWhile(
        'Waiting for response from Dogger', 
        async () => {
            let job = await apiClient.apiJobsJobIdStatusGet(jobId);
            if(job.isEnded)
                return false;

            return 'Latest server status: ' + job.stateDescription;
        });
}

export function getColorizationFunctionFromText(text: string) {
    const availableColors = [
        colors.red,
        colors.green,
        colors.yellow,
        colors.blue,
        colors.magenta,
        colors.cyan,
    ];

    const pivot = stringHash(text);
    return availableColors[pivot % availableColors.length];
}

export async function askBoolean(question: string) {
    let response = await ask(`${question} [${colors.white("Y")}/${colors.white("n")}]`);
    if(!response)
        return false;

    var lower = response.toLowerCase();
    return lower === "y" || lower === "yes";
}

export function printTable(rows: Array<any>, columns?: string[]) {
    const table = new Table({
        columns: columns && columns.map(column => ({
            name: column
        }))
    });

    rows.forEach(row => 
        table.addRow(row, { color: "green" }));

    table.printTable();
}