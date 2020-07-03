import { mocked } from "ts-jest/utils";
import { MaybeMocked } from "ts-jest/dist/util/testing";

export function cleanMocked<T extends (...args: any[]) => any>(item: T, deep?: false): MaybeMocked<T> {
    const mock = mocked(item, deep);
    mock.mockClear();
    
    return mock;
}