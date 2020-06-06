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
    FileRequest,
    FileRequestFromJSON,
    FileRequestFromJSONTyped,
    FileRequestToJSON,
} from './';

/**
 * 
 * @export
 * @interface DeployToClusterRequest
 */
export interface DeployToClusterRequest {
    /**
     * 
     * @type {Array<string>}
     * @memberof DeployToClusterRequest
     */
    dockerComposeYmlContents?: Array<string> | null;
    /**
     * 
     * @type {Array<FileRequest>}
     * @memberof DeployToClusterRequest
     */
    files?: Array<FileRequest> | null;
}

export function DeployToClusterRequestFromJSON(json: any): DeployToClusterRequest {
    return DeployToClusterRequestFromJSONTyped(json, false);
}

export function DeployToClusterRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): DeployToClusterRequest {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'dockerComposeYmlContents': !exists(json, 'dockerComposeYmlContents') ? undefined : json['dockerComposeYmlContents'],
        'files': !exists(json, 'files') ? undefined : (json['files'] === null ? null : (json['files'] as Array<any>).map(FileRequestFromJSON)),
    };
}

export function DeployToClusterRequestToJSON(value?: DeployToClusterRequest | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'dockerComposeYmlContents': value.dockerComposeYmlContents,
        'files': value.files === undefined ? undefined : (value.files === null ? null : (value.files as Array<any>).map(FileRequestToJSON)),
    };
}


