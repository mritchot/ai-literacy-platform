// R3Trigger — thin wrapper over the registry-driven ReferenceTrigger
// (kept so existing call sites keep their names; the shared open/close
// + panel wiring lives in ReferenceTrigger.tsx).

import { ReferenceTrigger, type ReferenceTriggerProps } from './ReferenceTrigger';

type R3TriggerProps = Omit<ReferenceTriggerProps, 'refId'>;

export function R3Trigger(props: R3TriggerProps): JSX.Element {
  return <ReferenceTrigger refId="R3" {...props} />;
}
