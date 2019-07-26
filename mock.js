const express = require('express');
const bodyParser = require('body-parser');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');
const { makeExecutableSchema } = require('graphql-tools');
const util = require('util')
const { importSchema } = require('graphql-import')
const typeDefs = importSchema('~/awb-fake2/schema.graphql')
const MockList = require('graphql-tools').MockList;
const mockServer = require('graphql-tools').mockServer;


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

const schemaServer = makeExecutableSchema({typeDefs, resolvers, preserveResolvers});

// // The GraphQL schema in string form
// const typeDefs = `
//   type Query { books: [Book] }
//   type Book { title: String, author: String }
// `;

// // The resolvers
// const resolvers = {
//   Query: { books: () => books },
// };

// // Put together a schema
// const schema = makeExecutableSchema({
//   typeDefs,
//   resolvers,
// });

// Initialize the app
const app = express();

// The GraphQL endpoint
app.use('/graphql', bodyParser.json(), graphqlExpress({ schemaServer }));

// GraphiQL, a visual editor for queries
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

// Start the server
app.listen(3006, "0.0.0.0", () => {
  console.log('Go to http://localhost:3000/graphiql to run queries!');
});

// const query = `query getRMDashboardDetails(
//   $interval: TimeInterval
//   $productType: AUMGroupByInput
//   $fromDate: DateTime
//   $includeOrg: Boolean
//   $reporteeRmIds: [ID!]
//   $asOf: [DateTime!]
// ) {
//   relationshipManagers(
//     reportingCurrency: "USD"
//     includeOrg: $includeOrg
//     reporteeRmIds: $reporteeRmIds
//   ) {
//     id
//     firstName
//     lastName
//     joiningDate
//     aums(interval: { fromDate: $fromDate, interval: $interval }, groupBy: $productType) {
//       aum
//       asOfDate
//       currency {
//         isoCode
//       }
//       groupByValue
//     }
//     reportingRelationshipManagers(asOf: $asOf, top: 5, sortByInput: AUM) {
//       id
//       firstName
//       lastName
//       photoUrl
//       aums {
//         aum
//       }
//     }
//   }
// }`

// const variables = {}

// server.query(query, variables)
//   .then(response => {
//     parsedResponse = JSON.parse(JSON.stringify(response))
//     console.log(util.inspect(parsedResponse, { showHidden: true, depth: null }))
//   })
