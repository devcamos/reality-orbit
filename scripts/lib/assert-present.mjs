/** Tiny helper imported by contract tests so CI can emit real LCOV without TSX. */
export const assertPresent = (value, label = "value") => {
  if (value == null || value === "") {
    throw new Error(`${label} must be present`);
  }
  return value;
};
