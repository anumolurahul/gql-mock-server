const express = require('express');
const bodyParser = require('body-parser');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');
const { makeExecutableSchema, addMockFunctionsToSchema } = require('graphql-tools');
const util = require('util')
const { importSchema } = require('graphql-import')
const schema = importSchema('../awb-fake2/schema.graphql')
const MockList = require('graphql-tools').MockList;
const mockServer = require('graphql-tools').mockServer;

// console.log(util.inspect(schema))
const resolvers = {
  Url: () => 'Fix',
  DateTime: () => {
    return new Date();
  },
  Query: () => ({
    relationshipManagers: () => new MockList(1),
  }),
  RelationshipManager: () => ({
    reportingRelationshipManagers: () => new MockList(5),
    aums: () => new MockList(5)
  }),
};
preserveResolvers = true

const schemaServer = makeExecutableSchema({ typeDefs: schema });

// Add mocks, modifies schema in place
addMockFunctionsToSchema({
  schema: schemaServer,
  mocks: resolvers,
  preserveResolvers: true
});

// Initialize the app
const app = express();

// The GraphQL endpoint
app.use('/graphql', bodyParser.json(), graphqlExpress({ schema: schemaServer }));

// GraphiQL, a visual editor for queries
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

// Start the server
app.listen(3006, "0.0.0.0", () => {
  console.log('Go to http://localhost:3000/graphiql to run queries!');
});

