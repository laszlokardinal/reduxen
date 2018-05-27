import stringifyUrl from "./stringifyUrl.js";
import parseUrl from "./parseUrl.js";

const createHistoryRouter = (opts = {}) => {
  const prefix = opts.prefix || "ROUTER__";
  const selectRouter = opts.selectRouter || (({ router }) => router);
  const initialUrl = opts.initialUrl || null;
  const redirectCallback = opts.redirectCallback || null;

  /*
      REDUCER
  */

  const initialState = { path: "", query: {}, hash: "" };

  const reducer = (state = initialState, action) => {
    if (action.type === `${prefix}ENTERED`) {
      const { path, query, hash } = action.payload;

      return { path, query, hash };
    }

    return state;
  };

  /*
      MIDDLEWARE
  */

  const middleware = ({ dispatch, getState }) => {
    const window = global.window || null;
    const history = window ? window.history : null;
    const location = window ? window.location : null;

    // dispatch left & entered actions

    const dispatchTransition = (from, to) => {
      if (from) {
        dispatch({
          type: `${prefix}LEFT`,
          payload: { path: from.path, query: from.query, hash: from.hash, to }
        });
      }

      dispatch({
        type: `${prefix}ENTERED`,
        payload: {
          path: to.path,
          query: to.query,
          hash: to.hash,
          from: from || { path: "", query: {}, hash: "" }
        }
      });
    };

    // subscribe to popstate

    if (window) {
      window.addEventListener("popstate", () => {
        const router = selectRouter(getState());

        const { path, query, hash } = parseUrl(
          location.pathname + location.search + location.hash
        );

        dispatchTransition(router, {
          path,
          query: query || {},
          hash: hash || ""
        });
      });
    }

    // dispatch initial route

    setImmediate(() => {
      const router = selectRouter(getState());

      if (!router.path) {
        const url =
          initialUrl || location.pathname + location.search + location.hash;

        const { path, query, hash } = parseUrl(url);

        dispatchTransition(null, {
          path,
          query: query || {},
          hash: hash || ""
        });
      }
    });

    // handle incoming actions

    return (next) => (action) => {
      switch (action.type) {
        case `${prefix}PUSH`:
        case `${prefix}REPLACE`:
          {
            const { payload } = action;
            const router = selectRouter(getState());

            let finalUrlObject;

            if ("path" in payload) {
              finalUrlObject = {
                path: payload.path,
                query: payload.query || {},
                hash: payload.hash || ""
              };
            } else {
              if ("query" in payload) {
                finalUrlObject = {
                  path: router.path,
                  query: payload.query,
                  hash: payload.hash || ""
                };
              } else {
                if ("hash" in payload) {
                  finalUrlObject = {
                    path: router.path,
                    query: router.query,
                    hash: payload.hash
                  };
                } else {
                  break;
                }
              }
            }

            const stringifiedUrl = stringifyUrl(finalUrlObject);

            if (redirectCallback) {
              redirectCallback(stringifiedUrl);
            }

            if (history) {
              if (action.type === `${prefix}PUSH`) {
                history.pushState(null, null, stringifiedUrl);
              } else {
                history.replaceState(null, null, stringifiedUrl);
              }

              dispatchTransition(router, finalUrlObject);
            }
          }
          break;

        case `${prefix}BACK`:
          if (history) {
            history.back();
          }
          break;

        case `${prefix}FORWARD`:
          if (history) {
            history.forward();
          }
          break;

        case `${prefix}GO`:
          if (history) {
            history.go(action.payload.entries);
          }
          break;
      }

      return next(action);
    };
  };

  return { middleware, reducer };
};

export default createHistoryRouter;
