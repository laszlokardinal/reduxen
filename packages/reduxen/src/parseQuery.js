const parseQuery = (queryString) => {
  return queryString
    .split("&")
    .map((part) => part.split("="))
    .filter(([_, value]) => value)
    .reduce((queryObject, [key, value]) => {
      queryObject[key] = value;
      return queryObject;
    }, {});
};

export default parseQuery;
