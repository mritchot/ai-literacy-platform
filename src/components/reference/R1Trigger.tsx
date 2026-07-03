// R1Trigger — thin wrapper over the registry-driven ReferenceTrigger
// (kept so existing call sites keep their names; the shared open/close
// + panel wiring lives in ReferenceTrigger.tsx).

import { ReferenceTrigger, type ReferenceTriggerProps } from './ReferenceTrigger';

type R1TriggerProps = Omit<ReferenceTriggerProps, 'refId'>;

export function R1Trigger(props: R1TriggerProps): JSX.Element {
  return <ReferenceTrigger refId="R1" {...props} />;
}
