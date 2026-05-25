import { describe, expect, it } from 'vitest';

// Throwaway test to verify the CI merge gate: a PR carrying this file must
// turn the Test workflow red and block merge into main. Delete this branch
// (and never merge it) once the red run is observed.
describe('synthetic CI failure', () => {
  it('intentionally fails to prove the PR merge gate blocks a red build', () => {
    expect(1).toBe(2);
  });
});
