require("babel-register")({
  presets: ["es2015", "stage-0"]
});

const { expect } = require("chai");

const sinon = require("sinon");

Object.assign(global, {
  expect,
  sinon
});
