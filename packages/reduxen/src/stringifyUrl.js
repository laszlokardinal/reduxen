import stringifyQuery from "./stringifyQuery.js";

const stringifyUrl = ({ path, query, hash }) => {
  let pathPart;

  if (path) {
    if (path === "/") {
      pathPart = "/";
    } else {
      if (path.slice(-1) === "/") {
        pathPart = path.slice(0, -1);
      } else {
        pathPart = path;
      }
    }
  } else {
    pathPart = "";
  }

  let queryPart;

  if (query) {
    if (Object.keys(query).length) {
      queryPart = "?" + stringifyQuery(query);
    } else {
      queryPart = "";
    }
  } else {
    queryPart = "";
  }

  let hashPart;

  if (hash) {
    hashPart = "#" + hash;
  } else {
    hashPart = "";
  }

  return [pathPart, queryPart, hashPart].join("");
};

export default stringifyUrl;
