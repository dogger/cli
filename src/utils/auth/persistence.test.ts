jest.mock('../paths');
jest.mock('fs');
jest.mock('path');

import { cleanMocked } from "../tests";

import fs from 'fs';
import * as paths from '../paths';

import * as sut from './persistence';

test('getPersistedRefreshToken_fileDoesNotExist_returnsNull', async () => {
    //arrange
    const fakeReadFileSync = cleanMocked(fs.readFileSync);
    
    const fakeExistsSync = cleanMocked(fs.existsSync);
    fakeExistsSync.mockReturnValue(false);

	//act
	var token = await sut.getPersistedRefreshToken();

	//assert
	expect(fakeReadFileSync.mock.calls.length).toBe(0);
	expect(token).toBeNull();
});

test('getPersistedRefreshToken_fileExists_returnsFileContents', async () => {
    //arrange
    const fakeReadFileSync = cleanMocked(fs.readFileSync);
    fakeReadFileSync.mockReturnValue("some-refresh-token");
    
    const fakeExistsSync = cleanMocked(fs.existsSync);
    fakeExistsSync.mockReturnValue(true);

	//act
	var token = await sut.getPersistedRefreshToken();

	//assert
	expect(fakeReadFileSync.mock.calls.length).toBe(1);
	expect(token).toBe("some-refresh-token");
});