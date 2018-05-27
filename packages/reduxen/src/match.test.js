import match from "./match.js";

describe("match()", () => {
  describe("returns parameter object", () => {
    [
      { pattern: "/", path: "/", expectedReturn: {} },
      { pattern: "/page", path: "/page", expectedReturn: {} },
      { pattern: "/page/?", path: "/page/192", expectedReturn: {} },
      {
        pattern: "/page/?/item/?",
        path: "/page/192/item/256",
        expectedReturn: {}
      },
      {
        pattern: "/users/:userId",
        path: "/users/7",
        expectedReturn: { userId: "7" }
      },
      {
        pattern: "/posts/:postId/comments/:commentId",
        path: "/posts/7/comments/19",
        expectedReturn: { postId: "7", commentId: "19" }
      },
      {
        pattern: "/users/:userId/(posts)",
        path: "/users/17/posts",
        expectedReturn: { userId: "17" }
      },
      {
        pattern: "/users/:userId/(posts|about)",
        path: "/users/17/posts",
        expectedReturn: { userId: "17" }
      },
      {
        pattern: "/users/:userId/(posts|about)",
        path: "/users/17/about",
        expectedReturn: { userId: "17" }
      },
      {
        pattern: "/users/:userId/:tab(posts)",
        path: "/users/17/posts",
        expectedReturn: { userId: "17", tab: "posts" }
      },
      {
        pattern: "/users/:userId/:tab(posts|about)",
        path: "/users/17/posts",
        expectedReturn: { userId: "17", tab: "posts" }
      },
      {
        pattern: "/users/:userId/:tab(posts|about)",
        path: "/users/17/about",
        expectedReturn: { userId: "17", tab: "about" }
      },
      {
        pattern: "/posts/*",
        path: "/posts/7",
        expectedReturn: {}
      },
      {
        pattern: "/posts/*",
        path: "/posts/7/comments/19",
        expectedReturn: {}
      },
      {
        pattern: "/posts/:postId/*",
        path: "/posts/7/comments/19",
        expectedReturn: { postId: "7" }
      }
    ].forEach(({ pattern, path, expectedReturn }) =>
      describe(`with '${pattern}' pattern and '${path}' path`, () => {
        it("with path as string argument", () => {
          expect(match(pattern, path)).to.deep.equal(expectedReturn);
        });

        it("with path as string curried", () => {
          expect(match(pattern)(path)).to.deep.equal(expectedReturn);
        });
      })
    );
  });

  describe("returns null", () => {
    [
      { pattern: "/", path: "" },
      { pattern: "/", path: "/users" },
      { pattern: "/", path: "/users/7" },
      { pattern: "/", path: "/users/7/posts" },
      { pattern: "/", path: "/users/7/posts/23" },
      { pattern: "/users", path: "/" },
      { pattern: "/users", path: "/users/7" },
      { pattern: "/users", path: "/users/7/posts" },
      { pattern: "/users", path: "/users/7/posts/23" },
      { pattern: "/users/:userId", path: "/" },
      { pattern: "/users/:userId", path: "/users" },
      { pattern: "/users/:userId", path: "/users/7/posts" },
      { pattern: "/users/:userId", path: "/users/7/posts/23" },
      { pattern: "/users/:userId/posts", path: "/" },
      { pattern: "/users/:userId/posts", path: "/users" },
      { pattern: "/users/:userId/posts", path: "/users/7" },
      { pattern: "/users/:userId/posts", path: "/users/7/posts/23" },
      { pattern: "/users/:userId/posts/:postId", path: "/" },
      { pattern: "/users/:userId/posts/:postId", path: "/users" },
      { pattern: "/users/:userId/posts/:postId", path: "/users/7" },
      { pattern: "/users/:userId/posts/:postId", path: "/users/7/posts" },
      { pattern: "/page/?", path: "/page" },
      { pattern: "/page/?", path: "/page/192/item" },
      { pattern: "/page/?/item/?", path: "/page/192/item" },
      { pattern: "/page/?/item/?", path: "/page/192/item/256/comment" },
      {
        pattern: "/users/:id/(posts|about)",
        path: "/users/17/no-match"
      },
      {
        pattern: "/users/:id/:tab(posts|about)",
        path: "/users/17/no-match"
      },
      {
        pattern: "/users/:id/(posts|about)",
        path: "/users/:id/(posts|about)"
      },
      {
        pattern: "/users/:id/:tab(posts|about)",
        path: "/users/:id/:tab(posts|about)"
      },
      { pattern: "/a/b/c/d", path: "/a/b/x/y" },
      { pattern: "/posts/*", path: "/posts" },
      { pattern: "/posts/*", path: "/users" },
      { pattern: "/posts/*", path: "/users/17" },
      { pattern: "/posts/*", path: "/users/17/about" },
      { pattern: "/posts/:id/comments/*", path: "/posts/19/comments" },
      { pattern: "/posts/:id/comments/*", path: "/posts/19/reactions/17" },
      { pattern: "/posts/:id/comments/*", path: "/posts/19/author/17/about" }
    ].forEach(({ pattern, path }) =>
      describe(`with '${pattern}' pattern and '${path}' path`, () => {
        it("with path as string argument", () => {
          expect(match(pattern, path)).to.be.null;
        });

        it("with path as string curried", () => {
          expect(match(pattern)(path)).to.be.null;
        });
      })
    );
  });
});
