//requiring our dependencies
const express = require('express')
const graphqlHTTP = require('express-graphql')
const app = express()
//requiring our schema which we exported from schema.js
const schema = require('./schema/schema')

//here we create a single end point of /graphql
// we pass in our schema so we have access to our queries and mutations
// we say graphiql: true so we have access to the in browser explorer we used in class
app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}))

// start up the server
const PORT = 3005
app.listen(PORT, () => console.log(`listening on ${PORT} lets go baby`)) 