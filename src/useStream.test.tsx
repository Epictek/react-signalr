import React from "react";
import {IStreamResult} from "@aspnet/signalr";
import {cleanup} from "react-testing-library";
import {renderWithSyncEffects} from "./__test_helpers__/renderWithSyncEffects";
import {useStream} from "./useStream";
import {Stream} from "./__test_helpers__/Stream";
import {IStreamState} from "./types";

function HookHelper<T>(props: {
  stream: IStreamResult<T>;
  children: (s: IStreamState<T>) => React.ReactElement<any>;
}) {
  return props.children(useStream(props.stream));
}

function fixture() {
  return {
    children: jest.fn().mockReturnValue(null),
    stream: new Stream<number>(),
  };
}

afterEach(cleanup);

test("should initialize with empty state", () => {
  const {children, stream} = fixture();
  renderWithSyncEffects(<HookHelper stream={stream}>{children}</HookHelper>);
  expect(children).toHaveBeenCalledWith({
    value: null,
    error: null,
    done: false,
  });
});

test("should update value on stream value", () => {
  const {children, stream} = fixture();
  renderWithSyncEffects(<HookHelper stream={stream}>{children}</HookHelper>);
  stream.next(1);
  expect(children).toHaveBeenCalledWith({
    value: 1,
    error: null,
    done: false,
  });
});

test("should set done on stream completion", () => {
  const {children, stream} = fixture();
  renderWithSyncEffects(<HookHelper stream={stream}>{children}</HookHelper>);
  stream.complete();
  expect(children).toHaveBeenCalledWith({
    value: null,
    error: null,
    done: true,
  });
});

test("should set error & done on stream error", () => {
  const {children, stream} = fixture();
  renderWithSyncEffects(<HookHelper stream={stream}>{children}</HookHelper>);
  stream.error(new Error("BAM"));
  expect(children).toHaveBeenCalledWith({
    value: null,
    error: new Error("BAM"),
    done: true,
  });
});

test("should dispose subscription on unmount", () => {
  const {children, stream} = fixture();
  const {unmount} = renderWithSyncEffects(
    <HookHelper stream={stream}>{children}</HookHelper>
  );
  unmount();
  stream.next(1);
  expect(children).not.toHaveBeenCalledWith({
    value: 1,
    error: null,
    done: false,
  });
});
