import day from 'dayjs';

import BloomManager from '@core/db/BloomManager';
import MemberRefresh from '../src/entities/member-refresh/MemberRefresh';
import Member from '../src/entities/member/Member';

const populateRandomMembers = async (urlName: string) => {
  const malePictures = [
    'https://pbs.twimg.com/profile_images/1333191184131485696/QyNTxv9i_400x400.jpg',
    'https://pbs.twimg.com/profile_images/1204203507198365696/cYKt6RSa_400x400.jpg',
    'https://pbs.twimg.com/profile_images/1198370483139497984/c52qVwvX_400x400.jpg',
    'https://pbs.twimg.com/profile_images/1356067514892091392/prH3LKb2_400x400.jpg'
  ];

  const femalePictures = [
    'https://pbs.twimg.com/profile_images/1251186852805005312/Nn9KM9Fy_400x400.jpg',
    'https://pbs.twimg.com/profile_images/1342824935216078849/wznCxSgt_400x400.jpg',
    'https://pbs.twimg.com/profile_images/1322224632259371011/wlkZxR89_400x400.jpg'
  ];

  const bios = [
    `
      Graduated from Cornell in '20. Passionate about building meaningful
      technology for the URM community. Connect if you want to talk about
      entrepreneurship!
    `,
    `
      Dedicated to equity, diversity, and inclusion. Love: guitars, single
      malts,90s hip hop, fantasy novels, wife, kids. Not in that order.
    `
  ];

  const bm: BloomManager = new BloomManager();

  const members = await bm.em.find(
    Member,
    {
      community: { urlName },
      role: null,
      values: { question: { category: 'GENDER' } }
    },
    { populate: ['user', 'values'] }
  );

  const now = day.utc();

  members.forEach((member, i: number) => {
    member.bio = bios[i % 2];
    member.createdAt = day.utc(member.createdAt).add(3, 'month').format();
    member.joinedAt = member.createdAt;

    if (member.email !== process.env.USER_EMAIL) {
      member.socials.linkedInUrl = 'https://www.linkedin.com/';
    }

    if (member.values[0].value === 'Male') {
      member.pictureUrl = malePictures[i % 4];
    } else member.pictureUrl = femalePictures[i % 3];

    Array.from(Array(Math.floor(Math.random() * Math.floor(120))).keys()).map(
      () => {
        const d = Math.floor(Math.random() * Math.floor(120));
        const time = now.subtract(d, 'd').format();
        bm.create(MemberRefresh, { createdAt: time, member });
        return null;
      }
    );
  });

  await bm.em.flush();
};

export default populateRandomMembers;
