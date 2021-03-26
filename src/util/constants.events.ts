// ## BUS EVENTS - Handles all of the Event Emitter events.

export enum BusEvent {
  EMAIL_EVENT = 'EMAIL_EVENT',
  GOOGLE_EVENT = 'GOOGLE_EVENT',
  MAILCHIMP_EVENT = 'MAILCHIMP_EVENT',
  TASK_EVENT = 'TASK_EVENT'
}

export enum EmailEvent {
  ACCEPTED_INTO_COMMUNITY = 'ACCEPTED_INTO_COMMUNITY',
  APPLY_TO_COMMUNITY = 'APPLY_TO_COMMUNITY',
  APPLY_TO_COMMUNITY_ADMINS = 'APPLY_TO_COMMUNITY_ADMINS',
  CONNECT_INTEGRATIONS = 'CONNECT_INTEGRATIONS',
  CREATE_EVENT_COORDINATOR = 'CREATE_EVENT_COORDINATOR',
  CREATE_EVENT_INVITEES = 'CREATE_EVENT_INVITEES',
  DELETE_EVENT_COORDINATOR = 'DELETE_EVENT_COORDINATOR',
  DELETE_EVENT_GUESTS = 'DELETE_EVENT_GUESTS',
  DELETE_MEMBERS = 'DELETE_MEMBERS',
  DEMOTE_MEMBERS = 'DEMOTE_MEMBERS',
  EVENT_REMINDER = 'EVENT_REMINDER',
  EVENT_RSVP = 'EVENT_RSVP',
  INVITE_MEMBERS = 'INVITE_MEMBERS',
  LOGIN_LINK = 'LOGIN_LINK',
  PAYMENT_RECEIPT = 'PAYMENT_RECEIPT',
  PROMOTE_MEMBERS = 'PROMOTE_MEMBERS'
}

export enum GoogleEvent {
  ADD_CALENDAR_EVENT_ATTENDEE = 'ADD_CALENDAR_EVENT_ATTENDEE',
  CREATE_CALENDAR_EVENT = 'CREATE_CALENDAR_EVENT',
  DELETE_CALENDAR_EVENT = 'DELETE_CALENDAR_EVENT',
  DELETE_CALENDAR_EVENT_ATTENDEE = 'DELETE_CALENDAR_EVENT_ATTENDEE',
  UPDATE_CALENDAR_EVENT = 'UPDATE_CALENDAR_EVENT'
}

export enum MailchimpEvent {
  ADD_TO_AUDIENCE = 'ADD_TO_AUDIENCE'
}

export enum TaskEvent {
  EVENT_REMINDER_1_DAY = 'EVENT_REMINDER_1_DAY',
  EVENT_REMINDER_1_HOUR = 'EVENT_REMINDER_1_HOUR'
}

// ## GRAPHQL EVENTS - Shared between Front-End and Back-End.

export enum MutationEvent {
  APPLY_TO_COMMUNITY = 'applyToCommunity',
  CREATE_COMMUNITY = 'createCommunity',
  CREATE_EVENT = 'createEvent',
  CREATE_EVENT_ATTENDEE = 'createEventAttendee',
  CREATE_EVENT_GUEST = 'createEventGuest',
  CREATE_EVENT_WATCH = 'createEventWatch',
  CREATE_MEMBER_PLANS = 'createMemberPlans',
  DELETE_EVENT = 'deleteEvent',
  DELETE_EVENT_GUEST = 'deleteEventGuest',
  DELETE_MEMBERS = 'deleteMembers',
  DEMOTE_MEMBERS = 'demoteMembers',
  INVITE_MEMBERS = 'inviteMembers',
  LOGOUT = 'logout',
  PROMOTE_MEMBERS = 'promoteMembers',
  REMOVE_STRIPE_SUBSCRIPTION_ID = 'removeStripeSubscriptionId',
  RESPOND_TO_APPLICANTS = 'respondToApplicants',
  RESTORE_MEMBERS = 'restoreMembers',
  SEND_LOGIN_LINK = 'sendLoginLink',
  UPDATE_EVENT = 'updateEvent',
  UPDATE_MAILCHIMP_LIST_ID = 'updateMailchimpListId',
  UPDATE_MEMBER = 'updateMember',
  UPDATE_MEMBER_SOCIALS = 'updateMemberSocials',
  UPDATE_MEMBER_VALUES = 'updateMemberValues',
  UPDATE_QUESTION = 'updateQuestion',
  UPDATE_STRIPE_PAYMENT_METHOD_ID = 'updateStripePaymentMethodId',
  UPDATE_STRIPE_SUBSCRIPTION_ID = 'updateStripeSubscriptionId',
  VERIFY_TOKEN = 'verifyToken'
}

export enum QueryEvent {
  GET_ACTIVE_MEMBERS_GROWTH = 'getActiveMembersGrowth',
  GET_ACTIVE_MEMBERS_SERIES = 'getActiveMembersSeries',
  GET_APPLICATION = 'getApplication',
  GET_CHANGE_PREVIEW = 'getChangePreview',
  GET_COMMUNITY = 'getCommunity',
  GET_COMMUNITY_INTEGRATIONS = 'getCommunityIntegrations',
  GET_EVENT = 'getEvent',
  GET_EVENT_ATTENDEES_SERIES = 'getEventAttendeesSeries',
  GET_MEMBER_INTEGRATIONS = 'getMemberIntegrations',
  GET_MEMBER_SOCIALS = 'getMemberSocials',
  GET_MEMBER_VALUES = 'getMemberValues',
  GET_MEMBER = 'getMember',
  GET_MEMBERS_GROWTH = 'getMembersGrowth',
  GET_MEMBERS_SERIES = 'getMembersSeries',
  GET_OWNER = 'getOwner',
  GET_PAYMENTS = 'getPayments',
  GET_PAYMENTS_SERIES = 'getPaymentsSeries',
  GET_RANKED_QUESTIONS = 'getRankedQuestions',
  GET_QUESTIONS = 'getQuestions',
  GET_TOKENS = 'getTokens',
  GET_USER = 'getUser',
  IS_EMAIL_TAKEN = 'isEmailTaken',
  LIST_APPLICANTS = 'listApplicants',
  LIST_COMMUNITIES = 'listCommunities',
  LIST_EVENT_ATTENDEES = 'listEventAttendees',
  LIST_EVENT_GUESTS = 'listEventGuests',
  LIST_EVENT_WATCHES = 'listEventWatches',
  LIST_MEMBER_PLANS = 'listMemberPlans',
  LIST_MEMBERS = 'listMembers',
  LIST_PAST_EVENTS = 'listPastEvents',
  LIST_UPCOMING_EVENT_GUESTS = 'listUpcomingEventGuests',
  LIST_UPCOMING_EVENTS = 'listUpcomingEvents'
}

export enum LoggerEvent {
  START_SERVER = 'START_SERVER'
}

export enum VerifyEvent {
  JOIN_EVENT = 'JOIN_EVENT',
  LOG_IN = 'LOG_IN'
}
