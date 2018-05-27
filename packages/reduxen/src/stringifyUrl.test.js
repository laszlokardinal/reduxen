import stringifyUrl from "./stringifyUrl.js";

describe("stringifyUrl()", () => {
  [
    {
      input: { path: "/", query: {}, hash: "" },
      output: "/"
    },
    {
      input: { path: "/path/nested", query: {}, hash: "" },
      output: "/path/nested"
    },
    {
      input: { path: "/path/nested/", query: {}, hash: "" },
      output: "/path/nested"
    },
    {
      input: { path: "/", query: { asd: "7" }, hash: "" },
      output: "/?asd=7"
    },
    {
      input: { path: "/path/nested", query: { asd: "7" }, hash: "" },
      output: "/path/nested?asd=7"
    },

    {
      input: { path: "/", query: {}, hash: "qwe" },
      output: "/#qwe"
    },
    {
      input: { path: "/path/nested", query: {}, hash: "qwe" },
      output: "/path/nested#qwe"
    },
    {
      input: { path: "/path/nested/", query: {}, hash: "qwe" },
      output: "/path/nested#qwe"
    },
    {
      input: { path: "/", query: { asd: "7" }, hash: "qwe" },
      output: "/?asd=7#qwe"
    },
    {
      input: { path: "/path/nested", query: { asd: "7" }, hash: "qwe" },
      output: "/path/nested?asd=7#qwe"
    },

    {
      input: { path: "/path/nested" },
      output: "/path/nested"
    },
    {
      input: { path: "/path/nested", query: { asd: "7" } },
      output: "/path/nested?asd=7"
    },
    {
      input: { path: "/path/nested", hash: "qwe" },
      output: "/path/nested#qwe"
    },
    {
      input: { query: { asd: "7" } },
      output: "?asd=7"
    },
    {
      input: { hash: "qwe" },
      output: "#qwe"
    },
    {
      input: { query: { asd: "7" }, hash: "qwe" },
      output: "?asd=7#qwe"
    }
  ].forEach(({ input, output }) => {
    it(`returns ${output} to ${JSON.stringify(input)} argument`, () => {
      expect(stringifyUrl(input)).to.equal(output);
    });
  });
});
