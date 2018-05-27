import RouterProvider, { Consumer } from "./RouterProvider.js";

const router = {
  path: "/users",
  query: { sortBy: "createdAt" },
  hash: "18"
};

const dispatch = () => null;

const prefix = "TEST__";

describe("RouterProvider", () => {
  it("renders a Provider with the prop values", () => {
    const wrapper = shallow(
      <RouterProvider router={router} dispatch={dispatch} prefix={prefix} />
    );

    expect(wrapper.getElement().type.$$typeof).to.equal(
      Symbol.for("react.provider")
    );
    expect(wrapper.prop("value")).to.deep.equal({
      router,
      dispatch,
      prefix
    });
  });

  it("renders a Provider with 'ROUTER__' as the default prefix", () => {
    const wrapper = shallow(
      <RouterProvider router={router} dispatch={dispatch} />
    );

    expect(wrapper.prop("value")).to.deep.equal({
      router,
      dispatch,
      prefix: "ROUTER__"
    });
  });

  it("renders a Provider with the children inside", () => {
    function TestChildren() {}

    const wrapper = shallow(
      <RouterProvider router={router} dispatch={dispatch}>
        <TestChildren />
      </RouterProvider>
    );

    expect(wrapper.children().name()).to.equal("TestChildren");
  });

  it("propagates data to the exported Consumer", () => {
    const ConsumerMethod = sinon.spy(() => null);

    renderToString(
      <RouterProvider router={router} dispatch={dispatch} prefix={prefix}>
        <div>
          <Consumer>{ConsumerMethod}</Consumer>
        </div>
      </RouterProvider>
    );

    expect(ConsumerMethod.args).to.deep.equal([
      [
        {
          router,
          dispatch,
          prefix
        }
      ]
    ]);
  });
});
