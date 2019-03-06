// data for teams and players
const teams = [
  {team: 'Packers', location: 'Green Bay', id: 0},
  { team: '49ers', location: 'Santa Clara', id: 1 },
  { team: 'Browns', location: 'Nowhere', id: 2 },
  { team: 'Saints',location: 'Nawlens', id: 3 },
  { team: 'Titans', location: 'Memphis', id: 4 }
]
const players = [
	{ name: 'Aaron Rodgers', id: 0, teamID: 0 },
	{ name: 'Jamal Williams', id: 1, teamID: 0 },
	{ name: 'LeBron James', id: 2, teamID: 2 },
	{ name: 'Jimmy Garopolo', id: 3, teamID: 1 },
	{ name: 'Wayne Gretzky', id: 4, teamID: 3 },
	{ name: 'Marcus Williams', id: 5, teamID: 3 },
	{ name: 'Elon Musk', id: 6, teamID: 4 },
	{ name: 'Marcus Mariota', id: 7, teamID: 4 }
]

//requiring graphql
const graphql = require('graphql')
// importing our different objecg and data types from graphql
const {GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList, GraphQLNonNull} = graphql

// defning what shape we expect a single player to be in
const PlayerType = new GraphQLObjectType({
  name: 'Player',
  //fields sets the data on the type with a function
  fields: () => ({
    name: { type: GraphQLString },
    id: {type: GraphQLID},
    teamID: {type: GraphQLID},
    // custom team field which allows us to return what team the specific player plays for
    // convenient so we don't have to explicitly write it in the players array above
    team: {
      // set what type of data we expect team to be
      type: TeamType,
      // parent refers to the data above team like name, id and teamID
      resolve(parent, args){
        // find the data with a fitler
        //[0] at the end so it gives us the last item of the array since filter returns a new array
        return teams.filter((team) => team.id == parent.teamID)[0]
      }
    }
  })
})

// custom Team type
const TeamType = new GraphQLObjectType({
  // we can name this whatever we want but Team makes sense
  name: 'Team',
  fields: () => ({
    team: {type: GraphQLString},
    location: {type: GraphQLString},
    id: {type: GraphQLID},
    // custom players field which will return all players for that team
    players: {
      // this new GraphQLList means it expects an array of data back rather than a single piece of data
      // we do this because we have multiple players on a single team
      type: new GraphQLList(PlayerType),
      // parent refers to the data above players like team, location and id
      // resolve is just a function that returns the type of data we want
      resolve(parent, args){
        return players.filter((player) => player.teamID == parent.id)
      }
    }
  })
})


// where the magic happens
const RootQuery = new GraphQLObjectType({
  name: 'RootQuery',
  // each item in the fields object is a spcific query we can execute
  fields: {
    // give us all the players
    players: {
      type: new GraphQLList(PlayerType),
      resolve(parent, args){
        return players
      }
    },
    // give us all the teams
    teams: {
      type: new GraphQLList(TeamType),
      resolve(parent, args){
        return teams
      }
    },
    // give us a single player we find by a passed in ID
    player: {
      type: PlayerType,
      args: {id: {type: GraphQLID}},
      resolve(parent, args){
        return players.filter((player) => player.id == args.id)[0]
      }
    },
    // find us a single team with a passed in ID
    team: {
      type: TeamType,
      args: {id: {type: GraphQLID}},
      resolve(parent, args){
        return teams.filter((team) => team.id == args.id)[0]
      }
    }
  }
})

// Mutations are how we manipulate data in GraphQL
const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    // add a single team
    addTeam: {
      type: TeamType,
      args: {
        team: {type: new GraphQLNonNull(GraphQLString)},
        location: {type: new GraphQLNonNull(GraphQLString)},
        id: {type: new GraphQLNonNull(GraphQLID)}
      },
      resolve(parent, args){
        // destructuring some variables off of args
        const {team, location, id} = args
        const newTeam = {
          team,
          location,
          id
        }
        // add the new team to the teams array
        teams.push(newTeam)
        // send back the new team
        return teams[teams.length - 1]
      }
    },
    // add a single player
    addPlayer: {
      type: PlayerType,
      args: {
        name: {type: new GraphQLNonNull(GraphQLString)},
        teamID: {type: new GraphQLNonNull(GraphQLID)},
        id: {type: new GraphQLNonNull(GraphQLID)}
      },
      resolve(parent, args){
        const {name, teamID, id} = args
        const player = {
          name,
          teamID,
          id
        }
        players.push(player)
        return players[players.length - 1]
      }
    }
  }
})

// export our schema to use in index.js
module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
})