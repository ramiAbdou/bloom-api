export enum HasuraEvent {
  CREATE_EVENT = 'create_event',
  CREATE_EVENT_GUEST = 'create_event_guest',
  DELETE_EVENT = 'delete_event',
  UPDATE_MEMBER_ROLE = 'update_member_role'
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
