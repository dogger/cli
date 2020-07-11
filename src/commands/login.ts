import { CommandModule } from 'yargs';
import { consoleLog } from '../utils/console';
import { handler } from '../utils/general';
import { withCredentials } from '../utils/auth/middleware';

type LoginOptions = 
    { email: string; };

export = {
    command: "login [email]",
    describe: "Signs you in to Dogger via the CLI.",
    builder: yargs => yargs
        .positional("email", {
            type: "string",
            demandOption: false
        }),
    handler: handler(withCredentials(async () => {
        consoleLog("You are now signed in!");
    }))
} as CommandModule<{}, LoginOptions>;