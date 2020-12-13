import csv from 'csvtojson';
import day from 'dayjs';

import BaseRepo from '@core/db/BaseRepo';
import { Member, User } from '@entities';
import { MemberTypeInput } from '../member-type/MemberType.args';
import Community from './Community';
import { CreateCommunityArgs, ImportCommunityCSVArgs } from './Community.args';

export default class CommunityRepo extends BaseRepo<Community> {
  /**
   * Creates a new community when Bloom has a new customer. Omits the addition
   * of a logo. For now, the community should send Bloom a square logo that
   * we will manually add to the Digital Ocean space.
   */
  createCommunity = async ({
    applicationDescription: description,
    applicationTitle: title,
    questions,
    owner,
    types,
    ...data
  }: CreateCommunityArgs): Promise<Community> => {
    const bm = this.bm();

    const community: Community = this.createAndPersist({
      ...data,
      application: title
        ? bm.communityApplicationRepo().create({ description, title })
        : null,
      integrations: bm.communityIntegrationsRepo().create({}),
      members: [
        bm.memberRepo().create({
          role: 'OWNER',
          user: bm.userRepo().create({ ...owner })
        })
      ],
      questions: questions.map((question, i: number) =>
        bm.questionRepo().create({ ...question, order: i })
      ),
      types: types.map((type: MemberTypeInput) =>
        bm.memberTypeRepo().create(type)
      )
    });

    await this.flush('COMMUNITY_CREATED', community);
    return community;
  };

  /**
   * This should only be called in the process of creating a community for the
   * first time, NOT updating the community. It first reads the CSV file
   * with the associated community name, then either creates Members with
   * NEW users if the email is not found in the DB based on the CSV row, or
   * adds a Member based on the current users in our DB.
   */
  importCSVDataToCommunity = async ({
    encodedUrlName
  }: ImportCommunityCSVArgs) => {
    const [community, responses]: [
      Community,
      Record<string, any>[]
    ] = await Promise.all([
      this.findOne({ encodedUrlName }, ['questions', 'types']),
      csv().fromFile(`./membership-csv/${encodedUrlName}.csv`)
    ]);

    const bm = this.bm();
    const questions = community.questions.getItems();
    const types = community.types.getItems();

    const randomPictures = [
      'https://pbs.twimg.com/profile_images/1309512858951131138/8UACAdfa_400x400.jpg',
      'https://pbs.twimg.com/profile_images/1303060784289730560/femQ8Zek_400x400.jpg',
      'https://pbs.twimg.com/profile_images/1216728758473953281/HY15R6ER_400x400.jpg',
      'https://pbs.twimg.com/profile_images/1322009883596726272/5lguqewe_400x400.jpg',
      'https://pbs.twimg.com/profile_images/1285792980872429568/BkcFk2jp_400x400.jpg',
      'https://pbs.twimg.com/profile_images/1289268330088595456/s-5tN4Oi_400x400.jpg'
    ];

    // Adds protection against any emails that are duplicates in the CSV file,
    // INCLUDING case-insensitive duplicates.
    const uniqueEmails = new Set<string>();

    await Promise.all(
      responses.map(async (row: Record<string, any>, i: number) => {
        // Precondition: Every row (JSON) should have a field called 'EMAIL'.
        const email = row.EMAIL;
        const firstName = row.FIRST_NAME;
        const gender = row.GENDER;
        const lastName = row.LAST_NAME;

        // If no email exists OR
        if (!email || uniqueEmails.has(email.toLowerCase())) return;
        uniqueEmails.add(email.toLowerCase());

        // If the user already exists, fetch it from the DB and if not, create
        // a new user for the member.
        const user: User =
          (await bm.userRepo().findOne({ email })) ??
          bm.userRepo().createAndPersist({
            currentLocation: 'Los Angeles, CA, USA',
            email,
            facebookUrl: 'https://www.facebook.com/',
            firstName,
            gender,
            lastName,
            pictureUrl: randomPictures[i % 6],
            twitterUrl: 'https://www.twitter.com/'
          });

        // If a member already exists for the user, then don't create a new
        // member. The likely case for this is for an OWNER of a community.
        // They will have already been created in a script and might also be
        // in a CSV.
        if (await bm.memberRepo().findOne({ community, user })) return;

        // We persist the member instead of the user since the user can
        // potentially be persisted already.
        const member: Member = bm.memberRepo().createAndPersist({
          bio:
            'Bio is Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis something like that.',
          community,
          status: 'ACCEPTED',
          user
        });

        // eslint-disable-next-line array-callback-return
        Object.entries(row).map(([key, value]) => {
          // We already stored all of the user-specific information earlier.
          if (
            !value ||
            ['EMAIL', 'FIRST_NAME', 'LAST_NAME', 'GENDER'].includes(key)
          ) {
            return;
          }

          // If no member type exists in the array, then the default
          // member will be set as the member type.
          if (key === 'MEMBERSHIP_TYPE') {
            const type = types.find(({ name }) => value === name);
            if (type) member.type = type;
          }

          // IMPORTANT: The value must be a valid input to the Date constructor
          // or else errors will be thrown!
          else if (key === 'JOINED_ON') {
            let dayObject = day.utc(value);
            if (!dayObject.isValid()) dayObject = day.utc();

            member.createdAt = dayObject.format();
            user.createdAt = dayObject.format();
            member.joinedOn = dayObject.format();
          }

          // If the question wasn't a special category question, then we find
          // the question with the given key as the title. We proceed to make
          // the appropriate member data.
          else {
            const [question] = questions.filter(({ title }) => key === title);
            if (!question) return;
            bm.memberDataRepo().createAndPersist({ member, question, value });
          }
        });
      })
    );

    await this.flush('COMMUNITY_CSV_PROCESSED', community);
    return community;
  };
}
