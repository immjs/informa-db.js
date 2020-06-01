const fs = require('fs');

let mongo;
let MongoClient;
try {
  mongo = require('mongodb');

  MongoClient = mongo.MongoClient;
} catch (err) {
  mongo = null;
  MongoClient = null;
}

/**
 * Class represents the concept to interact with storage units (such as Dbs or JSON files) by defining a proxy property.
 */
class Db {

  /** 
   * Creates a new instance of Informa Db.
   * @param {string} path - Path to file or URI to mongodb server. Will throw an error if none provided or if type is incorrect
   * @param {string} defaultStr - Default string to write on file if it doesn't exist. Defaults to '{}' Will be ignored if this.isMongo is truthy (See isMongo)
   * @param {boolean} isMongo - Boolean indicating whether the provided path is a file or a mongodb server Defaults to true if the path starts with "mongodb", false otherwise.
   * @param {string} db - Database name, defaulting to "infodbs"
   * @param {string} collection - Collection name, defaulting to "db"
   */
  constructor(path, defaultStr, isMongo, db, collection) {
    
    this.genProxy = (data) => new Proxy(data, {

      set: (obj, prop, val) => {
        obj[prop] = val;
        if (this.saveOnChange) {
          this.update();
        }
        return true;
      },

      deleteProperty: (pObj, prop) => {
        const obj = pObj;

        try {
          obj.splice(prop, 1);
        } catch (err) {
          delete obj[prop];
        }

        if (this.saveOnChange) {
          this.update();
        }

        return true;
      },

      get: (obj, prop) => (typeof obj[prop] === 'object' || Array.isArray(obj[prop])
        ? this.genProxy(obj[prop])
        : obj[prop]),
    });

    if (!path) throw new Error('No path provided');
    if (typeof path !== 'string') throw new Error('Provided path is not a string');
    const dis = this;

    return (async () => {

      dis.path = path;
      dis.isMongo = typeof isMongo === 'boolean' ? isMongo : dis.path.startsWith('mongodb');

      if (dis.isMongo) {

        if (!mongo) {
          throw new Error('Mongodb is not installed. Please install it.');
        }

        dis.client = await MongoClient.connect(path, {

          useNewUrlParser: true,
          useUnifiedTopology: true,
        });

        if (!db) {
          if (!(await dis.client.db().admin().listDatabases()).databases.some((v) => v.name === 'infodbs')) {

            throw new Error('\'infodbs\' is not a valid db.');
          }

          dis.collection = dis.client.db('infodbs');
        } else {

          if (!(await dis.client.db().admin().listDatabases()).databases.some((v) => v.name === db)) {

            throw new Error(`'${db}' is not a valid db.`);
          }

          dis.collection = dis.client.db(db);
        }
        if (!collection) {

          if (!(await (await dis.client.db(db || 'infodbs').listCollections()).toArray()).some((v) => v.name === 'db')) {

            throw new Error('\'db\' is not a valid collection.');
          }

          dis.collection = dis.collection.collection('db');
        } else {

          if (!(await (await dis.client.db(db || 'infodbs').listCollections()).toArray()).some((v) => v.name === collection)) {

            throw new Error(`'${collection}' is not a valid collection.`);
          }

          dis.collection = dis.collection.collection(collection);
        }

        dis.readOnlyValue = JSON.parse(
          JSON.stringify(
            await dis.collection.find({}).toArray()
          )
        );
        dis.rawContent = JSON.parse(
          JSON.stringify(
            dis.readOnlyValue
          )
        );
        dis.readOnlyValue = dis.readOnlyValue.map((val) => {

          const v = val;
          delete v._id;
          return v;
        });

        process.on('exit', dis.client.close);
      } else {

        if (!fs.existsSync(path)) {

          fs.writeFileSync(path, defaultStr || '{}', (err) => {
            if (err) {
              throw err;
            }
          });
        }

        dis.readOnlyValue = JSON.parse(
          fs.readFileSync(path, 'utf8')
        );
      }

      dis.saveOnChange = true;

      return dis;
    })();
  }

  /**
   * Checks if this.readOnlyValue[index] exists
   * @param {number} index - the index in the dataBase/jsonfile
   */
  exist(index) {

    return !!this.readOnlyValue[index]
  }

  /**
   * async Updates the file/db to this.readOnlyValue
   * @returns {any}  - the dataBase/jsonfile
   */
  async update() {

    if (!this.isMongo) {

      fs.writeFileSync(this.path, JSON.stringify(this.readOnlyValue, null, '\t'));
      return this.readOnlyValue;
    }

    this.rawContent.forEach(async (val) => {

      await this.collection.deleteOne({ _id: new mongo.ObjectID(val._id) });
    });

    if (this.readOnlyValue.length > 0) this.collection.insertMany(this.readOnlyValue);
    this.rawContent = JSON.parse(
      JSON.stringify(
        await this.collection.find({}).toArray()
      )
    );
    this.readOnlyValue = JSON.parse(
      JSON.stringify(
        this.rawContent,
      ),
    ).map((val) => { const v = val; delete v._id; return v; });

    return this.readOnlyValue;
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
    if(this.isMongo){
      this.readOnlyValue = this.readOnlyValue.map((v) => { const r = v; delete r._id; return r; });
    }
    return this.genProxy(this.readOnlyValue);
  }
}

module.exports = Db;
