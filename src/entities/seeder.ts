/**
 * @fileoverview Seeder: Create ColorStack Community
 * @author Rami Abdou
 */

import BloomManager from '@util/db/BloomManager';
import db from '@util/db/db';

(async () => {
  await db.cleanForTesting();

  await new BloomManager().communityRepo().createCommunity({
    applicationDescription: `Our mission is to increase the entrance, retention, and success of Black, Latinx, and Native American college students in computing. The stronger our community, the better positioned we are to move the needle for racial diversity in tech. Thank you for joining us.`,
    applicationTitle: `Student Member Application`,
    name: 'ColorStack',
    owner: { email: 'rami@bl.community', firstName: 'Rami', lastName: 'Abdou' },
    questions: [
      { category: 'FIRST_NAME', title: 'First Name' },
      { category: 'LAST_NAME', title: 'Last Name' },
      {
        category: 'EMAIL',
        description: `We'd prefer if you use your school email, but if you check another email more frequently, please provide that email. Make sure to check for typos.`,
        title: 'Last Name'
      },
      {
        description: `Please use the full name of your university. For example, "Cornell University", not "Cornell."`,
        title: 'School',
        type: 'SHORT_TEXT'
      },
      {
        description: `Please choose the option closest to your major. If your minor is more relevant to this community, please select that instead.`,
        options: [
          'Computer Science',
          'Information Science',
          'Electrical/Computer Engineering'
        ],
        title: 'Major',
        type: 'MULTIPLE_CHOICE'
      },
      {
        options: ['Undergraduate', 'Masters', 'PhD'],
        title: 'Education Level',
        type: 'MULTIPLE_CHOICE'
      },
      {
        options: ['2020', '2021', '2022', '2023', '2024', '2025'],
        title: 'Expected Graduation Year',
        type: 'MULTIPLE_CHOICE'
      },
      {
        options: ['Black/African-American', 'Hispanic/Latinx'],
        title: 'Race',
        type: 'MULTIPLE_SELECT'
      },
      { title: 'Gender', type: 'MULTIPLE_CHOICE' },
      {
        options: ['NSBE', 'SHPE', 'CODE2040', 'MLT'],
        title: 'Are you an active member of any of these organizations?',
        type: 'MULTIPLE_SELECT'
      },
      {
        category: 'MEMBERSHIP_TYPE',
        description: `General Members want to receive emails about opportunities and events, nothing more. Family Members want more. They join our national Slack community to connect with, uplift, and find support from other ColorStack family members.`,
        title: 'Membership Type'
      },
      {
        description:
          'If you have any specific ideas on how we can be most helpful to you, please share that here as well.',
        title: `What's one thing you'd like ColorStack to do for you in the next 3 months?`,
        type: 'LONG_TEXT'
      }
    ],
    types: [
      { isDefault: true, name: 'General Member' },
      { name: 'Family Member' }
    ]
  });

  await db.close();
})();
