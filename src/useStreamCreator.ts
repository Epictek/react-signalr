import {useMemo} from "react";
import {IConnectionContext, StreamCreator} from "./types";
import {useConnectionContext} from "./useConnectionContext";

export function useStreamCreator<T>(
  context: IConnectionContext,
  streamCreator: StreamCreator<T>,
  inputs: any[]
) {
  const {connection} = useConnectionContext(context);
  const stream = useMemo(
    () => (connection ? streamCreator(connection) : null),
    [connection, ...inputs]
  );
  return stream;
}
