import 'array-flat-polyfill';

import index = require('./index');
import indexCompose = require('./index.compose');
import captureConsole = require('capture-console');
import { setIsStateless } from './utils/auth';

process.env.DOGGER_NO_UPDATE = "true";

type Pipe = {
    stdout?: (str: string) => void;
    stderr?: (str: string) => void;
}

type Options = {
    pipe?: Pipe;
    stateless?: boolean;
}

export = function(command: string, options?: Options) {
    if(!command)
        throw new Error('No command specified.');

    if(options?.stateless)
        setIsStateless(options?.stateless);

    const onBegin = () => {
        options?.pipe?.stdout && captureConsole.startIntercept(process.stdout, options?.pipe.stdout as any);
        options?.pipe?.stderr && captureConsole.startIntercept(process.stderr, options?.pipe.stderr as any);
    };

    const onEnd = () => {
        options?.pipe?.stdout && captureConsole.stopIntercept(process.stdout);
        options?.pipe?.stderr && captureConsole.stopIntercept(process.stderr);
    }

    const [name, ...rest] = command.split(' ');
    const newCommand = (rest || []).join(' ');
    if(name === "dogger") {
        onBegin();
        return new Promise(resolve => {
            index
                .onFinishCommand(resolve)
                .parse(newCommand);
        }).then(onEnd);
    }

    if(name === "dogger-compose") {
        onBegin();
        return new Promise(resolve => {
            indexCompose
                .onFinishCommand(resolve)
                .parse(newCommand);
        }).then(onEnd);
    }

    throw new Error('The given command "' + name + '" was not recognized. Must be either "dogger" or "dogger-compose".');
}