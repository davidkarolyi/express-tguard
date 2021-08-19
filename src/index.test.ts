import { greet } from "./index";

describe("greet", () => {
  it("prints hello", () => {
    expect(greet()).toBe("hello");
  });
});
