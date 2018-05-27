# reduxen-react-dom

React DOM bindings for [reduxen](https://github.com/laszlokardinal/reduxen).

## Table of contents

* [API](#api)
  * [Components](#components)
    * [Link](#link)
    * [RouterProvider](#routerprovider)
* [Examples](#example)
  * [With connect](#with-connect)
  * [Without connect](#without-connect)

## API

### Components

#### Link

Renders an \<a /\> tag that dispatches `PUSH` or `REPLACE` with the parsed
`to` prop as the payload on click to update the url, and the state.
Applies `to` as a href. Adds `activeClassName` if the current path matches with the Link's.

Must be embedded inside a `<RouterProvider />` in the component tree.

Props:

* **to** String url to navigate to (required to start with /)
* **replace** _(optional)_ If true, the component dispatches `REPLACE` instead of `PUSH`.
  Defaults to false
* **children** _(optional)_ Children nodes to be rendered inside the \<a /\>
* **style** _(optional)_ Style to be applied on the rendered \<a /\>
* **className** _(optional)_ ClassName to be applied on the rendered \<a /\>
* **activeClassName** _(optional)_ Adds the content of this prop if activePattern matches
  with the current path
* **activePattern** _(optional)_ Overrides the path checking of the Link. Can be used
  for navigation button (e.g. activePattern="/users/\*")
  Defaults to `to` prop.

#### RouterProvider

Provides the given props in the context to the Link component.

Props:

* **router** Router object from the state to pass down the hierarchy tree
* **dispatch** The store's dispatch function
* **prefix** _(optional)_ Overrides default action namespace. Defaults to `ROUTER__`

## Examples

### With connect

index.jsx

```js
import React from "react";
import ReactDOM from "react-dom";

import { connect, Provider } from "react-redux";
import { RouterProvider } from "reduxen-react-dom";

import configureStore from "./store/configureStore.js";
import App from "./view/App.js";

const store = configureStore();

const ConnectedRouterProvider = connect(({ router }) => ({ router }))(
  RouterProvider
);

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouterProvider>
      <App />
    </ConnectedRouterProvider>
  </Provider>,
  document.getElementById("react-root")
);
```

App.jsx

```js
import React, { Fragment } from "react";

import { match } from "reduxen";

import { TodosScreen, TodoScreen, AboutScreen } from "./screens";

const App = ({ router }) => (
  <Fragment>
    {match("/todos", router.path) ? <TodosScreen /> : null}
    {match("/todos/:id", router.path) ? <TodoScreen /> : null}
    {match("/about", router.path) ? <AboutScreen /> : null}
  </Fragment>
);

const mapStateToProps = (state) => ({
  router: state.router
});

export default connect(mapStateToProps)(App);
```

### Without connect

index.jsx

```js
import React from "react";
import ReactDOM from "react-dom";

import { RouterProvider } from "reduxen-react-dom";

import configureStore from "./store/configureStore.js";
import App from "./view/App.js";

const store = configureStore();

const element = document.getElementById("react-root");

const renderApp = () => {
  const state = store.getState();
  const { dispatch } = store;

  ReactDOM.render(
    <RouterProvider router={state.router} dispatch={dispatch}>
      <App state={state} dispatch={dispatch} />
    </RouterProvider>,
    element
  );
};

store.subscribe(renderApp);

renderApp();
```

App.jsx

```js
import React, { Fragment } from "react";

import { match } from "reduxen";

import { TodosScreen, TodoScreen, AboutScreen } from "./screens";

const App = ({ state, dispatch }) => {
  const { router } = state;

  return (
    <Fragment>
      {match("/todos", router.path) ? (
        <TodosScreen state={state} dispatch={dispatch} />
      ) : null}
      {match("/todos/:id", router.path) ? (
        <TodoScreen state={state} dispatch={dispatch} />
      ) : null}
      {match("/about", router.path) ? (
        <AboutScreen state={state} dispatch={dispatch} />
      ) : null}
    </Fragment>
  );
};

export default App;
```
