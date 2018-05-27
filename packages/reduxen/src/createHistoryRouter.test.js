import createHistoryRouter from "./createHistoryRouter.js";

describe("createHistoryRouter", () => {
  describe("reducer", () => {
    describe("without state", () => {
      it("returns the initial state", () => {
        const { reducer } = createHistoryRouter({ prefix: "TEST__" });

        expect(reducer(undefined, { type: "UNKNOWN_ACTION" })).to.deep.equal({
          path: "",
          query: {},
          hash: ""
        });
      });
    });

    describe("on unknown action", () => {
      it("returns the same state", () => {
        const { reducer } = createHistoryRouter({ prefix: "TEST__" });
        const state = {};

        expect(reducer(state, { type: "UNKNOWN_ACTION" })).to.equal(state);
      });
    });

    describe("on 'ENTERED'", () => {
      it("returns the payload's fields", () => {
        const { reducer } = createHistoryRouter({ prefix: "TEST__" });

        expect(
          reducer(
            {
              path: "/users",
              query: { sortBy: "createdAt" },
              hash: "17"
            },
            {
              type: "TEST__ENTERED",
              payload: {
                path: "/posts",
                query: { sortBy: "name" },
                hash: "18",
                otherField: "value"
              }
            }
          )
        ).to.deep.equal({
          path: "/posts",
          query: { sortBy: "name" },
          hash: "18"
        });
      });
    });
  });

  describe("middleware", () => {
    describe("on unknown action", () => {
      it("returns next(action)", () => {
        const opts = {};
        const dispatch = () => null;
        const getState = () => null;
        const next = (action) => ({ RETURNED_BY_NEXT: action });
        const action = { type: "UNKNOWN_ACTION" };

        const { middleware } = createHistoryRouter(opts);

        expect(middleware({ dispatch, getState })(next)(action)).to.deep.equal({
          RETURNED_BY_NEXT: { type: "UNKNOWN_ACTION" }
        });
      });
    });

    describe("on popstate event", () => {
      it("dispatches 'LEFT' & 'ENTERED'", () => {
        const opts = { prefix: "TEST__" };
        const dispatch = sinon.spy();
        const getState = () => ({
          router: {
            path: "/users",
            query: { sortBy: "createdAt" },
            hash: "17"
          }
        });

        const originalWindow = global.window;

        global.window = {
          addEventListener: sinon.spy(),
          location: {
            pathname: "/posts",
            search: "?sortBy=name",
            hash: "#23"
          }
        };

        try {
          const { middleware } = createHistoryRouter(opts);

          middleware({ dispatch, getState });

          const eventHandler = global.window.addEventListener.args.find(
            (call) => call[0] === "popstate"
          )[1];

          expect(eventHandler).to.be.a("function");
          expect(dispatch.callCount).to.equal(0);

          eventHandler();

          expect(dispatch.args).to.deep.equal([
            [
              {
                type: "TEST__LEFT",
                payload: {
                  path: "/users",
                  query: { sortBy: "createdAt" },
                  hash: "17",
                  to: {
                    path: "/posts",
                    query: { sortBy: "name" },
                    hash: "23"
                  }
                }
              }
            ],
            [
              {
                type: "TEST__ENTERED",
                payload: {
                  path: "/posts",
                  query: { sortBy: "name" },
                  hash: "23",
                  from: {
                    path: "/users",
                    query: { sortBy: "createdAt" },
                    hash: "17"
                  }
                }
              }
            ]
          ]);
        } finally {
          global.window = originalWindow;
        }
      });
    });

    describe("after initialization", () => {
      describe("if path presents in the state", (done) => {
        it("does not dispatch anything", () => {
          const opts = { prefix: "TEST__" };
          const dispatch = () => done("dispatch called");
          const getState = () => ({
            router: {
              path: "/users",
              query: { sortBy: "name" },
              hash: "17"
            }
          });

          const { middleware } = createHistoryRouter(opts);

          middleware({ dispatch, getState });

          setTimeout(() => done(), 1000);
        });
      });

      describe("if initialUrl option presents", () => {
        it("dispatches 'ENTERED' with initialUrl as payload", (done) => {
          const opts = {
            prefix: "TEST__",
            initialUrl: "/posts?sortBy=name#23"
          };
          const dispatch = (action) => {
            try {
              expect(action).to.deep.equal({
                type: "TEST__ENTERED",
                payload: {
                  path: "/posts",
                  query: { sortBy: "name" },
                  hash: "23",
                  from: { path: "", query: {}, hash: "" }
                }
              });

              done();
            } catch (e) {
              done(e);
            }
          };
          const getState = () => ({
            router: {
              path: "",
              query: {},
              hash: ""
            }
          });

          const { middleware } = createHistoryRouter(opts);

          middleware({ dispatch, getState });
        });
      });

      describe("if initialUrl option does not present", () => {
        it("dispatches 'ENTERED' with window.location as payload", (done) => {
          const originalWindow = global.window;

          const opts = { prefix: "TEST__" };
          const dispatch = (action) => {
            try {
              expect(action).to.deep.equal({
                type: "TEST__ENTERED",
                payload: {
                  path: "/posts",
                  query: { sortBy: "name" },
                  hash: "23",
                  from: { path: "", query: {}, hash: "" }
                }
              });

              done();
            } catch (e) {
              done(e);
            } finally {
              global.window = originalWindow;
            }
          };
          const getState = () => ({
            router: {
              path: "",
              query: {},
              hash: ""
            }
          });

          global.window = {
            addEventListener: () => null,
            location: {
              pathname: "/posts",
              search: "?sortBy=name",
              hash: "#23"
            }
          };

          try {
            const { middleware } = createHistoryRouter(opts);

            middleware({ dispatch, getState });
          } finally {
            global.window = originalWindow;
          }
        });
      });
    });

    describe("on 'PUSH'", () => {
      describe("if path presents in the payload", () => {
        it("calls redirectCallback", () => {
          const opts = {
            prefix: "TEST__",
            redirectCallback: sinon.spy()
          };
          const getState = () => ({
            router: {
              path: "/users",
              query: { sortBy: "createdAt" },
              hash: "17"
            }
          });
          const dispatch = () => null;
          const next = () => null;
          const action = {
            type: "TEST__PUSH",
            payload: {
              path: "/groups",
              query: { sortBy: "rating" },
              hash: "92"
            }
          };

          const { middleware } = createHistoryRouter(opts);

          middleware({ getState, dispatch })(next)(action);

          expect(opts.redirectCallback.args).to.deep.equal([
            ["/groups?sortBy=rating#92"]
          ]);
        });

        it("calls history.pushState", () => {
          const opts = { prefix: "TEST__" };
          const getState = () => ({
            router: {
              path: "/users",
              query: { sortBy: "createdAt" },
              hash: "17"
            }
          });
          const dispatch = () => null;
          const next = () => null;
          const action = {
            type: "TEST__PUSH",
            payload: {
              path: "/groups",
              query: { sortBy: "rating" },
              hash: "92"
            }
          };

          const originalWindow = global.window;

          global.window = {
            addEventListener: () => null,
            history: {
              pushState: sinon.spy()
            }
          };

          try {
            const { middleware } = createHistoryRouter(opts);

            middleware({ getState, dispatch })(next)(action);

            expect(global.window.history.pushState.args).to.deep.equal([
              [null, null, "/groups?sortBy=rating#92"]
            ]);
          } finally {
            global.window = originalWindow;
          }
        });

        it("dispatches 'LEFT' & 'ENTERED", () => {
          const opts = { prefix: "TEST__" };
          const getState = () => ({
            router: {
              path: "/users",
              query: { sortBy: "createdAt" },
              hash: "17"
            }
          });
          const dispatch = sinon.spy();
          const next = () => null;
          const action = {
            type: "TEST__PUSH",
            payload: {
              path: "/groups",
              query: { sortBy: "rating" },
              hash: "92"
            }
          };

          const originalWindow = global.window;

          global.window = {
            addEventListener: () => null,
            history: {
              pushState: () => null
            }
          };

          try {
            const { middleware } = createHistoryRouter(opts);

            middleware({ getState, dispatch })(next)(action);

            expect(dispatch.args).to.deep.equal([
              [
                {
                  type: "TEST__LEFT",
                  payload: {
                    path: "/users",
                    query: { sortBy: "createdAt" },
                    hash: "17",
                    to: {
                      path: "/groups",
                      query: { sortBy: "rating" },
                      hash: "92"
                    }
                  }
                }
              ],
              [
                {
                  type: "TEST__ENTERED",
                  payload: {
                    path: "/groups",
                    query: { sortBy: "rating" },
                    hash: "92",
                    from: {
                      path: "/users",
                      query: { sortBy: "createdAt" },
                      hash: "17"
                    }
                  }
                }
              ]
            ]);
          } finally {
            global.window = originalWindow;
          }
        });
      });

      describe("if path does not present in the payload", () => {
        it("calls redirectCallback", () => {
          const opts = {
            prefix: "TEST__",
            redirectCallback: sinon.spy()
          };
          const getState = () => ({
            router: {
              path: "/users",
              query: { sortBy: "createdAt" },
              hash: "17"
            }
          });
          const dispatch = () => null;
          const next = () => null;
          const action = {
            type: "TEST__PUSH",
            payload: {
              query: { sortBy: "rating" },
              hash: "92"
            }
          };

          const { middleware } = createHistoryRouter(opts);

          middleware({ getState, dispatch })(next)(action);

          expect(opts.redirectCallback.args).to.deep.equal([
            ["/users?sortBy=rating#92"]
          ]);
        });

        it("calls history.pushState", () => {
          const opts = { prefix: "TEST__" };
          const getState = () => ({
            router: {
              path: "/users",
              query: { sortBy: "createdAt" },
              hash: "17"
            }
          });
          const dispatch = () => null;
          const next = () => null;
          const action = {
            type: "TEST__PUSH",
            payload: {
              query: { sortBy: "rating" },
              hash: "92"
            }
          };

          const originalWindow = global.window;

          global.window = {
            addEventListener: () => null,
            history: {
              pushState: sinon.spy()
            }
          };

          try {
            const { middleware } = createHistoryRouter(opts);

            middleware({ getState, dispatch })(next)(action);

            expect(global.window.history.pushState.args).to.deep.equal([
              [null, null, "/users?sortBy=rating#92"]
            ]);
          } finally {
            global.window = originalWindow;
          }
        });

        it("dispatches 'LEFT' & 'ENTERED", () => {
          const opts = { prefix: "TEST__" };
          const getState = () => ({
            router: {
              path: "/users",
              query: { sortBy: "createdAt" },
              hash: "17"
            }
          });
          const dispatch = sinon.spy();
          const next = () => null;
          const action = {
            type: "TEST__PUSH",
            payload: {
              query: { sortBy: "rating" },
              hash: "92"
            }
          };

          const originalWindow = global.window;

          global.window = {
            addEventListener: () => null,
            history: {
              pushState: () => null
            }
          };

          try {
            const { middleware } = createHistoryRouter(opts);

            middleware({ getState, dispatch })(next)(action);

            expect(dispatch.args).to.deep.equal([
              [
                {
                  type: "TEST__LEFT",
                  payload: {
                    path: "/users",
                    query: { sortBy: "createdAt" },
                    hash: "17",
                    to: {
                      path: "/users",
                      query: { sortBy: "rating" },
                      hash: "92"
                    }
                  }
                }
              ],
              [
                {
                  type: "TEST__ENTERED",
                  payload: {
                    path: "/users",
                    query: { sortBy: "rating" },
                    hash: "92",
                    from: {
                      path: "/users",
                      query: { sortBy: "createdAt" },
                      hash: "17"
                    }
                  }
                }
              ]
            ]);
          } finally {
            global.window = originalWindow;
          }
        });
      });

      describe("if neither path nor query presents in the payload", () => {
        it("calls redirectCallback", () => {
          const opts = {
            prefix: "TEST__",
            redirectCallback: sinon.spy()
          };
          const getState = () => ({
            router: {
              path: "/users",
              query: { sortBy: "createdAt" },
              hash: "17"
            }
          });
          const dispatch = () => null;
          const next = () => null;
          const action = {
            type: "TEST__PUSH",
            payload: {
              hash: "92"
            }
          };

          const { middleware } = createHistoryRouter(opts);

          middleware({ getState, dispatch })(next)(action);

          expect(opts.redirectCallback.args).to.deep.equal([
            ["/users?sortBy=createdAt#92"]
          ]);
        });

        it("calls history.pushState", () => {
          const opts = { prefix: "TEST__" };
          const getState = () => ({
            router: {
              path: "/users",
              query: { sortBy: "createdAt" },
              hash: "17"
            }
          });
          const dispatch = sinon.spy();
          const next = () => null;
          const action = {
            type: "TEST__PUSH",
            payload: {
              hash: "92"
            }
          };

          const originalWindow = global.window;

          global.window = {
            addEventListener: () => null,
            history: {
              pushState: sinon.spy()
            }
          };

          try {
            const { middleware } = createHistoryRouter(opts);

            middleware({ getState, dispatch })(next)(action);

            expect(global.window.history.pushState.args).to.deep.equal([
              [null, null, "/users?sortBy=createdAt#92"]
            ]);
          } finally {
            global.window = originalWindow;
          }
        });

        it("dispatches 'LEFT' & 'ENTERED", () => {
          const opts = { prefix: "TEST__" };
          const getState = () => ({
            router: {
              path: "/users",
              query: { sortBy: "createdAt" },
              hash: "17"
            }
          });
          const dispatch = sinon.spy();
          const next = () => null;
          const action = {
            type: "TEST__PUSH",
            payload: {
              hash: "92"
            }
          };

          const originalWindow = global.window;

          global.window = {
            addEventListener: () => null,
            history: {
              pushState: () => null
            }
          };

          try {
            const { middleware } = createHistoryRouter(opts);

            middleware({ getState, dispatch })(next)(action);

            expect(dispatch.args).to.deep.equal([
              [
                {
                  type: "TEST__LEFT",
                  payload: {
                    path: "/users",
                    query: { sortBy: "createdAt" },
                    hash: "17",
                    to: {
                      path: "/users",
                      query: { sortBy: "createdAt" },
                      hash: "92"
                    }
                  }
                }
              ],
              [
                {
                  type: "TEST__ENTERED",
                  payload: {
                    path: "/users",
                    query: { sortBy: "createdAt" },
                    hash: "92",
                    from: {
                      path: "/users",
                      query: { sortBy: "createdAt" },
                      hash: "17"
                    }
                  }
                }
              ]
            ]);
          } finally {
            global.window = originalWindow;
          }
        });
      });
    });

    describe("on 'REPLACE'", () => {
      describe("if path presents in the payload", () => {
        it("calls redirectCallback", () => {
          const opts = {
            prefix: "TEST__",
            redirectCallback: sinon.spy()
          };
          const getState = () => ({
            router: {
              path: "/users",
              query: { sortBy: "createdAt" },
              hash: "17"
            }
          });
          const dispatch = () => null;
          const next = () => null;
          const action = {
            type: "TEST__REPLACE",
            payload: {
              path: "/groups",
              query: { sortBy: "rating" },
              hash: "92"
            }
          };

          const { middleware } = createHistoryRouter(opts);

          middleware({ getState, dispatch })(next)(action);

          expect(opts.redirectCallback.args).to.deep.equal([
            ["/groups?sortBy=rating#92"]
          ]);
        });

        it("calls history.replaceState", () => {
          const opts = { prefix: "TEST__" };
          const getState = () => ({
            router: {
              path: "/users",
              query: { sortBy: "createdAt" },
              hash: "17"
            }
          });
          const dispatch = () => null;
          const next = () => null;
          const action = {
            type: "TEST__REPLACE",
            payload: {
              path: "/groups",
              query: { sortBy: "rating" },
              hash: "92"
            }
          };

          const originalWindow = global.window;

          global.window = {
            addEventListener: () => null,
            history: {
              replaceState: sinon.spy()
            }
          };

          try {
            const { middleware } = createHistoryRouter(opts);

            middleware({ getState, dispatch })(next)(action);

            expect(global.window.history.replaceState.args).to.deep.equal([
              [null, null, "/groups?sortBy=rating#92"]
            ]);
          } finally {
            global.window = originalWindow;
          }
        });

        it("dispatches 'LEFT' & 'ENTERED", () => {
          const opts = { prefix: "TEST__" };
          const getState = () => ({
            router: {
              path: "/users",
              query: { sortBy: "createdAt" },
              hash: "17"
            }
          });
          const dispatch = sinon.spy();
          const next = () => null;
          const action = {
            type: "TEST__REPLACE",
            payload: {
              path: "/groups",
              query: { sortBy: "rating" },
              hash: "92"
            }
          };

          const originalWindow = global.window;

          global.window = {
            addEventListener: () => null,
            history: {
              replaceState: () => null
            }
          };

          try {
            const { middleware } = createHistoryRouter(opts);

            middleware({ getState, dispatch })(next)(action);

            expect(dispatch.args).to.deep.equal([
              [
                {
                  type: "TEST__LEFT",
                  payload: {
                    path: "/users",
                    query: { sortBy: "createdAt" },
                    hash: "17",
                    to: {
                      path: "/groups",
                      query: { sortBy: "rating" },
                      hash: "92"
                    }
                  }
                }
              ],
              [
                {
                  type: "TEST__ENTERED",
                  payload: {
                    path: "/groups",
                    query: { sortBy: "rating" },
                    hash: "92",
                    from: {
                      path: "/users",
                      query: { sortBy: "createdAt" },
                      hash: "17"
                    }
                  }
                }
              ]
            ]);
          } finally {
            global.window = originalWindow;
          }
        });
      });

      describe("if path does not present in the payload", () => {
        it("calls redirectCallback", () => {
          const opts = {
            prefix: "TEST__",
            redirectCallback: sinon.spy()
          };
          const getState = () => ({
            router: {
              path: "/users",
              query: { sortBy: "createdAt" },
              hash: "17"
            }
          });
          const dispatch = () => null;
          const next = () => null;
          const action = {
            type: "TEST__REPLACE",
            payload: {
              query: { sortBy: "rating" },
              hash: "92"
            }
          };

          const { middleware } = createHistoryRouter(opts);

          middleware({ getState, dispatch })(next)(action);

          expect(opts.redirectCallback.args).to.deep.equal([
            ["/users?sortBy=rating#92"]
          ]);
        });

        it("calls history.replaceState", () => {
          const opts = { prefix: "TEST__" };
          const getState = () => ({
            router: {
              path: "/users",
              query: { sortBy: "createdAt" },
              hash: "17"
            }
          });
          const dispatch = () => null;
          const next = () => null;
          const action = {
            type: "TEST__REPLACE",
            payload: {
              query: { sortBy: "rating" },
              hash: "92"
            }
          };

          const originalWindow = global.window;

          global.window = {
            addEventListener: () => null,
            history: {
              replaceState: sinon.spy()
            }
          };

          try {
            const { middleware } = createHistoryRouter(opts);

            middleware({ getState, dispatch })(next)(action);

            expect(global.window.history.replaceState.args).to.deep.equal([
              [null, null, "/users?sortBy=rating#92"]
            ]);
          } finally {
            global.window = originalWindow;
          }
        });

        it("dispatches 'LEFT' & 'ENTERED", () => {
          const opts = { prefix: "TEST__" };
          const getState = () => ({
            router: {
              path: "/users",
              query: { sortBy: "createdAt" },
              hash: "17"
            }
          });
          const dispatch = sinon.spy();
          const next = () => null;
          const action = {
            type: "TEST__REPLACE",
            payload: {
              query: { sortBy: "rating" },
              hash: "92"
            }
          };

          const originalWindow = global.window;

          global.window = {
            addEventListener: () => null,
            history: {
              replaceState: () => null
            }
          };

          try {
            const { middleware } = createHistoryRouter(opts);

            middleware({ getState, dispatch })(next)(action);

            expect(dispatch.args).to.deep.equal([
              [
                {
                  type: "TEST__LEFT",
                  payload: {
                    path: "/users",
                    query: { sortBy: "createdAt" },
                    hash: "17",
                    to: {
                      path: "/users",
                      query: { sortBy: "rating" },
                      hash: "92"
                    }
                  }
                }
              ],
              [
                {
                  type: "TEST__ENTERED",
                  payload: {
                    path: "/users",
                    query: { sortBy: "rating" },
                    hash: "92",
                    from: {
                      path: "/users",
                      query: { sortBy: "createdAt" },
                      hash: "17"
                    }
                  }
                }
              ]
            ]);
          } finally {
            global.window = originalWindow;
          }
        });
      });

      describe("if neither path nor query presents in the payload", () => {
        it("calls redirectCallback", () => {
          const opts = {
            prefix: "TEST__",
            redirectCallback: sinon.spy()
          };
          const getState = () => ({
            router: {
              path: "/users",
              query: { sortBy: "createdAt" },
              hash: "17"
            }
          });
          const dispatch = () => null;
          const next = () => null;
          const action = {
            type: "TEST__REPLACE",
            payload: {
              hash: "92"
            }
          };

          const { middleware } = createHistoryRouter(opts);

          middleware({ getState, dispatch })(next)(action);

          expect(opts.redirectCallback.args).to.deep.equal([
            ["/users?sortBy=createdAt#92"]
          ]);
        });

        it("calls history.replaceState", () => {
          const opts = { prefix: "TEST__" };
          const getState = () => ({
            router: {
              path: "/users",
              query: { sortBy: "createdAt" },
              hash: "17"
            }
          });
          const dispatch = sinon.spy();
          const next = () => null;
          const action = {
            type: "TEST__REPLACE",
            payload: {
              hash: "92"
            }
          };

          const originalWindow = global.window;

          global.window = {
            addEventListener: () => null,
            history: {
              replaceState: sinon.spy()
            }
          };

          try {
            const { middleware } = createHistoryRouter(opts);

            middleware({ getState, dispatch })(next)(action);

            expect(global.window.history.replaceState.args).to.deep.equal([
              [null, null, "/users?sortBy=createdAt#92"]
            ]);
          } finally {
            global.window = originalWindow;
          }
        });

        it("dispatches 'LEFT' & 'ENTERED", () => {
          const opts = { prefix: "TEST__" };
          const getState = () => ({
            router: {
              path: "/users",
              query: { sortBy: "createdAt" },
              hash: "17"
            }
          });
          const dispatch = sinon.spy();
          const next = () => null;
          const action = {
            type: "TEST__REPLACE",
            payload: {
              hash: "92"
            }
          };

          const originalWindow = global.window;

          global.window = {
            addEventListener: () => null,
            history: {
              replaceState: () => null
            }
          };

          try {
            const { middleware } = createHistoryRouter(opts);

            middleware({ getState, dispatch })(next)(action);

            expect(dispatch.args).to.deep.equal([
              [
                {
                  type: "TEST__LEFT",
                  payload: {
                    path: "/users",
                    query: { sortBy: "createdAt" },
                    hash: "17",
                    to: {
                      path: "/users",
                      query: { sortBy: "createdAt" },
                      hash: "92"
                    }
                  }
                }
              ],
              [
                {
                  type: "TEST__ENTERED",
                  payload: {
                    path: "/users",
                    query: { sortBy: "createdAt" },
                    hash: "92",
                    from: {
                      path: "/users",
                      query: { sortBy: "createdAt" },
                      hash: "17"
                    }
                  }
                }
              ]
            ]);
          } finally {
            global.window = originalWindow;
          }
        });
      });
    });

    describe("on 'BACK'", () => {
      describe("if history presents", () => {
        it("calls history.back", () => {
          const opts = { prefix: "TEST__" };
          const getState = () => ({
            router: {
              path: "/users",
              query: { sortBy: "createdAt" },
              hash: "17"
            }
          });
          const dispatch = () => null;
          const next = () => null;
          const action = {
            type: "TEST__BACK"
          };

          const originalWindow = global.window;

          global.window = {
            addEventListener: sinon.spy(),
            history: {
              back: sinon.spy(),
              forward: sinon.spy(),
              go: sinon.spy()
            }
          };

          try {
            const { middleware } = createHistoryRouter(opts);

            middleware({ dispatch, getState })(next)(action);

            expect(global.window.history.back.callCount).to.equal(1);
            expect(global.window.history.forward.callCount).to.equal(0);
            expect(global.window.history.go.callCount).to.equal(0);
          } finally {
            global.window = originalWindow;
          }
        });
      });
    });

    describe("on 'FORWARD'", () => {
      describe("if history presents", () => {
        it("calls history.forward", () => {
          const opts = { prefix: "TEST__" };
          const getState = () => ({
            router: {
              path: "/users",
              query: { sortBy: "createdAt" },
              hash: "17"
            }
          });
          const dispatch = () => null;
          const next = () => null;
          const action = {
            type: "TEST__FORWARD"
          };

          const originalWindow = global.window;

          global.window = {
            addEventListener: sinon.spy(),
            history: {
              back: sinon.spy(),
              forward: sinon.spy(),
              go: sinon.spy()
            }
          };

          try {
            const { middleware } = createHistoryRouter(opts);

            middleware({ dispatch, getState })(next)(action);

            expect(global.window.history.back.callCount).to.equal(0);
            expect(global.window.history.forward.callCount).to.equal(1);
            expect(global.window.history.go.callCount).to.equal(0);
          } finally {
            global.window = originalWindow;
          }
        });
      });
    });

    describe("on 'GO'", () => {
      describe("if history presents", () => {
        it("calls history.go", () => {
          const opts = { prefix: "TEST__" };
          const getState = () => ({
            router: {
              path: "/users",
              query: { sortBy: "createdAt" },
              hash: "17"
            }
          });
          const dispatch = () => null;
          const next = () => null;
          const action = {
            type: "TEST__GO",
            payload: { entries: 9001 }
          };

          const originalWindow = global.window;

          global.window = {
            addEventListener: sinon.spy(),
            history: {
              back: sinon.spy(),
              forward: sinon.spy(),
              go: sinon.spy()
            }
          };

          try {
            const { middleware } = createHistoryRouter(opts);

            middleware({ dispatch, getState })(next)(action);

            expect(global.window.history.back.callCount).to.equal(0);
            expect(global.window.history.forward.callCount).to.equal(0);
            expect(global.window.history.go.args).to.deep.equal([[9001]]);
          } finally {
            global.window = originalWindow;
          }
        });
      });
    });
  });
});
