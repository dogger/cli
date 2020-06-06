/* tslint:disable */
/* eslint-disable */
/**
 * General
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: v1
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
import {
    RepositoryResponse,
    RepositoryResponseFromJSON,
    RepositoryResponseFromJSONTyped,
    RepositoryResponseToJSON,
} from './';

/**
 * 
 * @export
 * @interface RepositoriesResponse
 */
export interface RepositoriesResponse {
    /**
     * 
     * @type {Array<RepositoryResponse>}
     * @memberof RepositoriesResponse
     */
    repositories?: Array<RepositoryResponse> | null;
}

export function RepositoriesResponseFromJSON(json: any): RepositoriesResponse {
    return RepositoriesResponseFromJSONTyped(json, false);
}

export function RepositoriesResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): RepositoriesResponse {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'repositories': !exists(json, 'repositories') ? undefined : (json['repositories'] === null ? null : (json['repositories'] as Array<any>).map(RepositoryResponseFromJSON)),
    };
}

export function RepositoriesResponseToJSON(value?: RepositoriesResponse | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'repositories': value.repositories === undefined ? undefined : (value.repositories === null ? null : (value.repositories as Array<any>).map(RepositoryResponseToJSON)),
    };
}


