import parseQuery from "./parseQuery.js";

describe("parseQuery()", () => {
  [
    { input: "a=b", output: { a: "b" } },
    { input: "a=b&c=100", output: { a: "b", c: "100" } }
  ].forEach(({ input, output }) =>
    it(`returns ${JSON.stringify(output)} on "${input}" argument`, () => {
      expect(parseQuery(input)).to.deep.equal(output);
    })
  );
});
