import { globalState } from "./globals";
import { cleanMocked } from "../tests";

afterEach(() => globalState.reset());

test('refreshAccessToken_isStateless_returnsNull', async () => {
    //arrange
    globalState.setIsStateless(true);

    const fakeReadFileSync = cleanMocked(fs.readFileSync);
    
    const fakeExistsSync = cleanMocked(fs.existsSync);
    fakeExistsSync.mockReturnValue(false);

	//act
	var token = await sut.getPersistedRefreshToken();

	//assert
	expect(fakeReadFileSync.mock.calls.length).toBe(0);
	expect(token).toBeNull();
});