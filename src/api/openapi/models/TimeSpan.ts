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
/**
 * 
 * @export
 * @interface TimeSpan
 */
export interface TimeSpan {
    /**
     * 
     * @type {number}
     * @memberof TimeSpan
     */
    readonly ticks?: number;
    /**
     * 
     * @type {number}
     * @memberof TimeSpan
     */
    readonly days?: number;
    /**
     * 
     * @type {number}
     * @memberof TimeSpan
     */
    readonly hours?: number;
    /**
     * 
     * @type {number}
     * @memberof TimeSpan
     */
    readonly milliseconds?: number;
    /**
     * 
     * @type {number}
     * @memberof TimeSpan
     */
    readonly minutes?: number;
    /**
     * 
     * @type {number}
     * @memberof TimeSpan
     */
    readonly seconds?: number;
    /**
     * 
     * @type {number}
     * @memberof TimeSpan
     */
    readonly totalDays?: number;
    /**
     * 
     * @type {number}
     * @memberof TimeSpan
     */
    readonly totalHours?: number;
    /**
     * 
     * @type {number}
     * @memberof TimeSpan
     */
    readonly totalMilliseconds?: number;
    /**
     * 
     * @type {number}
     * @memberof TimeSpan
     */
    readonly totalMinutes?: number;
    /**
     * 
     * @type {number}
     * @memberof TimeSpan
     */
    readonly totalSeconds?: number;
}

export function TimeSpanFromJSON(json: any): TimeSpan {
    return TimeSpanFromJSONTyped(json, false);
}

export function TimeSpanFromJSONTyped(json: any, ignoreDiscriminator: boolean): TimeSpan {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'ticks': !exists(json, 'ticks') ? undefined : json['ticks'],
        'days': !exists(json, 'days') ? undefined : json['days'],
        'hours': !exists(json, 'hours') ? undefined : json['hours'],
        'milliseconds': !exists(json, 'milliseconds') ? undefined : json['milliseconds'],
        'minutes': !exists(json, 'minutes') ? undefined : json['minutes'],
        'seconds': !exists(json, 'seconds') ? undefined : json['seconds'],
        'totalDays': !exists(json, 'totalDays') ? undefined : json['totalDays'],
        'totalHours': !exists(json, 'totalHours') ? undefined : json['totalHours'],
        'totalMilliseconds': !exists(json, 'totalMilliseconds') ? undefined : json['totalMilliseconds'],
        'totalMinutes': !exists(json, 'totalMinutes') ? undefined : json['totalMinutes'],
        'totalSeconds': !exists(json, 'totalSeconds') ? undefined : json['totalSeconds'],
    };
}

export function TimeSpanToJSON(value?: TimeSpan | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
    };
}


