const match = (pattern, path) => {
  const patternParts = pattern.split("/").slice(1);

  const matchPattern = (path) => {
    const pathParts = path.split("/").slice(1);

    if (
      patternParts.length > pathParts.length &&
      patternParts.length + 1 !== pathParts.length &&
      patternParts.slice(-1)[0] !== "*"
    ) {
      return null;
    }

    if (
      patternParts.length < pathParts.length &&
      patternParts.slice(-1)[0] !== "*"
    ) {
      return null;
    }

    return patternParts
      .map((patternPart, index) => [patternPart, pathParts[index]])
      .reduce((params, [patternPart, pathPart]) => {
        if (!params) {
          return null;
        }

        if (patternPart === "?" || patternPart === "*") {
          return params;
        }

        if (patternPart[0] === ":") {
          if (
            patternPart[patternPart.length - 1] === ")" &&
            patternPart.includes("(")
          ) {
            const splittedPatternPart = patternPart.split("(");

            const options = splittedPatternPart[1].slice(0, -1).split("|");

            if (options.includes(pathPart)) {
              const paramName = splittedPatternPart[0].slice(1);

              params[paramName] = pathPart;

              return params;
            } else {
              return null;
            }
          } else {
            params[patternPart.slice(1)] = pathPart;

            return params;
          }
        }

        if (
          patternPart[0] === "(" &&
          patternPart[patternPart.length - 1] === ")"
        ) {
          if (
            patternPart
              .slice(1, -1)
              .split("|")
              .includes(pathPart)
          ) {
            return params;
          } else {
            return null;
          }
        }

        if (patternPart === pathPart) {
          return params;
        }

        return null;
      }, {});
  };

  return path !== undefined ? matchPattern(path) : matchPattern;
};

export default match;
