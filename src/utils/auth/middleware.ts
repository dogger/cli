import { refreshAccessToken, acquireNewTokens } from "./tokens";

export function withCredentials<T>(callback: (args: T, accessToken: string|null) => Promise<any>, when?: (args: T) => boolean) {    
    return async (args: T) => {
        if(when && !when(args)) {
            await callback(args, await refreshAccessToken());
        } else {
            let doggerTokenArgs = args as { doggerToken?: string, email?: string; };
            let token = !doggerTokenArgs.doggerToken ?
                await refreshAccessToken() :
                doggerTokenArgs.doggerToken;
            if (!token) {
                const response = await acquireNewTokens(doggerTokenArgs.email);
                token = response.access_token;

                if (!token)
                    return;
            }

            await callback(args, token);
        }
    };
}