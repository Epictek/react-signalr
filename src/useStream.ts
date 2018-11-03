import {IStreamResult} from "@aspnet/signalr";
import {useEffect, useReducer} from "react";
import {IStreamState} from "./types";

// tslint:disable-next-line:no-empty
const noop = () => {};

type StreamStateUpdate<T> = Partial<IStreamState<T>>;

const initialState = {error: null, value: null, done: false};

function stateReducer<T>(state: IStreamState<T>, action: StreamStateUpdate<T>) {
  return {...state, ...action};
}

export function useStream<T>(stream: IStreamResult<T> | null) {
  const [{value, error, done}, setState] = useReducer<
    IStreamState<T>,
    StreamStateUpdate<T>
  >(stateReducer, initialState);

  useEffect(
    () => {
      if (!stream) {
        return noop;
      }

      const sub = stream.subscribe({
        complete: () => setState({done: true}),
        error: err => setState({error: err, done: true}),
        next: streamValue => setState({value: streamValue}),
      });

      return () => {
        try {
          sub.dispose();
        } catch (_) {
          // Looks like react fire unmount event starting from the root components to children. This causes connection
          // to be closed first, and unsubscribe attempt above will eventually fail. But if the connection was already
          // closed that means we can handle this error with a noop
        }
      };
    },
    [stream]
  );

  return {value, error, done};
}
