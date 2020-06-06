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
    CommentPayload,
    CommentPayloadFromJSON,
    CommentPayloadFromJSONTyped,
    CommentPayloadToJSON,
    CommitPayload,
    CommitPayloadFromJSON,
    CommitPayloadFromJSONTyped,
    CommitPayloadToJSON,
    InstallationPayload,
    InstallationPayloadFromJSON,
    InstallationPayloadFromJSONTyped,
    InstallationPayloadToJSON,
    IssuePayload,
    IssuePayloadFromJSON,
    IssuePayloadFromJSONTyped,
    IssuePayloadToJSON,
    PullRequestPayload,
    PullRequestPayloadFromJSON,
    PullRequestPayloadFromJSONTyped,
    PullRequestPayloadToJSON,
    RepositoryPayload,
    RepositoryPayloadFromJSON,
    RepositoryPayloadFromJSONTyped,
    RepositoryPayloadToJSON,
    UserPayload,
    UserPayloadFromJSON,
    UserPayloadFromJSONTyped,
    UserPayloadToJSON,
} from './';

/**
 * 
 * @export
 * @interface WebhookPayload
 */
export interface WebhookPayload {
    /**
     * 
     * @type {string}
     * @memberof WebhookPayload
     */
    action?: string | null;
    /**
     * 
     * @type {PullRequestPayload}
     * @memberof WebhookPayload
     */
    pullRequest?: PullRequestPayload;
    /**
     * 
     * @type {RepositoryPayload}
     * @memberof WebhookPayload
     */
    repository?: RepositoryPayload;
    /**
     * 
     * @type {UserPayload}
     * @memberof WebhookPayload
     */
    sender?: UserPayload;
    /**
     * 
     * @type {IssuePayload}
     * @memberof WebhookPayload
     */
    issue?: IssuePayload;
    /**
     * 
     * @type {UserPayload}
     * @memberof WebhookPayload
     */
    pusher?: UserPayload;
    /**
     * 
     * @type {CommentPayload}
     * @memberof WebhookPayload
     */
    comment?: CommentPayload;
    /**
     * 
     * @type {InstallationPayload}
     * @memberof WebhookPayload
     */
    installation?: InstallationPayload;
    /**
     * 
     * @type {Array<CommitPayload>}
     * @memberof WebhookPayload
     */
    commits?: Array<CommitPayload> | null;
    /**
     * 
     * @type {string}
     * @memberof WebhookPayload
     */
    ref?: string | null;
}

export function WebhookPayloadFromJSON(json: any): WebhookPayload {
    return WebhookPayloadFromJSONTyped(json, false);
}

export function WebhookPayloadFromJSONTyped(json: any, ignoreDiscriminator: boolean): WebhookPayload {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'action': !exists(json, 'action') ? undefined : json['action'],
        'pullRequest': !exists(json, 'pull_request') ? undefined : PullRequestPayloadFromJSON(json['pull_request']),
        'repository': !exists(json, 'repository') ? undefined : RepositoryPayloadFromJSON(json['repository']),
        'sender': !exists(json, 'sender') ? undefined : UserPayloadFromJSON(json['sender']),
        'issue': !exists(json, 'issue') ? undefined : IssuePayloadFromJSON(json['issue']),
        'pusher': !exists(json, 'pusher') ? undefined : UserPayloadFromJSON(json['pusher']),
        'comment': !exists(json, 'comment') ? undefined : CommentPayloadFromJSON(json['comment']),
        'installation': !exists(json, 'installation') ? undefined : InstallationPayloadFromJSON(json['installation']),
        'commits': !exists(json, 'commits') ? undefined : (json['commits'] === null ? null : (json['commits'] as Array<any>).map(CommitPayloadFromJSON)),
        'ref': !exists(json, 'ref') ? undefined : json['ref'],
    };
}

export function WebhookPayloadToJSON(value?: WebhookPayload | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'action': value.action,
        'pull_request': PullRequestPayloadToJSON(value.pullRequest),
        'repository': RepositoryPayloadToJSON(value.repository),
        'sender': UserPayloadToJSON(value.sender),
        'issue': IssuePayloadToJSON(value.issue),
        'pusher': UserPayloadToJSON(value.pusher),
        'comment': CommentPayloadToJSON(value.comment),
        'installation': InstallationPayloadToJSON(value.installation),
        'commits': value.commits === undefined ? undefined : (value.commits === null ? null : (value.commits as Array<any>).map(CommitPayloadToJSON)),
        'ref': value.ref,
    };
}


