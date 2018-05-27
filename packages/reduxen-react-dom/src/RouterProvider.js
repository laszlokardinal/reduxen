import React from "react";
import PropTypes from "prop-types";

const context = React.createContext({
  router: {
    path: "",
    query: {},
    hash: ""
  },
  dispatch: () => null,
  prefix: "ROUTER__"
});

const { Provider } = context;

// Consumer

export const Consumer = context.Consumer;

// Provider

const RouterProvider = ({ router, dispatch, prefix, children }) => (
  <Provider value={{ router, dispatch, prefix }}>{children}</Provider>
);

RouterProvider.propTypes = {
  children: PropTypes.node,
  router: PropTypes.shape({
    path: PropTypes.string.isRequired,
    query: PropTypes.object.isRequired,
    hash: PropTypes.string.isRequired
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
  prefix: PropTypes.string
};

RouterProvider.defaultProps = {
  prefix: "ROUTER__"
};

export default RouterProvider;
