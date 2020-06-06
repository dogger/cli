import command from '../../../src/main';

import test from 'ava';

test('dogger plan ls: can fetch plans', async t => {
    var output = '';
    await command("dogger plan ls", {
        stdout: (text) => {
            output += text;
        }
    });
    console.log(output);
    t.notDeepEqual(output.length, 0);
});