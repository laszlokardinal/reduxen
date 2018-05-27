import parseUrl from "./parseUrl.js";

describe("parseUrl()", () => {
  [
    {
      input: "/",
      output: { path: "/" }
    },
    {
      input: "/path",
      output: { path: "/path" }
    },
    {
      input: "/path/nested",
      output: { path: "/path/nested" }
    },
    {
      input: "/path/nested/",
      output: { path: "/path/nested" }
    },
    {
      input: "/path/nested?asd=7",
      output: { path: "/path/nested", query: { asd: "7" } }
    },
    {
      input: "/path/nested#qwe",
      output: { path: "/path/nested", hash: "qwe" }
    },
    {
      input: "/path/nested?asd=7#qwe",
      output: { path: "/path/nested", query: { asd: "7" }, hash: "qwe" }
    },
    {
      input: "?asd=7",
      output: { query: { asd: "7" } }
    },
    {
      input: "#qwe",
      output: { hash: "qwe" }
    },
    {
      input: "?asd=7#qwe",
      output: { query: { asd: "7" }, hash: "qwe" }
    }
  ].forEach(({ input, output }) =>
    it(`returns ${JSON.stringify(output)} on "${input}" argument`, () => {
      expect(parseUrl(input)).to.deep.equal(output);
    })
  );
});
