# reduxen

Core module for [reduxen](https://github.com/laszlokardinal/reduxen).

## Table of contents

* [API](#api)
    * [Methods](#methods)
        * [createHistoryRouter](#createhistoryrouter)
        * [match](#match)
        * [parseUrl](#parseurl)
        * [stringifyUrl](#stringifyurl)
        * [parseQuery](#parsequery)
        * [stringifyQuery](#stringifyquery)
    * [Reducer](#reducer)
    * [Middleware](#middleware)
        * [Dispatches](#dispatches)
            * [ENTERED](#entered)
            * [LEFT](#left)
        * [Handles](#handles)
            * [PUSH](#push)
            * [REPLACE](#replace)
            * [BACK](#back)
            * [FORWARD](#forward)
            * [GO](#go)
* [Examples](#examples)

## API

### Methods

#### createHistoryRouter

`createHistoryRouter(options) -> { middleware, reducer }`

Creates an object that contains the reducer and middleware for redux.

The options object can contain:

* **prefix**: for customize action namespace (e.g. `router/`), defaults to `ROUTER__`
* **selectRouter**: method that can be used for selecting the router from the state,
  if it's not in the root. defaults to `state => state.router`
* **initialUrl**: the middleware uses the initialUrl for dispatching the first ENTER action
  instead of window.location (can be used for server side rendering)
* **redirectCallback**: will be invoked on push & replace,
  can be used for redirections on server side rendering

#### match

`match(pattern, path) -> { params } | null`

`match(pattern)(path) -> { params } | null`

Returns an object (including named parameters if the argument pattern
matches the path, otherwise returns null.

Supported pattern parts:

```
  fixed       - must match the argument path part
  :id         - the part will be included under the name in the returned object
  ?           - anything matches
  (a|b|c)     - must match with one of the defined items
  :name(a|b)  - must match with one of the defined items, the match will be included as name
  *           - matches anything at that part and after it (can only be used as the last part in the pattern)
```

Examples:

```js
  match("/todos/:todoId", "/todos/182") -> { todoId: "182" }
  match("/todos/:todoId", "/todos") -> null
  match("/todos/?/:tab(content|author)", "/todos/182/author") -> { tab: "author" }
```

Also, [path-to-regexp](https://github.com/pillarjs/path-to-regexp) can be an
alternative to match() with further capabilities.

#### parseUrl

`parseUrl(urlString) -> { path, query, hash }`

Parses the argument URL string to an object that contains the defined parts.

Examples:

```js
parseUrl("/nested/path/?query=string#hash") -> {
  path: "/nested/path",
  query: { query: "string" },
  hash: "hash"
}

parseUrl("/?query=string") -> {
  path: "/",
  query: { query: "string" }
}

parseUrl("#hash") -> { hash: "hash" }
```

#### stringifyUrl

`stringifyUrl({ path, query, hash ) -> urlString`

Stingifies the argument object to a string.

Examples:

```js
stringifyUrl({
  path: "/nested/path",
  query: { query: "string" },
  hash: "hash"
}) -> "/nested/path/?query=string#hash"

stringifyUrl({
  path: "/",
  query: { query: "string" }
}) -> "/?query=string"

stringifyUrl({ hash: "hash" }) -> "#hash"
```

#### parseQuery

`parseQuery(queryString) -> {}`

Parses the argument query string to an object, where the
values are strings. Can't handle nested query strings yet.

Example:

```js
parseQuery("q=groceries&sortyBy=createdAt&count=10") ->
  { q: "groceries", sortBy: "createdAt", count: "10" }
```

#### stringifyQuery

`stringifyQuery({}) -> queryString`

Stringifies the argument object, to a query string.
Can't handle nested query strings yet.

Example:

```js
parseQuery({ q: "groceries", sortBy: "createdAt", count: "10" }) ->
  "q=groceries&sortyBy=createdAt&count=10"
```

### Reducer

Contains the actual parts of the URL. Will be updated on `ENTERED` actions.

```js
{
  path: string,
  query: object,
  hash: string
}
```

### Middleware

#### Dispatches

##### ENTERED

The middleware dispatches `ENTERED` action when the
transition finished. Contains the parts of the next
URL in the payload (`path`, `query`, `hash`), as well as
the parts of the previous URL (`from`).

Can be used for loading resources entering a URL.

Do not capture `ENTERED` actions in middlewares, as it leads to undefined behavior.

```js
{
  type: "ROUTER__ENTERED",
  payload: {
    path: string,
    query: object,
    hash: string,
    from: {
      path: string,
      query: object,
      hash: string,
    }
  }
}
```

##### LEFT

The middleware dispatches `LEFT` action when the
transition finished, but before `ENTERED`.
Contains the parts of the current URL in the payload (`path`, `query`, `hash`),
as well as the parts of the next URL (`to`).

Can be used for releasing resources leaving a URL.

Do not capture `LEFT` actions in middlewares, as it leads to undefined behavior.

```js
{
  type: "ROUTER__LEFT",
  payload: {
    path: string,
    query: object,
    hash: string,
    to: {
      path: string,
      query: object,
      hash: string,
    }
  }
}
```

#### Handles

##### PUSH

Dispatching `PUSH` action pushes a new history entry to the stack via history.pushState

The middleware completes the URL with parts that is higher in hierarchy. (e.g. if the payload
contains only the query, the path will be reused from the actual URL, but not the hash)

Do not use `history.pushState` parallel with reduxen as they do not fire any events,
and it is impossible to be notified about route changes without monkey patching them.
Using them directly will leave reduxen out of sync, and leads to undefined behavior.

```js
{
  type: "ROUTER__PUSH",
  payload: {
    path: "/todos",
    query: { sortBy: "createdAt" }
  }
}
```

##### REPLACE

Dispatching `PUSH` action replaces the current history entry on the stack via history.replaceState

The middleware completes the URL with parts that is higher in hierarchy. (e.g. if the payload
contains only the query, the path will be reused from the actual URL, but not the hash)

Do not use `history.replaceState` parallel with reduxen as they do not fire any events,
and it is impossible to be notified about route changes without monkey patching them.
Using them directly will leave reduxen out of sync, and leads to undefined behavior.

```js
{
  type: "ROUTER__PUSH",
  payload: {
    query: { sortBy: "name" }
  }
}
```

##### BACK

Dispatching `BACK` action calls history.back

```js
{ type: "ROUTER__BACK" }
```

##### FORWARD

Dispatching Calls `FORWARD` action calls history.forward

```js
{ type: "ROUTER__FORWARD" }
```

##### GO

Dispatching `GO` action calls history.go with the number of entries from the payload

```js
{ type: "ROUTER__GO", payload: { entries: -3 } }
```

## Example

```js
import { createStore, applyMiddleware } from "redux";
import { createHistoryRouter } from "reduxen";
import createSagaMiddleware from "redux-saga";

import { todosReducer } from "./reducers";

import rootSaga from "./rootSaga";

const configureStore = () => {
  const historyRouter = createHistoryRouter({ initialUrl });

  const rootReducer = combineReducers({
    todos: todosReducer
    router: historyRouter.reducer
  });

  const sagaMiddleware = createSagaMiddleware();

  const store = createStore(
    rootReducer,
    applyMiddleware(historyRouter.middleware, sagaMiddleware)
  );

  sagaMiddleware.run(rootSaga);

  return store;
};

export default configureStore;
```

```js
import { match } from "reduxen";
import { put, call, takeLatest } from "redux-saga/effects";

import { load } from "../api/todoApi";

const handleEntered = function*(action) {
  const params = match("/todos/:todoId", action.payload.path);

  if (params) {
    const todo = yield call(load, params.todoId);
  }
};

const handleLeft = function*(action) {
  if (match("/todos/:todoId", action.payload.path)) {
    yield put({ type: "TODO__RESET" });
  }
};

const todoRoute = function*() {
  yield takeLatest("ROUTER__ENTERED", handleEntered);
  yield takeLatest("ROUTER__LEFT", handleLeft);
};

export default todoRoute;
```
