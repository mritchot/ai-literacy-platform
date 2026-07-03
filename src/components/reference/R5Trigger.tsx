// R5Trigger — thin wrapper over the registry-driven ReferenceTrigger
// (kept so existing call sites keep their names; the shared open/close
// + panel wiring lives in ReferenceTrigger.tsx).

import { ReferenceTrigger, type ReferenceTriggerProps } from './ReferenceTrigger';

type R5TriggerProps = Omit<ReferenceTriggerProps, 'refId'>;

export function R5Trigger(props: R5TriggerProps): JSX.Element {
  return <ReferenceTrigger refId="R5" {...props} />;
}
