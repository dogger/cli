import { cleanMocked } from "../tests";

jest.mock('./tokens');
import * as tokens from './tokens';

import * as sut from './middleware';

test('withCredentials_noConditionalProvidedAndNoPersistedRefreshTokenExists_invokesCallbackWithArgsAndTokenFromArgs', async () => {
    //arrange
    let calledArgs: any;
    let calledToken: string|null = null;

	//act
    const handler = sut.withCredentials(async (args, token) => {
        calledArgs = args;
        calledToken = token;
    });
    await handler({
        doggerToken: "some-token"
    });

	//assert
	expect(calledArgs.doggerToken).toBe("some-token");
    expect(calledToken).toBe("some-token");
});

test('withCredentials_noConditionalProvidedAndPersistedRefreshTokenExists_invokesCallbackWithArgsAndFreshAccessToken', async () => {
    //arrange
    const fakeRefreshAccessToken = cleanMocked(tokens.refreshAccessToken);
    fakeRefreshAccessToken.mockResolvedValue("some-token");

    let calledArgs: any;
    let calledToken: string|null = null;

	//act
    const handler = sut.withCredentials(async (args, token) => {
        calledArgs = args;
        calledToken = token;
    });
    await handler("some-args");

	//assert
	expect(calledArgs).toBe("some-args");
    expect(calledToken).toBe("some-token");
    
	expect(fakeRefreshAccessToken.mock.calls.length).toBe(1);
});

test('withCredentials_noConditionalProvidedAndNoPersistedRefreshTokenExists_invokesCallbackWithArgsAndNewlyAcquiredAccessToken', async () => {
    //arrange
    const fakeRefreshAccessToken = cleanMocked(tokens.refreshAccessToken);
    fakeRefreshAccessToken.mockResolvedValue("");

    const fakeAcquireNewTokens = cleanMocked(tokens.acquireNewTokens);
    fakeAcquireNewTokens.mockResolvedValue({
        access_token: "some-token",
        refresh_token: "dummy"
    });

    let calledArgs: any;
    let calledToken: string|null = null;

	//act
    const handler = sut.withCredentials(async (args, token) => {
        calledArgs = args;
        calledToken = token;
    });
    await handler("some-args");

	//assert
	expect(calledArgs).toBe("some-args");
    expect(calledToken).toBe("some-token");
    
	expect(fakeAcquireNewTokens.mock.calls.length).toBe(1);
});

test('withCredentials_noConditionalProvidedAndNoPersistedRefreshTokenExistsAndNoTokenAcquired_doesNotInvokeCallback', async () => {
    //arrange
    const fakeRefreshAccessToken = cleanMocked(tokens.refreshAccessToken);
    fakeRefreshAccessToken.mockResolvedValue("");

    const fakeAcquireNewTokens = cleanMocked(tokens.acquireNewTokens);
    fakeAcquireNewTokens.mockResolvedValue({
        access_token: "",
        refresh_token: "dummy"
    });

    let calledArgs: any;
    let calledToken: string|null = null;

	//act
    const handler = sut.withCredentials(async (args, token) => {
        calledArgs = args;
        calledToken = token;
    });
    await handler("some-args");

	//assert
	expect(calledArgs).toBeFalsy();
    expect(calledToken).toBeFalsy();
    
	expect(fakeAcquireNewTokens.mock.calls.length).toBe(1);
});

test('withCredentials_falsyConditionalProvided_invokesCallbackWithPotentiallyExistingAccessToken', async () => {
    //arrange
    const fakeRefreshAccessToken = cleanMocked(tokens.refreshAccessToken);
    fakeRefreshAccessToken.mockResolvedValue("some-token");

    let calledArgs: any;
    let calledToken: string|null = null;
    let didCallWhen: boolean = false;

	//act
    const handler = sut.withCredentials(
        async (args, token) => {
            calledArgs = args;
            calledToken = token;
        },
        args => {
            didCallWhen = true;
            return args !== "some-args";
        });
    await handler("some-args");

	//assert
	expect(calledArgs).toBe("some-args");
    expect(calledToken).toBe("some-token");
    expect(didCallWhen).toBe(true);
    
	expect(fakeRefreshAccessToken.mock.calls.length).toBe(1);
});