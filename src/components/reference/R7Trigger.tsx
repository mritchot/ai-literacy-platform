// R7Trigger — thin wrapper over the registry-driven ReferenceTrigger
// (kept so existing call sites keep their names; the shared open/close
// + panel wiring lives in ReferenceTrigger.tsx).

import { ReferenceTrigger, type ReferenceTriggerProps } from './ReferenceTrigger';

type R7TriggerProps = Omit<ReferenceTriggerProps, 'refId'>;

export function R7Trigger(props: R7TriggerProps): JSX.Element {
  return <ReferenceTrigger refId="R7" {...props} />;
}
