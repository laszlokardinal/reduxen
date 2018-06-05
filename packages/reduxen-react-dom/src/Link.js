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

            dispatch({
              type: replace ? `${prefix}REPLACE` : `${prefix}PUSH`,
              payload: parseUrl(to)
            });
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
  to: PropTypes.string.isRequired,
  replace: PropTypes.bool,
  children: PropTypes.node
};

export default Link;
