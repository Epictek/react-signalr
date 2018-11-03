import {HttpTransportType, HubConnectionBuilder} from "@aspnet/signalr";
import React from "react";
import {cleanup} from "react-testing-library";
import {ConnectionStub} from "./__test_helpers__/ConnectionStub";
import {deferReject, deferResolve} from "./__test_helpers__/defer";
import {renderWithSyncEffects} from "./__test_helpers__/renderWithSyncEffects";
import {IConnectionStatus} from "./types";
import {useConnection} from "./useConnection";

const connection = new HubConnectionBuilder()
  .withUrl("https://example.com", HttpTransportType.WebSockets)
  .build();
const connStub = ConnectionStub.create(connection);

function HookHelper(props: {
  children: (s: IConnectionStatus) => React.ReactElement<any>;
}) {
  return props.children(useConnection(connStub.factory));
}

afterEach(cleanup);
afterEach(() => connStub.restore());

test("should expose connection when connected", async () => {
  const startPromise = deferResolve(100);
  const startSpy = connStub.stubStart().mockImplementation(() => startPromise);
  connStub.stubStop().mockImplementation(() => deferResolve(100));
  const renderSpy = jest.fn().mockReturnValue(null);
  renderWithSyncEffects(<HookHelper>{renderSpy}</HookHelper>);
  await startPromise;

  expect(startSpy).toHaveBeenCalledTimes(1);
  expect(renderSpy).toHaveBeenCalledWith({
    connection,
    error: null,
  });
});

// TODO: fix flacky test
test.skip("should expose connection error", async () => {
  const startPromise = deferReject(100, new Error("BAM"));
  connStub.stubStart().mockImplementation(() => startPromise);
  connStub.stubStop().mockImplementation(() => deferResolve(100));
  const renderSpy = jest.fn().mockReturnValue(null);

  const {rerender} = renderWithSyncEffects(
    <HookHelper>{renderSpy}</HookHelper>
  );

  // empty catch since we're emulating connection error and don't want it to crash the test
  try {
    await startPromise;
    // tslint:disable-next-line:no-empty
  } catch (_) {}

  rerender(<HookHelper>{renderSpy}</HookHelper>);

  expect(renderSpy).toHaveBeenCalledWith({
    connection: null,
    error: new Error("BAM"),
  });
});

test("should disconnect when unmounted", async () => {
  const startPromise = deferResolve(100);
  const stopPromise = deferResolve(100);
  connStub.stubStart().mockImplementation(() => startPromise);
  const stopSpy = connStub.stubStop().mockImplementation(() => stopPromise);
  const {unmount} = renderWithSyncEffects(
    <HookHelper>{jest.fn().mockReturnValue(null)}</HookHelper>
  );
  await startPromise;
  unmount();
  await stopPromise;
  expect(stopSpy).toHaveBeenCalledTimes(1);
});
