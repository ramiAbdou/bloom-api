export enum BusEvent {
  EMAIL_EVENT = 'EMAIL_EVENT',
  GOOGLE_EVENT = 'GOOGLE_EVENT',
  MAILCHIMP_EVENT = 'MAILCHIMP_EVENT',
  SCHEDULE_TASK = 'SCHEDULE_TASK'
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

export enum MutationEvent {
  ACCEPT_APPLICANTS = 'ACCEPT_APPLICANTS',
  ACCEPT_INVITATIONS = 'ACCEPT_INVITATIONS',
  APPLY_TO_COMMUNITY = 'applyToCommunity',
  CREATE_COMMUNITY = 'createCommunity',
  CREATE_EVENT = 'createEvent',
  CREATE_EVENT_ATTENDEE = 'createEventAttendee',
  CREATE_EVENT_GUEST = 'createEventGuest',
  CREATE_EVENT_INVITEES = 'CREATE_EVENT_INVITEES',
  CREATE_EVENT_WATCH = 'createEventWatch',
  CREATE_LIFETIME_PAYMENT = 'createLifetimePayment',
  CREATE_MEMBER_REFRESH = 'CREATE_MEMBER_REFRESH',
  CREATE_MEMBER_TYPES = 'CREATE_MEMBER_TYPES',
  CREATE_QUESTIONS = 'CREATE_QUESTIONS',
  CREATE_STRIPE_CUSTOMER = 'CREATE_STRIPE_CUSTOMER',
  CREATE_STRIPE_PRODUCTS = 'CREATE_STRIPE_PRODUCTS',
  CREATE_SUBSCRIPTION = 'createSubscription',
  CREATE_TASK = 'CREATE_TASK',
  DELETE_EVENT = 'deleteEvent',
  DELETE_EVENT_GUEST = 'deleteEventGuest',
  DELETE_MEMBERS = 'deleteMembers',
  DELETE_SUBSCRIPTION = 'DELETE_SUBSCRIPTION',
  DEMOTE_MEMBERS = 'demoteMembers',
  IGNORE_APPLICANTS = 'IGNORE_APPLICANTS',
  IMPORT_COMMUNITY_CSV = 'IMPORT_COMMUNITY_CSV',
  INVITE_MEMBERS = 'inviteMembers',
  LOGOUT = 'logout',
  ON_FLUSH = 'ON_FLUSH',
  PROMOTE_MEMBERS = 'promoteMembers',
  RESPOND_TO_APPLICANTS = 'respondToApplicants',
  RESTORE_MEMBERS = 'restoreMembers',
  SEND_LOGIN_LINK = 'sendLoginLink',
  UPDATE_EVENT = 'updateEvent',
  UPDATE_GOOGLE_CALENDAR_EVENT_ID = 'UPDATE_GOOGLE_CALENDAR_EVENT_ID',
  UPDATE_MAILCHIMP_ACCESS_TOKEN = 'UPDATE_MAILCHIMP_ACCESS_TOKEN',
  UPDATE_MAILCHIMP_LIST_ID = 'updateMailchimpListId',
  UPDATE_MEMBER = 'updateMember',
  UPDATE_MEMBER_SOCIALS = 'updateMemberSocials',
  UPDATE_MEMBER_VALUES = 'updateMemberValues',
  UPDATE_PAYMENT_METHOD = 'updatePaymentMethod',
  UPDATE_QUESTION = 'updateQuestion',
  UPDATE_RECORDING_URL = 'updateRecordingUrl',
  UPDATE_REFRESH_TOKEN = 'UPDATE_REFRESH_TOKEN',
  UPDATE_STRIPE_ACCOUNT_ID = 'UPDATE_STRIPE_ACCOUNT_ID',
  VERIFY_TOKEN = 'verifyToken'
}

export enum LoggerEvent {
  START_SERVER = 'START_SERVER'
}

// Used for caching purposes (building the keys).
export enum QueryEvent {
  GET_ACTIVE_MEMBERS_GROWTH = 'getActiveMembersGrowth',
  GET_ACTIVE_MEMBERS_SERIES = 'getActiveMembersSeries',
  GET_APPLICANTS = 'getApplicants',
  GET_APPLICATION = 'getApplication',
  GET_CHANGE_PREVIEW = 'getChangePreview',
  GET_COMMUNITY = 'getCommunity',
  GET_EVENT = 'getEvent',
  GET_EVENT_ATTENDEES = 'getEventAttendees',
  GET_EVENT_ATTENDEES_SERIES = 'getEventAttendeesSeries',
  GET_EVENT_GUESTS = 'getEventGuests',
  GET_EVENT_WATCHES = 'getEventWatches',
  GET_INTEGRATIONS = 'getIntegrations',
  GET_MEMBER = 'getMember',
  GET_MEMBER_PLANS = 'getMemberPlans',
  GET_MEMBER_SOCIALS = 'getMemberSocials',
  GET_MEMBER_VALUES = 'getMemberValues',
  GET_MEMBERS = 'getMembers',
  GET_OWNER = 'getOwner',
  GET_PAST_EVENTS = 'getPastEvents',
  GET_PAYMENTS = 'getPayments',
  GET_RANKED_QUESTIONS = 'getRankedQuestions',
  GET_QUESTIONS = 'getQuestions',
  GET_TOKENS = 'getTokens',
  GET_TOTAL_DUES_SERIES = 'getTotalDuesSeries',
  GET_TOTAL_MEMBERS_GROWTH = 'getTotalMembersGrowth',
  GET_TOTAL_MEMBERS_SERIES = 'getTotalMembersSeries',
  GET_UPCOMING_EVENTS = 'getUpcomingEvents',
  GET_UPCOMING_EVENT_GUESTS = 'getUpcomingEventGuests',
  GET_UPCOMING_PAYMENT = 'getUpcomingPayment',
  GET_USER = 'getUser',
  IS_EMAIL_TAKEN = 'isEmailTaken'
}

export enum TaskEvent {
  EVENT_REMINDER_1_DAY = 'EVENT_REMINDER_1_DAY',
  EVENT_REMINDER_1_HOUR = 'EVENT_REMINDER_1_HOUR'
}

export enum VerifyEvent {
  JOIN_EVENT = 'JOIN_EVENT',
  LOG_IN = 'LOG_IN'
}
