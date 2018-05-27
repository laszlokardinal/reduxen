# reduxen

Reduxen extends [Redux](https://redux.js.org/)'s functionality with routing.
Provides a middleware that connects redux with the history api, and location
(dispatches actions on changes, and calls history methods on incoming actions),
and a reducer to keep the URL in sync with the state.

## Why?

With reduxen you will be able to move the data fetching logic
from the view to the data layer of your single page application,
therefore the view can be pure, deterministic, and easily testable.
The view's responsibility can be only producing the UI based on
the state and propagating incoming events from the user,
while the data management and business logic can entirely take place
in the data layer.

You can create side-effects for the router's actions inside redux with
[sagas](https://redux-saga.js.org/),
[epics](https://redux-observable.js.org/) or
[plain middlewares](https://redux.js.org/advanced/middleware), as well as
manipulate the history by dispatching router actions from them.

## Packages

* [reduxen](packages/reduxen): Core module, that integrates with redux
* [reduxen-react-dom](packages/reduxen-react-dom): React DOM bindings
