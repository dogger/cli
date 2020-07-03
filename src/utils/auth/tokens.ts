import { globalState, getClientId } from "./globals";
import { getPersistedRefreshToken, persistRefreshToken } from "./persistence";
import { postForm, postJson } from "../http";
import { ask, consoleLog, consoleError } from "../console";
import { URLSearchParams } from 'url';

export async function refreshAccessToken(refreshToken?: string) {
    if(globalState.isStateless)
        return null;

    if(globalState.accessToken)
        return globalState.accessToken;

    const refreshTokenToUse = refreshToken || getPersistedRefreshToken();
    if(!refreshTokenToUse)
        return null;

    let form = new URLSearchParams();
    form.append("grant_type", "refresh_token");
    form.append("client_id", getClientId());
    form.append("refresh_token", refreshTokenToUse);

    let { access_token } = await postForm("https://dogger.eu.auth0.com/oauth/token", form);

    globalState.accessToken = access_token;
    return access_token as string;
}

export async function acquireNewTokens(email?: string) {
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

        const response: { access_token: string, refresh_token: string } = await postJson("https://dogger.eu.auth0.com/oauth/token", {
            "grant_type": "http://auth0.com/oauth/grant-type/passwordless/otp",
            "client_id": getClientId(),
            "username": email,
            "otp": code,
            "realm": "email",
            "audience": "https://dogger.io/api",
            "scope": "offline_access"
        });

        persistRefreshToken(response.refresh_token);

        return response;
    } catch (ex) {
        ex && consoleError("Could not acquire a new access token for Dogger.");
        throw ex;
    }
}