import { globalState, getClientId } from './globals';

jest.mock('./persistence');
import * as persistence from './persistence';

import { cleanMocked } from '../tests';

afterEach(() => globalState.reset());

test('setIsStateless_isTrue_clearsPersistedToken', async () => {
	//arrange
	const fakePersistRefreshToken = cleanMocked(persistence.persistRefreshToken);
	
	//act
	globalState.setIsStateless(true);

    //assert
	expect(fakePersistRefreshToken.mock.calls.length).toBe(1);
});

test('setIsStateless_isFalse_doesNotClearPersistedToken', async () => {
	//arrange
	const fakePersistRefreshToken = cleanMocked(persistence.persistRefreshToken);
	
	//act
	globalState.setIsStateless(false);

    //assert
	expect(fakePersistRefreshToken.mock.calls.length).toBe(0);
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