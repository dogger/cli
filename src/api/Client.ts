import { GeneralApi, ConfigurationParameters, FetchAPI, Configuration } from "./openapi";
import fetch, { RequestInfo, RequestInit } from "node-fetch";
import { isDevMode } from "../utils/general";
import { refreshAccessToken } from "../utils/auth/tokens";
import { globalState } from "../utils/auth/globals";
import { consoleVerbose } from "../utils/console";

(global as any).FormData = class {};
(global as any).fetch = fetch;

class DoggerConfigurationParameters implements ConfigurationParameters {
    get basePath() {
        if(isDevMode())
            return "http://localhost:14566";

        return "https://app.dogger.io";
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

            const isVerbose = globalState.isVerbose;
            if(isVerbose) {
                consoleVerbose("Sending request to " + input + "\n" + JSON.stringify(init));
            }

            let response = null;
            if(init.method === "GET") {
                let retryCount = 0;
                while(true) {
                    try {
                        response = await fetch(input, init);
                        break;
                    } catch(ex) {
                        if(retryCount++ < 3) {
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        } else {
                            throw ex;
                        }
                    }
                }
            } else {
                response = await fetch(input, init);
            }

            if(isVerbose) {
                consoleVerbose("Response from " + input + " " + response.status + "\n" + JSON.stringify(await response.clone().text()));
            }

            return response;
        };
    }
}

export const apiClient = new GeneralApi(new Configuration(new DoggerConfigurationParameters()));