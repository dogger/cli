import fetch, { BodyInit, Response } from 'node-fetch';
import { URLSearchParams } from 'url';
import { consoleError } from './console';

type ValidationCode = 
    "NO_PAYMENT_METHOD";

export interface ValidationErrorDetails {
    type: ValidationCode;
    detail: string;
    title?: string;
}

async function post(url: string, contentType: string, body: BodyInit) {
    let response = await fetch(url, {
        method: 'POST',
        headers: [
            ["Content-Type", contentType]
        ],
        body: body
    });
    if (!response.ok)
        throw new Error('Could not make request to ' + url + ': ' + await response.text());

    return response.json();
}

export async function postForm(url: string, body: URLSearchParams) {
    return await post(url, "application/x-www-form-urlencoded", body);
}

export async function postJson(url: string, body: any) {
    return await post(url, "application/json", JSON.stringify(body));
}

export async function handleValidationErrors<T>(action: () => Promise<T|boolean>, handlers: { [code: string]: (error?: ValidationErrorDetails) => Promise<void>|void }) {
    try {
        return await action() !== false;
    } catch(e) {
        if(e instanceof Response && e && e.status && e.status === 400) {
            try {
                var validationError = await e.json() as ValidationErrorDetails;
                if(validationError.type in handlers) {
                    await Promise.resolve(handlers[validationError.type](validationError));
                } else {
                    consoleError("An unknown validation error occured: " + JSON.stringify(validationError));
                }
            } catch(e) {
                consoleError("An unknown error occured: " + e);
                consoleError(await e.text());
            }
        } else {
            throw e;
        }
    }

    return false;
}