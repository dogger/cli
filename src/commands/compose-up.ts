import { withCredentials } from '../utils/auth';
import { CommandModule } from 'yargs';
import { apiClient } from '../api/Client';
import { existsSync, readFileSync, PathLike } from 'fs';
import { consoleError, showSpinnerUntil, consoleLog, consoleWarn, consoleReference, printJobProgress, printTable } from '../utils/console';
import { handler, trimStart, isDevMode } from '../utils/general';
import { Options } from './compose-up.shared';
import execa = require('execa');
import path = require('path');
import { parseComposeFile, getEnvironmentFilePaths, ComposeFile, getVolumeFilePaths, getAbsolutePathRelativeToComposeFiles as getAbsoluteDirectoryRelativeToComposeFile, getServicesWithBuildReferences, getWorkingDirectoryForDockerComposeFiles, getServicesFromComposeFiles, yamlifyComposeFiles } from '../utils/docker-compose-yml';
import { provision } from './plan.shared';
import { DeployToClusterRequest } from '../api/openapi';
import { handleValidationErrors } from '../utils/http';
import { printLogs } from './logs.shared';

function tryMapFile(composeFiles: ComposeFile[], filePath: PathLike) {
    const relativeFilePathToComposeFile = getAbsoluteDirectoryRelativeToComposeFile(composeFiles, filePath);
    if(!existsSync(relativeFilePathToComposeFile)) {
        consoleWarn(`Could not find the file "${relativeFilePathToComposeFile}" specified in the Docker Compose YML, so it will not be sent to the server. You may experience an error because of this.`)
        return null;
    }

    return {
        contents: readFileSync(relativeFilePathToComposeFile).toString(),
        path: filePath.toString()
    };
}

function tryGetVolumeFiles(...composeFiles: ComposeFile[]) {
    return getVolumeFilePaths(...composeFiles)
        .filter(x => !!x)
        .map(x => tryMapFile(composeFiles, x))
        .filter(x => !!x)
        .map(x => x!);
}

function tryGetEnvironmentFiles(...composeFiles: ComposeFile[]) {
    return getEnvironmentFilePaths(...composeFiles)
        .filter(x => !!x)
        .map(x => tryMapFile(composeFiles, x))
        .filter(x => !!x)
        .map(x => x!);
}

function tryGetDockerComposeYmlFilesFromFilePaths(filePaths: string[]) {
    const files = filePaths
        .map(filePath => {
            if(!existsSync(filePath)) {
                consoleError("The file " + filePath + " does not exist.");
                return null;
            }

            return filePath;
        })
        .map(filePath => {
            if(filePath === null)
                return null;

            try {
                var composeFile = parseComposeFile(filePath);
            }
            catch (ex) {
                consoleError("YAML error in " + filePath + ": " + ex.message + "\nAt: " + ex.source);
                return null;
            }
            return composeFile;
        });
    if(files.find(x => !x))
        return null;

    return files.filter(x => !!x) as ComposeFile[];
}

export = {
    command: "up", 
    describe: "Deploys to Dogger.",
    builder: yargs => yargs
        .options({
            "file": {
                alias: 'f',
                description: 'Specify an alternate compose file',
                type: 'string',
                demand: false,
                default: 'docker-compose.yml',
                nargs: 1,
                normalize: true
            },
            "cluster-id": {
                alias: 'c',
                description: 'The ID of cluster to deploy to, if you have multiple clusters.',
                type: "string",
                demand: false
            },
            "demo": {
                type: "boolean",
                demand: false,
                description: "Deploy to a demo cluster, if one is available."
            },
            "detach": {
                alias: "d",
                type: "boolean",
                demand: false,
                default: false,
                description: "Detached mode: Run deployment in the background, print container connection details."
            }
        })
        .conflicts('cluster-id', 'demo')
        .array("file"),
    handler: handler(withCredentials(async argv => {
        const filePaths = argv.file || [];
        if(filePaths.length === 0)
            filePaths.push('docker-compose.yml');

        const dockerComposeYmlFiles = tryGetDockerComposeYmlFilesFromFilePaths(filePaths);
        if(dockerComposeYmlFiles === null)
            return;

        const files = [
            ...tryGetEnvironmentFiles(...dockerComposeYmlFiles),
            ...tryGetVolumeFiles(...dockerComposeYmlFiles)
        ];

        if(argv.demo) {
            const wasProvisioned = await provision({
                ...argv,
                demo: true,
                skipConfirmation: true
            });
            if(!wasProvisioned)
                return;
        }

        const servicesToBuild = getServicesWithBuildReferences(dockerComposeYmlFiles);
        if(servicesToBuild.length > 0) {
            const workingDirectory = getWorkingDirectoryForDockerComposeFiles(dockerComposeYmlFiles);
            const commandArguments = [
                argv.file.map(f => ["-f", f]).flat(),
                "build",
                "--no-cache",
                "--force-rm",
                ["--progress", "plain"]
            ].flat();
            const buildProcess = await showSpinnerUntil(`Building Docker images locally`, async () => 
                await execa('docker-compose', commandArguments, {
                    cwd: workingDirectory,
                    reject: false
                }));
            if(buildProcess.exitCode !== 0) {
                consoleError('Docker images could not build.');
                consoleError(buildProcess.stderr);
                return;
            }

            consoleLog('Docker images have been built.');
            consoleLog(consoleReference(buildProcess.stdout));
            console.log();

            const loginResponse = argv.demo ? 
                await apiClient.apiRegistryDemoLoginGet() :
                await apiClient.apiRegistryLoginGet();
            if(!loginResponse)
                throw new Error();

            const registryHostName = loginResponse.url;
            const {username, password} = loginResponse;

            const loginProcess = await showSpinnerUntil(`Signing in to Dogger registry`, async () => 
                await execa("docker", ["login", ["--username", username], ["--password", password], registryHostName].flat(), {
                    reject: false
                }));
            if(loginProcess.exitCode !== 0) {
                consoleError('Could not sign in to Dogger registry.');
                consoleError(loginProcess.stderr);
                return;
            }

            consoleLog("Signed in to Dogger registry.");
            consoleLog(consoleReference(loginProcess.stdout));
            console.log();

            for(let service of servicesToBuild) {
                const remoteTag = `${registryHostName}:${service.name}`;
                const imageName = `${path.basename(workingDirectory)}_${service.name}`;
                const isSuccessful = await showSpinnerUntil(
                    `Pushing built image ${service.name} to secure Dogger write-only registry`, 
                    async (stopSpinner) => {
                        const tagProcess = await execa(
                            "docker", 
                            ["tag", `${imageName}:latest`, remoteTag], 
                            {
                                reject: false
                            });
                        if(tagProcess.exitCode !== 0) {
                            stopSpinner();

                            consoleError(`Could not tag image ${imageName}.`);
                            consoleError(tagProcess.stderr);
                            return false;
                        }

                        const pushProcess = await execa(
                            "docker", 
                            ["push", remoteTag], 
                            {
                                reject: false
                            });
                        if(pushProcess.exitCode !== 0) {
                            stopSpinner();

                            consoleError(`Could not push image ${imageName}.`);
                            consoleError(pushProcess.stderr);
                            return false;
                        }

                        stopSpinner();

                        consoleLog(`Image ${imageName} has been pushed.`);

                        if(isDevMode())
                            consoleLog(consoleReference(pushProcess.stdout));

                        return true;
                    });
                if(!isSuccessful)
                    return;

                for(let dockerComposeYmlFile of dockerComposeYmlFiles) {
                    const parsedService = dockerComposeYmlFile.parsed.services[service.name];
                    if(!parsedService)
                        continue;

                    delete parsedService["build"];
                    parsedService.image = remoteTag;
                }
            }
        }

        const clusterId = argv["cluster-id"] || null;

        let wasDeployed = await handleValidationErrors(
            async () => {
                let response = await showSpinnerUntil(
                    'Sending deployment request to Dogger',
                    async () => {
                        const body: DeployToClusterRequest = {
                            dockerComposeYmlContents: yamlifyComposeFiles(dockerComposeYmlFiles),
                            files
                        };

                        if(argv.demo)
                            return await apiClient.apiClustersDemoDeployPost(body);

                        return clusterId ?
                            await apiClient.apiClustersClusterIdDeployPost(clusterId, body) :
                            await apiClient.apiClustersDeployPost(body);
                    });
                if(!response)
                    throw new Error();

                await printJobProgress(response.jobId);
            },
            {
                DOCKER_COMPOSE_UP_FAIL: err => {
                    consoleError(`Dogger could not run your services on the server. The error message was "${err?.title}".`);
                },
                TOO_BROAD: () => {
                    consoleError("A cluster ID was not specified, and you have more than one present in your Dogger account.");
                },
                CLUSTER_NOT_FOUND: () => {
                    consoleError(`No clusters are present in your account. You can provision one with \"${consoleReference("dogger plan provision")}\".`);
                }
            });
        if(!wasDeployed)
            return;

        const connectionDetails = await showSpinnerUntil(
            'Fetching connection details', 
            async () => argv.demo ? 
                await apiClient.apiClustersDemoConnectionDetailsGet() :
                await apiClient.apiClustersClusterIdConnectionDetailsGet(clusterId));
        if(!connectionDetails)
            throw new Error();

        if(!connectionDetails.ports || connectionDetails.ports.length === 0) {
            consoleWarn("No ports were opened in the firewall. Make sure the relevant ports for your service are exposed in your docker-compose YML file(s).");
        } else {
            consoleLog("Your server has been provisioned. Here are the connection details.");

            printTable(
                connectionDetails.ports.map(port => ({
                    hostname: connectionDetails.hostName || connectionDetails.ipAddress,
                    port: port.port,
                    protocol: port.protocol
                })));
        }

        if(argv.detach) {
            consoleLog('A snapshot of the log statements for each container can be seen below.');
        } else {
            consoleLog('The live log statements for each container will be streamed below.\nTo skip this, use the ' + consoleReference("--detach") + " argument.");
        }

        consoleLog('');

        await printLogs(
            async () => argv.demo ?
                await apiClient.apiClustersDemoLogsGet() :
                await apiClient.apiClustersClusterIdLogsGet(clusterId),
            argv.detach);
    }, argv => !argv.demo))
} as CommandModule<{}, Options>;