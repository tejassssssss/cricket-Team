const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()

let db = null
const dbPath = path.join(__dirname, 'cricketTeam.db')

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    console.log('Database connected successfully')
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

// API 1

app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
    SELECT
      player_id AS playerId, 
      player_name AS playerName, 
      jersey_number AS jerseyNumber,
      role AS role 
    FROM cricket_team;
    `

  const playersArray = await db.all(getPlayersQuery)
  response.send(playersArray)
})

// API 3

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
    SELECT
      player_id AS playerId, 
      player_name AS playerName, 
      jersey_number AS jerseyNumber, 
      role AS role 
    FROM 
      cricket_team 
    WHERE 
      player_id = ?;`

  try {
    const getPlayer = await db.get(getPlayerQuery, [playerId])

    // If player is found, return the player details
    if (getPlayer) {
      response.send(getPlayer)
    } else {
      // If player is not found, return a 404 with an appropriate message
      response.status(404).send({error: 'Player not found'})
    }
  } catch (error) {
    // If there's a server/database error, return a 500 status code
    response.status(500).send({error: 'Server error'})
  }
})

//API 2
app.post('/players/', express.json(), async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body // Extract values from the request body

  const createPlayerQuery = `
    INSERT INTO cricket_team (player_name, jersey_number, role)
    VALUES (?, ?, ?);
  `

  try {
    await db.run(createPlayerQuery, [playerName, jerseyNumber, role]) // Execute the query with data
    response.send('Player Added to Team')
  } catch (error) {
    response.status(500).send({error: 'Failed to add player'})
  }
})

// Initialize database connection
initializeDBAndServer()

module.exports = app
