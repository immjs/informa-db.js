/*const { RemoteDb, LocaleDb } = require('./index.js');
(async ()=>{
    const players = await new LocaleDb({ path: "players.json" }); // Uses data.json to store data
    console.log(process.env.PLAYER)
    // I implemented these functions but they're boring:
    if (!players.exist(process.env.PLAYER))
      players.add(process.env.PLAYER,{
        inventory: Array(20),
        equipment: Array(5),
        temporaryData: {
          hp: 20,
          xp: 0
        }
      });
    
    // Instead, use this more elegant way of doing it:
    if(!players.value[process.env.PLAYER]&&process.env.PLAYER)
      players.value[process.env.PLAYER]={
        inventory: Array(20),
        equipment: Array(5),
        temporaryData: {
          hp: 20,
          xp: 0
        }
      };
  })()*/
const { LocaleDb } = require('./index');

let l = new LocaleDb({path: 'test.json'});
l.value.number = 444444; // nothing show up in the file
l.value.name = 44; // error
l.value.wow = 'there you go';
console.log(l.value);