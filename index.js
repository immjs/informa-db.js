const fs = require('fs');
const utils = require('./utils');

const { mongo, MongoClient } = utils.tryMongo();

class BaseDb {
  constructor(settings) {}
  /**
   * Checks if this.readOnlyValue[index] exists
   * @param {number} index - the index in the dataBase/jsonfile
   */
  exist(index) {
    return !!this.readOnlyValue[index];
  }
  /**
   * Defines this.readOnlyValue[index] to value.
   * If this.readOnlyValue[index] already exists, will throw an error
   * @param {number} index - index in the dataBase/jsonfile
   * @param {any} newValue - the new value
   */
  addSafe(index, value) {
    if (this.exist(index)) {
      throw console.error(`this.readOnlyValue[${index}] already exists`);
    }

    if (this.saveOnChange) {
      this.update()[index];
    }
  }

  /**
   * Splices out/deletes this.readOnlyValue[index]
   * @param {number} index - the index in the dataBase/jsonfile
   */
  remove(index) {
    this.readOnlyValue.splice(index, 1);
    return undefined;
  }

  /**
   * Defines this.readOnlyValue[index] to value.
   * @param {number} index - index in the dataBase/jsonfile
   * @param {any} newValue - the new value
   */
  add(index, newValue) {
    this.readOnlyValue[index] = newValue;

    if (this.saveOnChange) {
      return this.update(this.readOnlyValue)[index];
    }

    return newValue;
  }

  genProxy(data) {
    return new Proxy(data, {
      set: (obj, prop, val) => {
        obj[prop] = val;
        if (this.saveOnChange) {
          this.update();
        }
        return true;
      },

      deleteProperty: (pObj, prop) => {
        let obj = pObj;
        obj = utils.spliceOrDelete(obj, prop);

        if (this.saveOnChange) {
          this.update();
        }

        return true;
      },

      get: (obj, prop) =>
        typeof obj[prop] === 'object' || Array.isArray(obj[prop])
          ? this.genProxy(obj[prop])
          : obj[prop],
    });
  }
}

/**
 * Class represents the concept to interact with storage units (such as Dbs or JSON files) by defining a proxy property.
 */
class LocaleDb extends BaseDb {
  constructor(settings) {
    super();
    //Extends is a pain
    const { path, defaultStr } = settings;

    if (!path) throw new Error('No path provided');
    if (typeof path !== 'string') throw new Error('Provided path is not a string');
    const dis = this;

    return (() => {
      dis.path = path;

      if (!fs.existsSync(path)) {
        fs.writeFileSync(path, defaultStr || '{}', utils.throwErrorIfError);
      }

      dis.readOnlyValue = JSON.parse(fs.readFileSync(path, 'utf8'));

      dis.saveOnChange = true;
      return dis;
    })();
  }
  /**
   * async Updates the file/db to this.readOnlyValue
   * @returns {any}  - The database/jsonfile
   */
  async update() {
    fs.writeFileSync(this.path, JSON.stringify(this.readOnlyValue, null, '\t'));
    return this.readOnlyValue;
  }

  /**
   * @type {any}
   */
  set value(setTo) {
    this.readOnlyValue = setTo;

    if (this.saveOnChange) {
      this.update();
    }

    return true;
  }
  get value() {
    return this.genProxy(this.readOnlyValue);
  }
}
class RemoteDb extends BaseDb {
  constructor(settings) {
    super();
    const { url, db, collection } = settings;

    if (!url) throw new Error('No path provided');
    if (typeof url !== 'string') throw new Error('Provided path is not a string');
    const dis = this;

    return (async () => {
      dis.path = url;

      if (!mongo) {
        throw new Error('Mongodb is not installed. Please install it.');
      }

      dis.client = await MongoClient.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      let db = dbProp || 'informadb-dbs';
      let collection = collectionProp || 'db';

      const disListDatabase = dis.client.db().admin().listDatabases();
      if (!db) {
        if (!(await dislistdatabase).databases.some((v) => v.name === 'infodbs')) {
          throw new Error("'infodbs' is not a valid db.");
        }

        dis.collection = dis.client.db('infodbs');
      } else {
        if (!(await dislistdatabase).databases.some((v) => v.name === db)) {
          throw new Error(`'${db}' is not a valid db.`);
        }

        dis.collection = dis.client.db(db);
      }
      if (!collection) {
        if (
          !(await (await dis.client.db(db || 'infodbs').listCollections()).toArray()).some(
            (v) => v.name === 'db'
          )
        ) {
          throw new Error("'db' is not a valid collection.");
        }

        dis.collection = dis.collection.collection('db');
      } else {
        if (
          !(await (await dis.client.db(db || 'infodbs').listCollections()).toArray()).some(
            (v) => v.name === collection
          )
        ) {
          throw new Error(`'${collection}' is not a valid collection.`);
        }

        dis.collection = dis.collection.collection(collection);
      }

      dis.readOnlyValue = utils.jsonContentWithFind(this.collection, {});
      dis.rawContent = utils.jsonContent(dis.readOnlyValue);
      dis.readOnlyValue = dis.readOnlyValue.map(utils.deleteId);

      process.on('exit', dis.client.close);

      dis.saveOnChange = true;
      return dis;
    })();
  }
  /**
   * async Updates the file/db to this.readOnlyValue
   * @returns {any}  - the dataBase/jsonfile
   */
  async update() {
    this.props.rawContent.forEach(async (val) => {
      await this.props.collection.deleteOne({
        _id: new mongo.ObjectID(val._id),
      });
    });

    if (this.readOnlyValue.length > 0) this.collection.insertMany(this.readOnlyValue);

    this.rawContent = utils.jsonContentWithFind(this.collection, {});
    this.readOnlyValue = utils.jsonContent(this.rawContent).map(utils.deleteId);

    return this.readOnlyValue;
  }

  /**
   * @type {any}
   */
  set value(setTo) {
    this.readOnlyValue = setTo;

    if (this.saveOnChange) {
      this.update();
    }

    return true;
  }
  get value() {
    this.readOnlyValue = this.readOnlyValue.map((v) => {
      const r = v;
      delete r._id;
      return r;
    });
    return this.genProxy(this.readOnlyValue);
  }
}

module.exports = {
  RemoteDb,
  LocaleDb,
};
