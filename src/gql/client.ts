import { GraphQLClient } from 'graphql-request';

const client: GraphQLClient = new GraphQLClient(process.env.HASURA_URL, {
  headers: { 'x-hasura-admin-secret': 'bloom' }
});

export default client;
