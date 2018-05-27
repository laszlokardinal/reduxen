import parseQuery from "./parseQuery.js";

const parseUrl = (url) => {
  const indexOfQuery = url.indexOf("?");
  const indexOfHash = url.indexOf("#");

  let pathPart = null;
  let queryPart = null;
  let hashPart = null;

  if (indexOfQuery !== -1) {
    pathPart = url.slice(0, indexOfQuery);
    queryPart = url.slice(indexOfQuery + 1);

    if (indexOfHash !== -1 && indexOfQuery < indexOfHash) {
      const indexOfHashInQuery = queryPart.indexOf("#");
      hashPart = queryPart.slice(indexOfHashInQuery + 1);
      queryPart = queryPart.slice(0, indexOfHashInQuery);
    }
  } else {
    if (indexOfHash !== -1) {
      pathPart = url.slice(0, indexOfHash);
      hashPart = url.slice(indexOfHash + 1);
    } else {
      pathPart = url;
    }
  }

  const urlObject = {};

  if (pathPart) {
    if (pathPart === "/") {
      urlObject.path = "/";
    } else {
      if (pathPart.slice(-1) === "/") {
        urlObject.path = pathPart.slice(0, -1);
      } else {
        urlObject.path = pathPart;
      }
    }
  }

  if (queryPart !== null) {
    urlObject.query = parseQuery(queryPart);
  }

  if (hashPart !== null) {
    urlObject.hash = hashPart;
  }

  return urlObject;
};

export default parseUrl;
