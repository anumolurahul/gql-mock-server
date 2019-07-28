const argv = require("yargs")
  .usage("Usage: $0 <command> [options]")
  .help("h")
  .alias("h", "help")
  .describe("port", "port number for the server")
  .describe("schema_file_path", "Path to the graphql schema")
  .example(
    "node $0 --schema_file_path '../awb-fake2/schema.graphql' --port 3006"
  ).argv
const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const { graphqlExpress, graphiqlExpress } = require("apollo-server-express")
const {
  makeExecutableSchema,
  addMockFunctionsToSchema
} = require("graphql-tools")
const { importSchema } = require("graphql-import")
const schema = importSchema(argv.schema_file_path)
const MockList = require("graphql-tools").MockList

// console.log(util.inspect(schema))
const resolvers = {
  Url: () => "Fix",
  DateTime: () => {
    return new Date()
  },
  ISO8601DateTime: () => {
    return new Date()
  },
  HoldingUnit: () => {
    return new MockList(3)
  },
  Money: () => {
    return (Math.random() * 100) / 100
  },
  Currency: () => {
    return {
      id: 1,
      isoCode: "USD",
      displayName: "United States Dollar",
      name: "United States Dollar"
    }
  },
  Query: () => ({
    relationshipManagers: () => new MockList(1)
  }),
  RelationshipManager: () => ({
    reportingRelationshipManagers: () => new MockList(5),
    aums: () => new MockList(5)
  })
}
preserveResolvers = true

const schemaServer = makeExecutableSchema({ typeDefs: schema })

// Add mocks, modifies schema in place
addMockFunctionsToSchema({
  schema: schemaServer,
  mocks: resolvers,
  preserveResolvers: true
})

// Initialize the app
const app = express()

app.use("*", cors(), (req, res, next) => {
  next()
})

// The GraphQL endpoint
app.use(
  "/reporting/graphql",
  bodyParser.json(),
  graphqlExpress({ schema: schemaServer })
)

app.get("/relationship_manager_users/validate_token", (req, res) => {
  res.send({ success: true })
})

// GraphiQL, a visual editor for queries
app.use("/graphiql", graphiqlExpress({ endpointURL: "/reporting/graphql" }))

// Start the server
app.listen(argv.port || 3000, "0.0.0.0", () => {
  console.log(`Go to http://localhost:${argv.port}/graphiql to run queries!`)
  console.log(`http://localhost:${argv.port}/graphql is the graphql endpoint!`)
})
