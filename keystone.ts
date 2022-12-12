import 'dotenv/config';
import { createSchema, config, list } from '@keystone-next/keystone/schema';
import { createAuth } from '@keystone-next/auth';
import {
  withItemData,
  statelessSessions,
} from '@keystone-next/keystone/session';
import { User } from './schemas/User';
import { Product } from './schemas/Product';

const databaseUrl =
  process.env.DATABASE_URL || 'mongodb://localhost/keystone-sick-fits-tutorial';

const sessionConfig = {
  maxAge: 60 * 60 * 24 * 360, // how long signed in
  secret: process.env.COOKIE_SECRET,
};

const { withAuth } = createAuth({
  // Could be customer, user, whoever logins
  listKey: 'User',
  // what they login with username/email
  identityField: 'email',
  secretField: 'password',
  // work around for creating a first user without disabling auth
  initFirstItem: {
    fields: ['name', 'email', 'password'],
    // TODO: Add in initial roles here.
  },
});

export default withAuth(
  config({
    server: {
      cors: {
        origin: [process.env.FRONTEND_URL],
        credentials: true,
      },
    },
    db: {
      adapter: 'mongoose',
      url: databaseUrl,
      // TODO: Add data seeding here
    },
    lists: createSchema({
      // Schema items go in here
      User,
      Product,
    }),
    ui: {
      // Show UI only for people who pass this test. Could do any logic, like admin etc.
      isAccessAllowed: ({ session }) =>
        // console.log(session);

        !!session?.data,
    },
    session: withItemData(statelessSessions(sessionConfig), {
      // GraphQL Query
      // This data comes along with every request which explains middleware. You can use the data for permissions as opposed to going and getting it.
      // User: 'id name email',
      User: 'id',
    }),
  })
);
