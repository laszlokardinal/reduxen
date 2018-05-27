import Link from "./Link.js";

import { Consumer } from "./RouterProvider.js";

const router = {
  path: "/users",
  query: { sortBy: "createdAt" },
  hash: "18"
};

const dispatch = () => null;

const prefix = "TEST__";

describe("Link", () => {
  it("renders the RouterProvider's exporter Consumer", () => {
    const wrapper = shallow(<Link to="/users/192" />);

    expect(wrapper.type()).to.equal(Consumer);
    expect(wrapper.prop("children")).to.be.a("function");
  });

  it("renders an anchor in the Consumer's children method", () => {
    const outerWrapper = shallow(<Link to="/users/192" />);
    const ConsumerMethod = outerWrapper.prop("children");
    const wrapper = shallow(
      <ConsumerMethod router={router} dispatch={dispatch} prefix={prefix} />
    );

    expect(wrapper.name()).to.equal("a");
  });

  it("renders children inside", () => {
    function TestChildren() {}

    const outerWrapper = shallow(
      <Link to="/users/192">
        <TestChildren />
      </Link>
    );
    const ConsumerMethod = outerWrapper.prop("children");
    const wrapper = shallow(
      <ConsumerMethod router={router} dispatch={dispatch} prefix={prefix} />
    );

    expect(wrapper.find("a > TestChildren")).to.have.length(1);
  });

  it("applies style", () => {
    const outerWrapper = shallow(
      <Link to="/users/192" style={{ backgroundColor: "red" }} />
    );
    const ConsumerMethod = outerWrapper.prop("children");
    const wrapper = shallow(
      <ConsumerMethod router={router} dispatch={dispatch} prefix={prefix} />
    );

    expect(wrapper.prop("style")).to.deep.equal({ backgroundColor: "red" });
  });

  it("applies className", () => {
    const outerWrapper = shallow(
      <Link to="/users/192" className="test-class-name" />
    );
    const ConsumerMethod = outerWrapper.prop("children");
    const wrapper = shallow(
      <ConsumerMethod router={router} dispatch={dispatch} prefix={prefix} />
    );

    expect(wrapper.find("a.test-class-name")).to.have.length(1);
  });

  it("applies activeClassName on matching path", () => {
    const outerWrapper = shallow(
      <Link to="/users/192" activeClassName="test-class-name" />
    );
    const ConsumerMethod = outerWrapper.prop("children");
    const wrapper = shallow(
      <ConsumerMethod router={router} dispatch={dispatch} prefix={prefix} />
    );

    expect(wrapper.find("a.test-class-name")).to.have.length(0);

    wrapper.setProps({ router: { ...router, path: "/users/192" } });

    expect(wrapper.find("a.test-class-name")).to.have.length(1);
  });

  it("applies activeClassName on matching path with activePattern", () => {
    const outerWrapper = shallow(
      <Link
        to="/users/192"
        activeClassName="test-class-name"
        activePattern="/users/:id/posts"
      />
    );
    const ConsumerMethod = outerWrapper.prop("children");
    const wrapper = shallow(
      <ConsumerMethod router={router} dispatch={dispatch} prefix={prefix} />
    );

    expect(wrapper.find("a.test-class-name")).to.have.length(0);

    wrapper.setProps({ router: { ...router, path: "/users/192/posts" } });

    expect(wrapper.find("a.test-class-name")).to.have.length(1);
  });

  it("dispatches 'PUSH' on click", () => {
    const dispatch = sinon.spy();
    const preventDefault = sinon.spy();

    const outerWrapper = shallow(<Link to="/users/192" />);
    const ConsumerMethod = outerWrapper.prop("children");
    const wrapper = shallow(
      <ConsumerMethod router={router} dispatch={dispatch} prefix={prefix} />
    );

    expect(dispatch.callCount).to.equal(0);

    wrapper.prop("onClick")({ preventDefault });

    expect(dispatch.args).to.deep.equal([
      [
        {
          type: "TEST__PUSH",
          payload: {
            path: "/users/192"
          }
        }
      ]
    ]);
    expect(preventDefault.callCount).to.equal(1);
  });

  it("dispatches 'REPLACE' on click if replace prop is true", () => {
    const dispatch = sinon.spy();
    const preventDefault = sinon.spy();

    const outerWrapper = shallow(<Link to="?sortBy=name" replace={true} />);
    const ConsumerMethod = outerWrapper.prop("children");
    const wrapper = shallow(
      <ConsumerMethod router={router} dispatch={dispatch} prefix={prefix} />
    );

    expect(dispatch.callCount).to.equal(0);

    wrapper.prop("onClick")({ preventDefault });

    expect(dispatch.args).to.deep.equal([
      [
        {
          type: "TEST__REPLACE",
          payload: {
            query: { sortBy: "name" }
          }
        }
      ]
    ]);
    expect(preventDefault.callCount).to.equal(1);
  });
});
