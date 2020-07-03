import { globalState, getClientId } from './globals';
jest.mock('fs');
import fs from 'fs';

import { cleanMocked } from '../tests';

afterEach(() => globalState.reset());

test('setIsStateless_isTrue_clearsPersistedToken', async () => {
	//arrange
	const fakeWriteFileSync = cleanMocked(fs.writeFileSync);
	
	//act
	globalState.setIsStateless(true);

    //assert
	expect(fakeWriteFileSync.mock.calls.length).toBe(1);
	expect(fakeWriteFileSync.mock.calls[0][1]).toBe('');
});

test('setIsStateless_isFalse_doesNotClearPersistedToken', async () => {
	//arrange
	const fakeWriteFileSync = cleanMocked(fs.writeFileSync);
	
	//act
	globalState.setIsStateless(false);

    //assert
	expect(fakeWriteFileSync.mock.calls.length).toBe(0);
});

test('getIsStateless_isTrue_returnsTrue', async () => {
	//arrange
	globalState.setIsStateless(true);
	
    //act
    const isStateless = globalState.isStateless;

    //assert
	expect(isStateless).toBeTruthy();
});

test('getAccessToken_accessTokenIsSet_returnsAccessToken', async () => {
	//arrange
	globalState.accessToken = "some-access-token";
	
    //act
    const accessToken = globalState.accessToken;

    //assert
	expect(accessToken).toBe("some-access-token");
});

test('getClientId_none_returnsClientId', async () => {
	//act
	const clientId = getClientId();

    //assert
	expect(clientId).not.toBeNull();
});