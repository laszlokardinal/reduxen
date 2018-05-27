import stringifyQuery from "./stringifyQuery.js";

describe("stringifyQuery()", () => {
  [
    {
      input: { a: "b" },
      output: ["a=b"]
    },
    {
      input: { a: "b", c: "100" },
      output: ["a=b&c=100", "c=100&a=b"]
    }
  ].forEach(({ input, output }) => {
    const inputString = JSON.stringify(input);
    const outputString = JSON.stringify(output);

    it(`returns one of ${outputString} on ${inputString} argument`, () => {
      expect(output).to.include(stringifyQuery(input));
    });
  });
});
