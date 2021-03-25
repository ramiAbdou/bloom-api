import day, { Dayjs } from 'dayjs';

import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import EventAttendee from '../src/entities/event-attendee/EventAttendee';
import EventGuest from '../src/entities/event-guest/EventGuest';
import Event from '../src/entities/event/Event';
import Member from '../src/entities/member/Member';

const populateRandomEvents = async (community: Community) => {
  const bm: BloomManager = new BloomManager();

  const nowJs: Dayjs = day.utc();

  const event1: Event = bm.create(Event, {
    community,
    createdAt: nowJs.subtract(4, 'week').format(),
    description: `
      R provides a wide range of statistical (linear and nonlinear modelling,
      classical statistical tests, time-series analysis, classification and
      clustering) and graphical techniques and is highly extensible. R is an
      integrated suite of software facilities for data manipulation,
      calculation and graphical display. It includes an effective data handling
      and storage facility of large coherent, integrated collection of
      intermediate tools for data analysis, graphical facilities for data
      analysis and display either on-screen or on hardcopy. The recent rise
      of analytics has resulted in a great demand for business analysts and the
      trend will continue to rise. Data analytics is one of the important
      aspects of the research.
    `,
    endTime: nowJs.subtract(3, 'week').startOf('hour').add(1, 'hour').format(),
    private: true,
    startTime: day.utc().subtract(3, 'week').startOf('hour').format(),
    summary: `
      Know how brands like Discord, OneDay, Public.com & SalesLoft are laying
      out their marketing plan for 2021
    `,
    title: 'Community Kickback',
    updatedAt: day.utc().subtract(4, 'week').format(),
    videoUrl:
      'https://zoom.us/j/5962989444?pwd=dWZiazFKOVpxa0FJVThBS3pHSHlIZz09'
  });

  const event2 = bm.create(Event, {
    community,
    createdAt: nowJs.subtract(2, 'week').format(),
    description: `
      R provides a wide range of statistical (linear and nonlinear modelling,
      classical statistical tests, time-series analysis, classification and
      clustering) and graphical techniques and is highly extensible. R is an
      integrated suite of software facilities for data manipulation,
      calculation and graphical display. It includes an effective data handling
      and storage facility of large coherent, integrated collection of
      intermediate tools for data analysis, graphical facilities for data
      analysis and display either on-screen or on hardcopy. The recent rise
      of analytics has resulted in a great demand for business analysts and the
      trend will continue to rise. Data analytics is one of the important
      aspects of the research.
    `,
    endTime: nowJs.add(2, 'hour').startOf('hour').format(),
    private: true,
    startTime: nowJs.subtract(1, 'hour').startOf('hour').format(),
    summary: `
      Know how brands like Discord, OneDay, Public.com & SalesLoft are laying
      out their marketing plan for 2021
    `,
    title: 'Introduction to Software Engineering',
    updatedAt: nowJs.subtract(2, 'week').format(),
    videoUrl:
      'https://zoom.us/j/5962989444?pwd=dWZiazFKOVpxa0FJVThBS3pHSHlIZz09'
  });

  const event3 = bm.create(Event, {
    community,
    createdAt: nowJs.subtract(3, 'hour').format(),
    description: `
      The Mainstage Virtual Summit 2021 Is our biggest event this year, this
      time we present our stage to global speakers to talk on different aspects
      of Sales, Fundraising, Innovation, and Ecosystem.
    
      Our last physical event in Bangalore "Mainstage Incubator Summit - Top10
      Startups" back in February last year was a huge success. This year we are
      going even bigger. Don't miss it!
    `,
    endTime: nowJs.add(2, 'week').add(1, 'hour').startOf('hour').format(),
    private: true,
    startTime: nowJs.add(2, 'week').startOf('hour').format(),
    summary: `
      The Mainstage Virtual Summit 2021 Is our biggest event this year, this
      time we present our stage to global speakers to talk on different Topics.
    `,
    title: 'Fellowship Kickoff',
    updatedAt: nowJs.subtract(3, 'hour').format(),
    videoUrl:
      'https://zoom.us/j/5962989444?pwd=dWZiazFKOVpxa0FJVThBS3pHSHlIZz09'
  });

  const members: Member[] = await bm.find(
    Member,
    { community: { id: community.id } },
    { limit: 25, populate: ['user'] }
  );

  members.forEach((member, i) => {
    if (member.user.email === process.env.USER_EMAIL) return;
    const randomAddition = Math.floor(Math.random() * 30);

    if (i % 2 === 0) {
      bm.create(EventAttendee, {
        createdAt: day
          .utc(event1.startTime)
          .add(randomAddition, 'minute')
          .format(),
        email: member.user.email,
        event: event1,
        firstName: member.firstName,
        lastName: member.lastName,
        member
      });
    }

    const randomAddition2 = Math.floor(Math.random() * 7);

    bm.create(EventGuest, {
      createdAt: day
        .utc()
        .subtract(4, 'week')
        .add(randomAddition2, 'day')
        .format(),
      email: member.email,
      event: event1,
      firstName: member.firstName,
      lastName: member.lastName,
      member
    });

    if (i % 2 === 0) {
      bm.create(EventGuest, {
        createdAt: day
          .utc()
          .subtract(2, 'week')
          .add(Math.floor(randomAddition / 2), 'day')
          .format(),
        email: member.user.email,
        event: event2,
        firstName: member.firstName,
        lastName: member.lastName,
        member
      });
    }

    if (i % 3 === 0) {
      bm.create(EventGuest, {
        createdAt: day.utc().subtract(1, 'hour').format(),
        email: member.email,
        event: event3,
        firstName: member.firstName,
        lastName: member.lastName,
        member
      });
    }
  });

  await bm.flush();
};

export default populateRandomEvents;
