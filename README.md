# Informa-Db.js
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->
## Concept
The concept is to interact with storage units (such as Dbs or JSON files) by using javascript proxies.
## How to install it:
`npm i --save informa-db.js`
## How to use it:
Here's a code example on how to use it:
```js
const {LocaleDb} = require('informa-db.js'); // Require the package

const players = new LocaleDb("players.json"); // Uses data.json to store data
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
```
Before you ask, those all work.
## Docs
### new LocaleDb( options{path<String>, defaultString<String>}<Object> )
#### options.path<String>
Path to file.
Will throw an error if none provided or if type is incorrect
#### options.defaultString<Sting>
Default string to write on file if it doesn't exist.
Defaults to '{}'
### new RemoteDb( options{path<String>, db<String>, collection<String>}<Object> )
#### options.path<String>
URI to mongo db server.
Will throw an error if none provided or if type is incorrect
Boolean indicating whether the provided path is a file or a mongodb server
Defaults to true if the path starts with "mongodb", false otherwise.

Notice: If you need to interact with a mongodb server, you need to install mongodb yourself
#### options.db<String>
Database name, defaulting to "db"
#### options.collection<String>
Collection name, defaulting to "collection"

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