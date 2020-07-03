import { globalState } from "./globals";
jest.mock('../http');

import * as http from '../http';

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