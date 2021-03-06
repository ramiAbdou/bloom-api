import day from 'dayjs';

import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { RecurrenceType } from '../../member-plan/MemberPlan';
import Payment, { PaymentType } from '../../payment/Payment';
import Member from '../Member';

/**
 * Returns true if the Member has paid their dues in less than the
 * RecurrenceType of their MemberPlan.
 *
 * Example: If the Member's current MemberPlan is on a MONTHLY recurrence
 * and they paid dues less than a month ago, then they are active. Otherwise,
 * they are not.
 */
const isDuesActive = async (
  ctx: Pick<GQLContext, 'memberId'>
): Promise<boolean> => {
  const { memberId } = ctx;

  const bm = new BloomManager();

  const member: Member = await bm.findOne(Member, memberId, {
    populate: ['payments', 'plan']
  });

  const lastDuesPayment: Payment = member.payments
    .getItems()
    .find((payment: Payment) => {
      return payment.type === PaymentType.DUES;
    });

  if (!lastDuesPayment) return false;

  const { recurrence } = member.plan;

  if (recurrence === RecurrenceType.LIFETIME) return true;

  if (recurrence === RecurrenceType.MONTHLY) {
    const oneMonthAgo = day.utc().subtract(1, 'month');
    return day.utc(lastDuesPayment?.createdAt)?.isAfter(oneMonthAgo);
  }

  if (recurrence === RecurrenceType.YEARLY) {
    const oneYearAgo = day.utc().subtract(1, 'year');
    return day.utc(lastDuesPayment?.createdAt)?.isAfter(oneYearAgo);
  }

  return false;
};

export default isDuesActive;
