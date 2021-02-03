const log = console.log
const chalk = require("chalk")
const { Collection } = require("discord.js")

module.exports = {
    name: "ready",

    run() {
 
 
        log(chalk.green(`Zalogowano jako`),chalk.blue(`${client.user.tag}`),chalk.green("!"))
        log(chalk.green('Pomyślnie uruchomiono bota.'))
        client.user.setActivity(`@Botname || ${client.guilds.cache.size} serwerów`, { type: "WATCHING" })
      
    }
}
