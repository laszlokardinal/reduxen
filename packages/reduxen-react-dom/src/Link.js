import React from "react";
import PropTypes from "prop-types";

import match from "reduxen/match";
import parseUrl from "reduxen/parseUrl";

import { Consumer } from "./RouterProvider.js";

const Link = ({
  style,
  className,
  activeClassName,
  activePattern,
  to,
  replace,
  children
}) => (
  <Consumer>
    {({ router, dispatch, prefix }) => {
      const linkPath = parseUrl(to).path;
      const currentPath = router.path;

      const finalActivePattern = activePattern || linkPath;
      const isActive = finalActivePattern
        ? match(finalActivePattern, currentPath)
        : false;

      const finalClassName = [className, isActive ? activeClassName : ""]
        .filter((item) => item)
        .join(" ");

      return (
        <a
          href={to}
          style={style}
          className={finalClassName}
          onClick={(event) => {
            if (
              event.defaultPrevented ||
              event.metaKey ||
              event.altKey ||
              event.ctrlKey ||
              event.shiftKey ||
              event.button !== 0
            ) {
              return true;
            }

            event.preventDefault();

            if (to[0] === "/" || to[0] === "?" || to[0] === "#") {
              dispatch({
                type: replace ? `${prefix}REPLACE` : `${prefix}PUSH`,
                payload: parseUrl(to)
              });
            }
          }}
        >
          {children}
        </a>
      );
    }}
  </Consumer>
);

Link.propTypes = {
  style: PropTypes.object,
  className: PropTypes.string,
  activeClassName: PropTypes.string,
  activePattern: PropTypes.string,
  to:
    process.env.NODE_ENV === "production"
      ? () => {}
      : (props) => {
          if (typeof props.to !== "string") {
            return new Error("Non-string prop `to` supplied to Link");
          }

          if (!["/", "?", "#"].includes(props.to[0])) {
            return new Error(
              "Invalid prop `to` supplied to Link: `to` prop should start with '/', '?' or '#'."
            );
          }
        },
  replace: PropTypes.bool,
  children: PropTypes.node
};

export default Link;
