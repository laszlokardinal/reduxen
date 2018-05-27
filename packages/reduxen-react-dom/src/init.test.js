require("babel-register")({
  presets: ["es2015", "stage-0", "react"]
});

const React = require("react");
const ReactDOMServer = require("react-dom/server");

const { renderToString } = ReactDOMServer;

const Enzyme = require("enzyme");
const Adapter = require("enzyme-adapter-react-16");
Enzyme.configure({ adapter: new Adapter() });
const { shallow, mount } = Enzyme;

const { JSDOM } = require("jsdom");
const { document } = new JSDOM(
  "<!doctype html><html><body></body></html>"
).window;
const window = document.defaultView;

const { expect } = require("chai");

const sinon = require("sinon");

Object.assign(global, {
  React,
  document,
  window,
  shallow,
  mount,
  expect,
  sinon,
  renderToString
});
