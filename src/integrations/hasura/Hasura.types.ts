export enum HasuraCronTrigger {
  EXECUTE_PENDING_TASKS = 'execute_pending_tasks'
}

export enum HasuraEventTrigger {
  CREATE_EVENT = 'create_event',
  CREATE_EVENT_GUEST = 'create_event_guest',
  DELETE_EVENT = 'delete_event',
  DELETE_MEMBER = 'delete_member',
  UPDATE_MEMBER_ROLE = 'update_member_role',
  UPDATE_MEMBER_STATUS = 'update_member_status'
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
  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
  MEMBER = 'MEMBER',
  GUEST = 'GUEST'
}
