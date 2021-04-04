export enum HasuraEvent {
  CREATE_EVENT_GUEST = 'create_event_guest',
  DELETE_EVENT = 'delete_event'
}

export interface HasuraEventPayload {
  createdAt: string;
  event: {
    data: { new: any; old: any };
    sessionVariables: { xHasuraMemberId: string };
    op: 'DELETE' | 'INSERT' | 'UPDATE';
  };
  id: string;
  table: { name: string; schema: string };
  trigger: { name: string };
}

export enum HasuraRole {
  GUEST = 'guest'
}
