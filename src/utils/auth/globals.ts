import { persistRefreshToken } from "./persistence";

class GlobalState {
    private _accessToken: string|null;
    private _isStateless: boolean;
    private _arguments: any;

    constructor() {
        this._accessToken = null;
        this._isStateless = false;
        this._arguments = null;
    }

    reset() {
        this._accessToken = null;
        this._isStateless = false;
        this._arguments = null;
    }

    setIsStateless(value: boolean) {
        if(value)
            persistRefreshToken('');

        this._isStateless = value;
    }

    setCurrentArguments(args: any) {
        this._arguments = args;
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

    get arguments() {
        return this._arguments;
    }

    get isVerbose() {
        return 'verbose' in (this._arguments || {});
    }
} 

export const globalState =  new GlobalState();

export function getClientId() {
    return "mphbiMTuOt9EpUCie28eWaYLIrjpeikC";
}