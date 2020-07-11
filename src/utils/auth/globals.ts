import { persistRefreshToken } from "./persistence";

class GlobalState {
    private _accessToken: string|null;
    private _isStateless: boolean;

    constructor() {
        this._accessToken = null;
        this._isStateless = false;
    }

    reset() {
        this._accessToken = null;
        this._isStateless = false;
    }

    setIsStateless(value: boolean) {
        if(value)
            persistRefreshToken('');

        this._isStateless = value;
    }

    get isStateless() {
        return this._isStateless;
    }

    set accessToken(value: string|null) {
        this._accessToken = value;
    }

    get accessToken() {
        return this._accessToken;
    }
} 

export const globalState =  new GlobalState();

export function getClientId() {
    return "mphbiMTuOt9EpUCie28eWaYLIrjpeikC";
}