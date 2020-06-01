# Informa-Db.js
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->
## Concept
The concept is to interact with storage units (such as Dbs or JSON files) by using javascript proxies.
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
    players.value[process.env.PLAYER]={
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
Will throw an error if none provided or if type is incorrect
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
### Db class
#### Db.readOnlyValue<Any>
File/collection content
#### Db.value<Proxy<Any>>
Proxy to this.readOnlyValue
#### Db.saveOnChange<Boolean>
If is true, runs this.update() everytime a change is made (this.add(), this.addOverwrite(), this.remove() and changing this.value )
#### Db.exist(index<Number, String>)<Boolean>
Checks if this.readOnlyValue[index] exists
#### Db.addSafe(index<Number, String>, value<Any>)<Boolean, Any>
Defines this.readOnlyValue[index] to value.
If this.readOnlyValue[index] already exists, will ignore and return false.
#### Db.add(index<Number, String>, value<Any>)<Any>
Defines this.readOnlyValue[index] to value.
#### Db.remove(index<Number, String>)<Undefined>
Splices out/deletes this.readOnlyValue[index]
#### Db.update()<Any>
Updates the file/db to this.readOnlyValue

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/informathemusic"><img src="https://avatars3.githubusercontent.com/u/39065949?v=4" width="100px;" alt=""/><br /><sub><b>informathemusic</b></sub></a><br /><a href="https://github.com/informathemusic/informa-db.js/commits?author=informathemusic" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/wolfpat01"><img src="https://avatars1.githubusercontent.com/u/57036855?v=4" width="100px;" alt=""/><br /><sub><b>Haouari haithem</b></sub></a><br /><a href="https://github.com/informathemusic/informa-db.js/commits?author=wolfpat01" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!