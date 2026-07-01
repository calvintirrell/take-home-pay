import '@testing-library/jest-dom'

// jsdom lacks ResizeObserver, which Recharts' ResponsiveContainer relies on.
// A no-op stub keeps chart-containing components from crashing under test.
if (!('ResizeObserver' in globalThis)) {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver
}

// jsdom reports zero layout size, so Recharts' ResponsiveContainer logs a benign
// "width(0) and height(0)" warning. Filter only that exact message to keep test
// output clean; everything else passes through.
const originalWarn = console.warn
console.warn = (...args: unknown[]) => {
  if (typeof args[0] === 'string' && args[0].includes('should be greater than 0')) return
  originalWarn(...(args as []))
}
