import fs from 'fs';
import path from 'path';
import { URLSearchParams } from 'url';

import { getDoggerPath, ensureDoggerPath } from './paths';
import { postForm, postJson } from './http';
import { ask, consoleLog, consoleError } from './console';

let token: string|null;
let isStateless: boolean;

resetGlobalState();

export function resetGlobalState() {
    token = null;
    isStateless = false;
}

export function setIsStateless(value: boolean) {
    if(value)
        setToken('');

    isStateless = value;
}

export function setToken(token: string) {
    if(isStateless)
        return;

    const doggerPath = ensureDoggerPath();
    fs.writeFileSync(
        path.join(
            doggerPath,
            'token'),
        token);
}

export async function getToken() {
    if(isStateless)
        return null;

    if(token)
        return token;

    const tokenPath = path.join(
        getDoggerPath(),
        'token');

    if (!fs.existsSync(tokenPath))
        return null;

    let refreshToken = fs
        .readFileSync(tokenPath)
        .toString();

    let form = new URLSearchParams();
    form.append("grant_type", "refresh_token");
    form.append("client_id", getClientId());
    form.append("refresh_token", refreshToken);

    let { access_token } = await postForm("https://dogger.eu.auth0.com/oauth/token", form);

    token = access_token;
    return access_token as string;
}

function getClientId() {
    return "mphbiMTuOt9EpUCie28eWaYLIrjpeikC";
}

async function acquireNewToken(email?: string) {
    try {
        if(!email)
            email = await ask('What e-mail do you use to sign in to Dogger?\nIf you haven\'t signed up yet, simply type your e-mail to sign up.');

        await postJson("https://dogger.eu.auth0.com/passwordless/start", {
            "client_id": getClientId(),
            "connection": "email",
            "email": email,
            "send": "code"
        });

        consoleLog("Check your e-mail. A one-time code has been sent to it.");

        let code = await ask("What is the one-time code?");

        let { refresh_token, access_token } = await postJson("https://dogger.eu.auth0.com/oauth/token", {
            "grant_type": "http://auth0.com/oauth/grant-type/passwordless/otp",
            "client_id": getClientId(),
            "username": email,
            "otp": code,
            "realm": "email",
            "audience": "https://dogger.io/api",
            "scope": "offline_access"
        });

        setToken(refresh_token);

        return access_token;
    } catch (ex) {
        if(ex) consoleError("Could not acquire a new access token for Dogger.");
    }
}

export function withCredentials<T>(callback: (args: T, accessToken: string|null) => Promise<any>, when?: (args: T) => boolean) {    
    return async (args: T) => {
        if(when && !when(args)) {
            await callback(args, await getToken());
        } else {
            let doggerTokenArgs = args as { doggerToken?: string, email?: string; };
            let token = !doggerTokenArgs.doggerToken ?
                await getToken() :
                doggerTokenArgs.doggerToken;
            if (!token) {
                token = await acquireNewToken(doggerTokenArgs.email);
                if (!token)
                    return;
            }

            await callback(args, token);
        }
    };
}