// R2Trigger — thin wrapper over the registry-driven ReferenceTrigger
// (kept so existing call sites keep their names; the shared open/close
// + panel wiring lives in ReferenceTrigger.tsx).

import { ReferenceTrigger, type ReferenceTriggerProps } from './ReferenceTrigger';

type R2TriggerProps = Omit<ReferenceTriggerProps, 'refId'>;

export function R2Trigger(props: R2TriggerProps): JSX.Element {
  return <ReferenceTrigger refId="R2" {...props} />;
}
