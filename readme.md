# Informa-Db.js
## Concept
The concept is to interact with storage units (such as Dbs or JSON files) by defining variables.
## How to install it:
`npm i informa-db.js`
## How to use it:
Here's a code example on how to use it:
```js
const Db = require('informa-db.js'); // Require the package

(async ()=>{
  const players = await new Db("players.json"); // Uses data.json to store data
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
  if(!players.value[process.env.PLAYER])
    players[process.env.PLAYER]={
      inventory: Array(20),
      equipment: Array(5),
      temporaryData: {
        hp: 20,
        xp: 0
      }
    };
})()
```
Before you ask, those all work.
## Docs
### new Db( path<String>, defaultString<String>, isMongo<Boolean>, db<String>, collection<String> )
#### path
Path to file or URI to mongodb server.
Will throw an error if none provided
#### defaultString
Default string to write on file if it doesn't exist.
Defaults to '{}'
Will be ignored if this.isMongo is truthy (See isMongo<Boolean>)
#### isMongo<Boolean>
Boolean indicating whether the provided path is a file or a mongodb server
Defaults to true if the path starts with "mongodb", false otherwise.

Notice: If you need to interact with a mongodb server, you need to install mongodb yourself
#### db<String>
Database name, defaulting to "infodbs"
#### collection<String>
Collection name, defaulting to "db"
### Db function and properties
#### Db.readOnlyValue<Any>
File/collection content
#### Db.value<Proxy<Any>>
Proxy to this.readOnlyValue
#### Db.saveOnChange<Boolean>
If is true, runs this.update() everytime a change is made (this.add(), this.addOverwrite(), this.remove() and changing this.value )
#### Db.exist(index<Number, String>)<Boolean>
Checks if this.readOnlyValue[index] exists
#### Db.add(index<Number, String>, value<Any>)<Boolean, Any>
Defines this.readOnlyValue[index] to value.
If this.readOnlyValue[index] already exists, will ignore and return false.
#### Db.addOverwrite(index<Number, String>, value<Any>)<Any>
Defines this.readOnlyValue[index] to value.
#### Db.remove(index<Number, String>)<Undefined>
Splices out/deletes this.readOnlyValue[index]
#### Db.update()<Any>
Updates the file/db to this.readOnlyValue