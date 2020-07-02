jest.mock('fs');
jest.mock('./http');

import fs from 'fs';
import * as http from './http';

import { mocked } from 'ts-jest/utils';

import * as sut from './auth';

beforeEach(() => sut.resetGlobalState());

test('getToken_statelessIsFalse_tokenIsWrittenToFile', async () => {
	//arrange
	const fakeReadFileSync = mocked(fs.readFileSync);
	fakeReadFileSync.mockReturnValue('some-refresh-token');

	const fakeExistsSync = mocked(fs.existsSync);
	fakeExistsSync.mockReturnValue(true);

	const fakePostForm = mocked(http.postForm);
	fakePostForm.mockImplementation(async (_, form) => 
		form.get('refresh_token') === "some-refresh-token" &&
		{
			access_token: "some-access-token"
		});

	//act
	var token = await sut.getToken();

	//assert
	expect(fakeReadFileSync.mock.calls.length).toBe(1);

	var token = await sut.getToken();
	expect(token).not.toBeNull();
	expect(token).toBe("some-access-token");
});