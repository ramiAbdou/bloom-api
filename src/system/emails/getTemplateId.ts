import { EmailEvent } from '@util/constants.events';

const getTemplateId = (emailEvent: EmailEvent) => {
  if (emailEvent === EmailEvent.ACCEPTED_INTO_COMMUNITY) {
    return process.env.SENDGRID_ACCEPTED_INTO_COMMUNITY_TEMPLATE_ID;
  }

  if (emailEvent === EmailEvent.APPLY_TO_COMMUNITY) {
    return process.env.SENDGRID_APPLY_TO_COMMUNITY_TEMPLATE_ID;
  }

  if (emailEvent === EmailEvent.APPLY_TO_COMMUNITY_ADMINS) {
    return process.env.SENDGRID_APPLY_TO_COMMUNITY_ADMINS_TEMPLATE_ID;
  }

  if (emailEvent === EmailEvent.CONNECT_INTEGRATIONS) {
    return process.env.SENDGRID_CONNECT_INTEGRATIONS_TEMPLATE_ID;
  }

  if (emailEvent === EmailEvent.CREATE_EVENT_COORDINATOR) {
    return process.env.SENDGRID_CREATE_EVENT_COORDINATOR_TEMPLATE_ID;
  }

  if (emailEvent === EmailEvent.CREATE_EVENT_INVITEES) {
    return process.env.SENDGRID_CREATE_EVENT_INVITEES_TEMPLATE_ID;
  }

  if (emailEvent === EmailEvent.DELETE_EVENT_COORDINATOR) {
    return process.env.SENDGRID_DELETE_EVENT_COORDINATOR_TEMPLATE_ID;
  }

  if (emailEvent === EmailEvent.DELETE_EVENT_GUESTS) {
    return process.env.SENDGRID_DELETE_EVENT_GUESTS_TEMPLATE_ID;
  }

  if (emailEvent === EmailEvent.DELETE_MEMBERS) {
    return process.env.SENDGRID_DELETE_MEMBERS_TEMPLATE_ID;
  }

  if (emailEvent === EmailEvent.DEMOTE_MEMBERS) {
    return process.env.SENDGRID_DEMOTE_MEMBERS_TEMPLATE_ID;
  }

  if (emailEvent === EmailEvent.EVENT_REMINDER) {
    return process.env.SENDGRID_EVENT_REMINDER_TEMPLATE_ID;
  }

  if (emailEvent === EmailEvent.EVENT_RSVP) {
    return process.env.SENDGRID_EVENT_RSVP_TEMPLATE_ID;
  }

  if (emailEvent === EmailEvent.INVITE_MEMBERS) {
    return process.env.SENDGRID_INVITE_MEMBERS_TEMPLATE_ID;
  }

  if (emailEvent === EmailEvent.LOGIN_LINK) {
    return process.env.SENDGRID_LOGIN_LINK_TEMPLATE_ID;
  }

  if (emailEvent === EmailEvent.PAYMENT_RECEIPT) {
    return process.env.SENDGRID_PAYMENT_RECEIPT_TEMPLATE_ID;
  }

  if (emailEvent === EmailEvent.PROMOTE_MEMBERS) {
    return process.env.SENDGRID_PROMOTE_MEMBERS_TEMPLATE_ID;
  }

  return null;
};

export default getTemplateId;
