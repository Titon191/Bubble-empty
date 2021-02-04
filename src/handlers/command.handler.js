//////////////////////////////////////
//  ____        _     _     _       //
// |  _ \      | |   | |   | |      //
// | |_) |_   _| |__ | |__ | | ___  //
// |  _ <| | | | '_ \| '_ \| |/ _ \ //
// | |_) | |_| | |_) | |_) | |  __/ //
// |____/ \__,_|_.__/|_.__/|_|\___| //
//////////////////////////////////////
//      BUBBLE ENGINE v.1.0.1       //
//////////////////////////////////////
//          AUTHOR: TITON           //
//////////////////////////////////////
                                 

const { MessageEmbed, MessageAttachment } = require('discord.js');
const { readdirSync } = require("fs")
const { Collection } = require("discord.js")
const ascii = require("ascii-table")
const Canvas = require('canvas')
const { programers } = client.config
const table = new ascii().setHeading("Komenda","Status", "Uwagi")
const f = require(__dirname + "/../functions.js")
const { textPermissions } = f
const { type } = require('os');
const parse = require("parse-ms")
const { Database } = require("quickmongo");
const { Player } = require("discord-music-player");

// ============================== //
//         Moduły bota            //
// ============================== //


  // Baza danych - przechowuje dane
client.db = new Database(process.env.mongoUrl)

  // Komendy - odpowiada za wykonywanie komend
client.commands = new Collection()

  // musicPlayer - Odtwarza muzykę
client.musicPlayer = new Player(client, {
  leaveOnEmpty: false, 
})

module.exports = (client) => {


    // skraca client.db na db
  let db = client.db

    // Szuka plików z komendami (.cmd.js)
    const commandFiles = readdirSync(__dirname + "/../cmds").filter(file => file.endsWith(".cmd.js"))

    for (const file of commandFiles) {
        const command = require(__dirname + `/../cmds/${file}`)
        const errors = []
        
        if (command.name) {
            client.commands.set(command.name, command)
            if (!command.description) errors.push("⚠  Komenda nie posiada opisu!")
            if (!command.category && !command.devlvl) errors.push("⚠ Komenda nie posiada kategori!")
       
            if (command.args && command.args > 0 && !command.ussage) errors.push("⚠ Komenda wymaga argumentów, a nie zawiera pola 'ussage'")
            if(!errors.length) errors.push("Brak")
            table.addRow(file,"✅", errors.join(", "))
        } else {
            table.addRow(file,"❌ - brakuje pola 'name'", "<---")
            continue
        }
    }
    
    // Wyświetla tabelę komend.
    console.log(table.toString())



// Powitania i autorole
    client.on('guildMemberAdd', async member => {
    
     // Tutaj wstaw kod, który wykona sie po dołączeniu
     // członka na serwer
     
  });

  // Pożegnania
  client.on('guildMemberRemove', async member => {

   // Tutaj wstaw kod, który wykona sie po wyjściu
   // członka z serwera
   
     });



    client.on("message", async (msg) => {
      
        const { author, guild, channel } = msg
        
        // Ustaw prefix bota (Możliwe jest pobranie prefixu z bazy danych - dowiedz się więcej w dokumentacji)
          let prefix = "!"
     
     
        // Sprawdza, czy użytkownik jest botem.
        if (author.bot) {
          return
        }
        

        // Anty-invite
        if (!msg.member.hasPermission('ADMINISTRATOR')) {

// Wpisz "nie", jeśli chcesz wyłączyc ten moduł. (Możliwe jest pobranie statusu antyinvite z bazy danych - dowiedz się więcej w dokumentacji)
       let antyinvite = "tak" 
       
       
          if (antyinvite == 'tak') {
           
            if (msg.content.includes("discord.gg/")) {
            
              msg.delete()
              const emb = new MessageEmbed()
              .setTitle('⛔ Anty-invite')
              .setColor('RED')
              .setFooter(msg.author.tag, msg.author.displayAvatarURL())
              .setDescription(`Ten serwer jest chroniony modułem **anty-invite** - wszystkie zaproszenie do serwerów discord (oprócz tych wysłanych przez administratorów) są usuwane.`)
              return msg.channel.send(emb);
  
            } 
          }
  
        }
       
        // Ignoruje wiadomości bez prefixu.
        if (!msg.content.startsWith(prefix)) {
          return;
        }
      
        
      
        // Zmienna z argumentami.
       const args = msg.content.slice(prefix.length).trim().split(/ +/g)
  

        // Zmienna z komendą.
        const cmdName = args.shift().toLowerCase()
        const cmd =
        client.commands.get(cmdName) ||
        client.commands.find(
          (cmd) => cmd.aliases && cmd.aliases.includes(cmdName),
        )
  
        
      // Sprawdza, czy komenda istnieje
      if (!cmd) return

   
        
        if (cmd.guildOnly && !guild) {
            return msg.channel.send(":no: Ta komenda nie jest możliwa do użycia w wiadomości prywatnej..")
        }

        //===================================================
        //
        //              Sprawdza uprawnienia
        //
        //===================================================

        // Sprawdza uprawnienia bota
        if (cmd.botPermissions && cmd.botPermissions.length) {
          if (!guild.me.permissionsIn(channel).has(cmd.botPermissions)) {
            const noperm = new MessageEmbed()
            .setTitle('Bot nie ma uprawnień')
            .setColor('RED')
            .setDescription(`:no: Bot nie posiada uprawnień do wykonania tej komendy\nWymagane uprawnienia: **${f.textPermissions(cmd.userPermissions).toUpperCase()}**`)
            .setFooter(`${msg.author.tag}`, msg.author.displayAvatarURL())
            return channel.send(noperm)
          }
        }
        
        // Sprawdza uprawnienia użytkownika
        if (cmd.userPermissions && cmd.userPermissions.length) {
          if(!msg.member.permissionsIn(channel).has(cmd.userPermissions) && !programers.includes(msg.author.id)) {
            const noperm = new MessageEmbed()
            .setTitle('Nie posiadasz uprawnień')
            .setColor('RED')
            .setFooter(`${msg.author.tag}`, msg.author.displayAvatarURL())
            .setDescription(`:no: Nie posiadasz wystarczających uprawnień do wykonania tej komendy\nWymagane uprawnienia: **${f.textPermissions(cmd.userPermissions).toUpperCase()}**`)
            return channel.send(noperm)
          }
        }


        // Sprawdza, czy argumenty są wymagane i czy zostały podane
        if (cmd.args && args.length < cmd.args ) {
            let reply =  ":no: Podaj argumenty."

            if (cmd.ussage) {
               if (typeof(cmd.ussage) === "string") {
                reply = reply + `\nPoprawne użycie: \`${msg.prefix}${cmdName} ${cmd.ussage}\``
               } else {
                reply += "\nPoprawne użycie: " + cmd.ussage.map(u => `\`${msg.prefix}${cmdName} ${u}\``).join(" lub ")
               }
               if (cmd.example) {
                   if (typeof(cmd.example) === "string") {
                   reply += `\nNa przykład: \`${msg.prefix}${cmdName} ${cmd.example}`
                   } else {
                       reply += "\nNa przykład: " + cmd.example.map(e => `\`${msg.prefix}${cmdName} ${e}\``).join(" lub ")
                   }
               }
            }
            
            const errembed = new MessageEmbed()
            .setTitle("Wystąpił błąd")
            .setDescription(reply)
            .setColor('#00ff77')
            return msg.channel.send(errembed)
            
        }
   
        try {
           cmd.run(msg, args, cmdName)
        } catch(error) {
          // Wysyła informacje o błędzie
            console.log(error)
         
            channel.send("Podczas wykonywania tej komendy wystąpił błąd. Raport z tym błędem został wysłany do programistów bota, którzy postarają się go jak najszybciej naprawić. ")
         
            const embed = new MessageEmbed()
            .setColor()
            .setTitle("Błąd")
            .setDescription(`**Typ błędu:** bład podczas wykonywania komendy. \n**Komenda:** ${cmd.name} \n**Użytkownik:** <@${msg.author.id}> \n**Rodzaj kanału:** ${msg.channel.type === "text" ? "serwer" : "DM"}`)

            w.send(embed)
            channel.send("Wystąpił błąd!")
            
        }
           
        
      
    
      
      
        
        
      
              
              
               
      })
}
