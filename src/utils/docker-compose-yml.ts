import yaml from 'yaml';
import fs = require('fs');
import path = require('path');
import { globalState } from './auth/globals';
import { consoleVerbose } from './console';
import { getFilesRecursively } from './files';

export type EnvFile = string|string[]|undefined;

export type Volume = {
    source: string|undefined;
}

export type Volumes = undefined|Array<Volume|string>;

export type Build = {
    context: string|undefined;
    dockerfile: string|undefined;
}

export type Service = {
    env_file: EnvFile|undefined;
    volumes: Volumes|undefined;
    build: Build|undefined;
    image: string|undefined;
}

export type GlobalVolume = {
    driver: string|undefined;
}

export type ComposeContents = {
    services: {
        [name: string]: Service
    },
    volumes: {
        [name: string]: GlobalVolume
    }
}

export type ComposeFile = {
    parsed: ComposeContents;
    path: string;
    contents: string;
}

export function getServicesWithBuildReferences(composeFiles: ComposeFile[]) {
    const services = getServicesFromComposeFiles(...composeFiles);
    return services.filter(x => !!x.service.build);
}

export function parseComposeFiles(filePaths: string[]): ComposeFile[] {
    return filePaths.map(parseComposeFile);
}

export function yamlifyComposeFiles(composeFiles: ComposeFile[]) {
    return composeFiles
        .map(x => x.parsed)
        .map(x => yaml.stringify(x));
}

export function parseComposeFile(filePath: string): ComposeFile {
    const fileContents = fs.readFileSync(filePath).toString();
    return {
        parsed: yaml.parse(fileContents),
        contents: fileContents,
        path: path.resolve(filePath)
    }
}

export function getServicesFromComposeFiles(...composeFiles: ComposeFile[]) {
    return composeFiles
        .map(x => x.parsed)
        .map(x => x.services)
        .filter(x => !!x)
        .map(services => Object
            .getOwnPropertyNames(services)
            .map(serviceName => ({
                service: services[serviceName],
                name: serviceName
            }))
            .filter(x => !!x.service))
        .filter(x => !!x)
        .flat();
}

export function getGlobalVolumesFromComposeFiles(...composeFiles: ComposeFile[]) {
    return composeFiles
        .map(x => x.parsed)
        .map(x => x.volumes)
        .filter(x => !!x)
        .map(services => Object
            .getOwnPropertyNames(services)
            .map(serviceName => ({
                name: serviceName
            }))
            .filter(x => !!x.name))
        .filter(x => !!x)
        .flat();
}

export function mapPropertyFromServices<T>(
    composeFiles: ComposeFile[],
    selector: (service: Service) => T|null|undefined): T[]
{
    const values = getServicesFromComposeFiles(...composeFiles)
        .map(x => x.service)
        .map(selector)
        .filter(x => !!x)
        .flat();
    return values as T[];
}

export function getAbsolutePathRelativeToComposeFiles(composeFiles: ComposeFile[], relativeFilePath: fs.PathLike) {
    return path.join(
        getWorkingDirectoryForDockerComposeFiles(composeFiles), 
        relativeFilePath.toString());
}

export function getRelativePathRelativeToComposeFiles(composeFiles: ComposeFile[], absoluteFilePath: fs.PathLike) {
    const workingDirectory = getWorkingDirectoryForDockerComposeFiles(composeFiles);
    return path.join(absoluteFilePath.toString().substr(workingDirectory.length + 1));
}

export function getWorkingDirectoryForDockerComposeFiles(composeFiles: ComposeFile[]): string {
    return path.dirname(composeFiles[0].path.toString());
}

export function getVolumeFilePaths(...composeFiles: ComposeFile[]): string[] {
    const globalVolumes = getGlobalVolumesFromComposeFiles(...composeFiles);

    return mapPropertyFromServices(composeFiles, ({volumes}) => {
        if(typeof volumes === "undefined") {
            return void 0;
        } else if(Array.isArray(volumes)) {
            return volumes
                .map(volume => typeof volume === "string" ?
                    volume.split(':')[0] :
                    volume.source)
                .filter(volume => 
                    !!volume &&
                    !globalVolumes.find(v => v.name === volume))
                .map(x => x!)
                .map(volumePath => {
                    const absolutePath = getAbsolutePathRelativeToComposeFiles(composeFiles, volumePath);
                    if(!fs.existsSync(absolutePath))
                        return [];
                    
                    const stat = fs.lstatSync(absolutePath);
                    if(!stat.isDirectory() && stat.isFile()) {
                        return [volumePath];
                    } else if(stat.isDirectory() && !stat.isFile()) {
                        return [...getFilesRecursively(absolutePath)]
                            .map(relativePath => `${volumePath}/${relativePath}`);
                    }

                    return [];
                })
                .flat()
                .filter(x => !!x)
                .map(x => x!);
        } else {
            return null;
        }
    }) as any as string[];
}

export function getEnvironmentFilePaths(...composeFiles: ComposeFile[]): string[] {
    return mapPropertyFromServices(composeFiles, ({env_file}) => {
        if(typeof env_file === "undefined") {
            return void 0;
        } else if(typeof env_file === "string") {
            return [env_file];
        } else if(Array.isArray(env_file)) {
            return env_file;
        } else {
            return null;
        }
    }) as any as string[];
}

export function getContextFilePaths(...composeFiles: ComposeFile[]): string[] {
    const pathToSearch = getWorkingDirectoryForDockerComposeFiles(composeFiles);
    return [...getFilesRecursively(pathToSearch)]
        .map(path => getRelativePathRelativeToComposeFiles(
            composeFiles,
            path
        ));
}