import { cleanMocked } from "../tests";

jest.mock('path');

jest.mock('fs');
import fs from 'fs';

jest.mock('../paths');
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

test('persistRefreshToken_tokenProvided_writesTokenContentsToFile', async () => {
    //arrange
    const fakeWriteFileSync = cleanMocked(fs.writeFileSync);

	//act
	await sut.persistRefreshToken("some-refresh-token");

	//assert
	expect(fakeWriteFileSync.mock.calls.length).toBe(1);
	expect(fakeWriteFileSync.mock.calls[0][1]).toBe("some-refresh-token");
});