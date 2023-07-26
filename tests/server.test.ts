import { startGameBetWrapper, playerChoice } from '../src/index';

describe('testing SC deployment', () => {
  test('startGameBetWrapper should work', async () => {
    const fn = jest.fn(await startGameBetWrapper("0x927DBCFc80f7Bae8f9D0Db608EA5f628737A0511", "0x7b452A989E57681699a1CC520E23572a423EEEF6", 1, 1));
    expect(fn).toBeTruthy();
  });
  test('startGameBetWrapper should not throw errors', async () => {
    const ret = await startGameBetWrapper("0x927DBCFc80f7Bae8f9D0Db608EA5f628737A0511", "0x7b452A989E57681699a1CC520E23572a423EEEF6", 1, 1);
    const fn = jest.fn(await playerChoice(ret, 1, 1));
    expect(fn).toBeTruthy();
  });
});