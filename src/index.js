const { Client, Intents } = require("discord.js")
const intents = new Intents([
    Intents.NON_PRIVILEGED, 
    "GUILD_MEMBERS",
    "GUILD_PRESENCES", 
]);

global.client = new Client({ ws: { intents } });
client.config = require("./config/config.js")


// Command handler, eventHandler, apiHandler (BETA)
const commandHandler = require("./handlers/command.handler")
const eventHandler = require("./handlers/event.handler")
const apiHandler = require("./handlers/api.handler.js")




// Wczytuje commandHandler
commandHandler(client)
//Wczytuje eventHandler
eventHandler(client)
//Wczytuje apiHandler
apiHandler(client)

// Loguje się na token podany w pliku .env
client.login(process.env.token)

// Po uruchomieniu
client.on("ready", () => {
    client.guilds.cache.forEach(async guild => {
      const data = await client.db.get(guild.id) || null
      if (data === null) await client.db.set(guild.id, {})
    })
  })

process.on('uncaughtException', err =>  console.log('Caught exception:' + err));

