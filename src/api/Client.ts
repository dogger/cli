import { GeneralApi, ConfigurationParameters, FetchAPI, Configuration } from "./openapi";
import fetch, { RequestInfo, RequestInit } from "node-fetch";
import { isDevMode } from "../utils/general";
import { refreshAccessToken } from "../utils/auth/tokens";

(global as any).FormData = class {};
(global as any).fetch = fetch;

class DoggerConfigurationParameters implements ConfigurationParameters {
    get basePath() {
        if(isDevMode())
            return "http://localhost:14566";

        return "https://dogger.io";
    }

    get fetchApi(): any {
        return async (input: RequestInfo, init: RequestInit) => {
            var token = await refreshAccessToken();
            if(token) {
                init.headers = {
                    ...(init.headers || {}),
                    "Authorization": `Bearer ${token}`
                };
            }

            if(init.method === "GET") {
                let retryCount = 0;
                while(retryCount++ < 3) {
                    try {
                        return await fetch(input, init);
                    } catch(ex) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            } else {
                return await fetch(input, init);
            }
        };
    }
}

export const apiClient = new GeneralApi(new Configuration(new DoggerConfigurationParameters()));