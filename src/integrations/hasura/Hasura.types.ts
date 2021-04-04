export enum HasuraEvent {
  CREATE_EVENT_GUEST = 'create_event_guest'
}

export interface HasuraEventPayload {
  createdAt: string;
  event: { data: { new: any; old: any }; op: 'DELETE' | 'INSERT' | 'UPDATE' };
  id: string;
  table: { name: string; schema: string };
  trigger: { name: HasuraEvent };
}

export enum HasuraRole {
  GUEST = 'guest'
}
