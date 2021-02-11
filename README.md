# Informa-Db.js
*Now with browser support*

[![NPM](https://nodei.co/npm/informa-db.js.png)](https://npmjs.org/package/informa-db.js)
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

### Dont forget to read the [LICENSE](LICENSE) 

## Concept
The concept is to interact with JSON files based databases by using javascript proxies.
### Installation:
`npm i --save informa-db.js`
### Usage:
Here's a code example on how to use it:
```js
const { Db, DbUtils } = require('informa-db.js');

const players = new Db('players.json');

if (!players[process.env.PLAYER]) players[process.env.PLAYER] = {
  inventory: Array(20),
  equipment: Array(5),
  hp: 20,
  xp: 0,
};

const wordDocument = new Db('calculations.json', { saveOnChange: false, exportThis: true });
// Won't work if you destructure
wordDocument.value.aaa = 123456;
wordDocument.value.bbb = wordDocument.value.aaa ** 2;

wordDocument.value.aaa >>= 2;
wordDocument.value.aaa <<= 3;
wordDocument.value.bbb >>= Math.floor(30 * Math.random());
console.log(wordDocument.value);

wordDocument.update();
wordDocument.value.aaa <<= 3;
wordDocument.value.bbb >>= Math.floor(30 * Math.random());
console.log(wordDocument.value);
```

All of the following also applies to the browser version

## Documentation
### `new Db( path<String>, settings<Object> )`
#### `settings.soc<Boolean>` (Or `settings.saveOnChange<Boolean>`)
Whether to save once the value changes
Has to be used with enableThis
#### `settings.enableThis<Boolean>`
Whether to return the entire class or only the value.
#### `settings.path<String>`
Path to file.
Will throw an error if none provided or if type is incorrect
#### `settings.defaultValue<Any>`
Default string to write on file if it doesn't exist.
Defaults to `{}`
#### `settings.saveSpace<Any>`
Wether not to indent on file save
Defaults to `false`

--
The following applies only if `settings.enableThis` was set to `true`

#### `this.update()`
Saves `this.value` to the file named `settings.path`
#### `this.value`
Content of the batabase
#### `this.readOnlyValue`
`this.value` without the listeners
### `DbUtils`
#### `DbUtils.setAllTo( DB<Db>, setTo<Object/Array> )`
"Resets" or sets the entire DB to a `setTo`

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
