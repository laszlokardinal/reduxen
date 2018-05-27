const stringifyQuery = (queryObject) => {
  return Object.keys(queryObject)
    .map((key) => [key, queryObject[key]])
    .map((entry) => entry.join("="))
    .join("&");
};

export default stringifyQuery;
