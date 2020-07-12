jest.mock('fs');
jest.mock('path');

import * as fs from 'fs';
import * as path from 'path';

import { cleanMocked } from './tests';
import { parseComposeFile, getVolumeFilePaths, getServicesFromComposeFiles } from './docker-compose-yml';
import { MaybeMocked } from 'ts-jest/dist/util/testing';

function getComposeFileFromContents(
  fakeReadFileSync: MaybeMocked<typeof fs.readFileSync>,
  fakeResolve: MaybeMocked<typeof path.resolve>,
  fakeJoin: MaybeMocked<typeof path.join>,
  contents: string) 
{
  fakeReadFileSync.mockReturnValue(contents);
  fakeResolve.mockReturnValue("path");
  fakeJoin.mockImplementation((_, path) => "C:/" + path);

	return parseComposeFile("dummy");
}

test('getVolumeFilePaths_plausibleDockerComposeFileGiven_returnsAllVolumePaths', async () => {
  //arrange
	const fakeReadFileSync = cleanMocked(fs.readFileSync);
  const fakeResolve = cleanMocked(path.resolve);
  const fakeJoin = cleanMocked(path.join);

	const composeFile = getComposeFileFromContents(
    fakeReadFileSync,
    fakeResolve,
    fakeJoin,
    `
# NOTE:
# This Docker-compose file is created as a sample and should not be used directly for production
# You can adjust the settings as-per your environment
version: "3.3"
services:

# As it says, this service is a fake smtp server which accepts SMTP connections
# the inbox is available at localhost:8025, in actuality, you need to use a proper smtp server
  fake_smtp:
    image: mailhog/mailhog:v1.0.0
    ports:
    - 1025:1025
    - 8025:8025
    healthcheck:
      test: echo | telnet 127.0.0.1 1025


  plausible_db:
    image: postgres:12
    command: ["postgres", "-c", "log_statement=all", "-c", "log_destination=stderr"]
    volumes:
      - db-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=plausible_db
      - POSTGRES_USER=postgres
    ports:
      - 5432:5432

  plausible_events_db:
    image: yandex/clickhouse-server:latest
    volumes:
      - event-data:/var/lib/clickhouse
    ports:
    - 8123:8123

  plausible:
    build:
      context: .
      dockerfile: ./Dockerfile
    command: sh -c "sleep 10 && /entrypoint.sh run"
    depends_on:
      - plausible_db
      - plausible_events_db
      - fake_smtp
    ports:
      - 80:8080
    links:
      - plausible_db
      - plausible_events_db
      - fake_smtp
    env_file:
      - plausible-variables.sample.env


  setup:
    build:
      context: .
      dockerfile: ./Dockerfile
    command: sh -c "sleep 10 && /entrypoint.sh db createdb && /entrypoint.sh db migrate"
    depends_on:
      - plausible_db
      - plausible_events_db
    links:
      - plausible_db
      - plausible_events_db
    env_file:
       - plausible-variables.sample.env

volumes:
  db-data:
    driver: local
  event-data:
	  driver: local`);
	
	
	//act
	const volumeFilePaths = getVolumeFilePaths(composeFile);

  //assert
  expect(volumeFilePaths.length).toBe(0);
});