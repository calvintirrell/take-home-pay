import { describe, it, expect } from 'vitest'

// Phase 0 smoke test — confirms the Vitest harness runs.
// Replaced by the real engine golden tests in Phase 1.
describe('toolchain smoke test', () => {
  it('runs vitest', () => {
    expect(1 + 1).toBe(2)
  })
})
