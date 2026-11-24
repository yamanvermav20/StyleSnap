// React flushes updates made inside act() only when the test renderer opts in.
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
