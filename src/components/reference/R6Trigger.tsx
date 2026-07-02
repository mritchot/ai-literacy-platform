// R6Trigger — thin wrapper over the registry-driven ReferenceTrigger
// (kept so existing call sites keep their names; the shared open/close
// + panel wiring lives in ReferenceTrigger.tsx).

import { ReferenceTrigger, type ReferenceTriggerProps } from './ReferenceTrigger';

type R6TriggerProps = Omit<ReferenceTriggerProps, 'refId'>;

export function R6Trigger(props: R6TriggerProps): JSX.Element {
  return <ReferenceTrigger refId="R6" {...props} />;
}
