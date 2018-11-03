import {ReactElement} from "react";
import {render} from "react-testing-library";

export function renderWithSyncEffects(ui: ReactElement<any>) {
  const renderResult = render(ui);
  renderResult.rerender(ui);
  return renderResult;
}
