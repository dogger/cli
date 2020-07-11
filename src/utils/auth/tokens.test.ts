import { globalState } from "./globals";

jest.mock('../http');
import * as http from '../http';

jest.mock('../console');
import * as console from '../console';

jest.mock('./persistence');
import * as persistence from './persistence';

import { cleanMocked } from "../tests";

import * as sut from './tokens';

afterEach(() => globalState.reset());

test('refreshAccessToken_isStateless_returnsNull', async () => {
    //arrange
    const fakePostForm = cleanMocked(http.postForm);

    globalState.setIsStateless(true);

	//act
	var token = await sut.refreshAccessToken();

	//assert
	expect(fakePostForm.mock.calls.length).toBe(0);
	expect(token).toBeNull();
});

test('refreshAccessToken_existingAccessTokenPresent_returnsExistingAccessToken', async () => {
    //arrange
    const fakePostForm = cleanMocked(http.postForm);

    globalState.setIsStateless(false);
    globalState.accessToken = "some-access-token";

	//act
	var token = await sut.refreshAccessToken();

	//assert
	expect(fakePostForm.mock.calls.length).toBe(0);
	expect(token).toBe("some-access-token");
});

test('refreshAccessToken_noRefreshTokenPresent_returnsNull', async () => {
    //arrange
    const fakePostForm = cleanMocked(http.postForm);

    globalState.setIsStateless(false);
    globalState.accessToken = null;

	//act
	var token = await sut.refreshAccessToken();

	//assert
	expect(fakePostForm.mock.calls.length).toBe(0);
	expect(token).toBeNull();
});

test('refreshAccessToken_refreshTokenPresent_returnsAccessTokenFromAuth0Response', async () => {
    //arrange
    const fakePostForm = cleanMocked(http.postForm);
    fakePostForm.mockReturnValue(Promise.resolve({
        access_token: "some-access-token"
    }));

    globalState.setIsStateless(false);
    globalState.accessToken = null;

	//act
	var token = await sut.refreshAccessToken("some-refresh-token");

	//assert
    expect(fakePostForm.mock.calls.length).toBe(1);
    
    const formArgument = fakePostForm.mock.calls[0][1] as URLSearchParams;
    expect(formArgument.get("refresh_token")).toBe("some-refresh-token");

	expect(token).toBe("some-access-token");
});

test('acquireNewTokens_emailNotPresent_persistsAcquiredAccessToken', async () => {
    //arrange
    const fakePostJson = cleanMocked(http.postJson);
    fakePostJson.mockResolvedValue({
        access_token: "some-access-token",
        refresh_token: "some-refresh-token"
    });

    const fakePersistRefreshToken = cleanMocked(persistence.persistRefreshToken);

    const fakeAsk = cleanMocked(console.ask);
    fakeAsk.mockResolvedValueOnce("some-email");
    fakeAsk.mockResolvedValueOnce("some-one-time-code");

	//act
	var response = await sut.acquireNewTokens();

	//assert
    expect(fakePostJson.mock.calls.length).toBe(2);
    
    const bodyArgument = fakePostJson.mock.calls[1][1] as any;
    expect(bodyArgument.username).toBe("some-email");

    expect(fakePersistRefreshToken.mock.calls[0][0]).toBe("some-refresh-token");

    expect(response.access_token).toBe("some-access-token");
    expect(response.refresh_token).toBe("some-refresh-token");
});

test('acquireNewTokens_emailPresent_persistsAcquiredAccessToken', async () => {
    //arrange
    const fakePostJson = cleanMocked(http.postJson);
    fakePostJson.mockResolvedValue({
        access_token: "some-access-token",
        refresh_token: "some-refresh-token"
    });

    const fakePersistRefreshToken = cleanMocked(persistence.persistRefreshToken);

    const fakeAsk = cleanMocked(console.ask);
    fakeAsk.mockResolvedValueOnce("some-one-time-code");

	//act
	var response = await sut.acquireNewTokens("some-email");

	//assert
    expect(fakePostJson.mock.calls.length).toBe(2);
    
    const bodyArgument = fakePostJson.mock.calls[1][1] as any;
    expect(bodyArgument.username).toBe("some-email");

    expect(fakePersistRefreshToken.mock.calls[0][0]).toBe("some-refresh-token");

    expect(response.access_token).toBe("some-access-token");
    expect(response.refresh_token).toBe("some-refresh-token");
});