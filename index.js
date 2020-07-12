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
class BaseDb {
  constructor(settings) {
    this.saveOnChange = false;
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
      get: (obj, prop) => (typeof obj[prop] === 'object' || Array.isArray(obj[prop]) ?
        this.genProxy(obj[prop]) :
        obj[prop]),
    });
  }
}
/**
 * Class represents the concept to interact with storage units (such as Dbs or JSON files) by defining a proxy property.
 */
class LocaleDb extends BaseDb {
  constructor(settings) {
    super();
    //Extends is a pai
    const {
      path,
      defaultStr
    } = settings;
    if (!path) throw new Error('No path provided');
    if (typeof path !== 'string') throw new Error('Provided path is not a string');
    this.path = path;
    if (!fs.existsSync(path)) {
      fs.writeFileSync(path, defaultStr || '{}', (err) => {
        if (err) {
          throw err;
        }
      });
    }
    this.readOnlyValue = JSON.parse(
      fs.readFileSync(path, 'utf8')
    );
  }
  /**
   * async Updates the file/db to this.readOnlyValue
   * @returns {any}  - The database/jsonfile
   */
  update() {
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
    super()
    const {
      path,
      db: dbProp,
      collection: collectionProp
    } = settings;
    if (!path) throw new Error('No path provided');
    if (typeof path !== 'string') throw new Error('Provided path is not a string');
    const dis = this;
    return (async () => {
      dis.path = path;
      if (!mongo) {
        throw new Error('Mongodb is not installed. Please install it.');
      }
      dis.client = await MongoClient.connect(path, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      let db = dbProp||'db';
      let collection = collectionProp||'collection';
      if (!(await dis.client.db().admin().listDatabases()).databases.some((v) => v.name === db)) {
        throw new Error(`'${db}' is not a valid db.`);
      }
      dis.collection = dis.client.db(db);
      if (!(await (await dis.client.db(db || 'infodbs').listCollections()).toArray()).some((v) => v.name === collection)) {
        throw new Error(`'${collection}' is not a valid collection.`);
      }
      dis.collection = dis.collection.collection(collection);
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
      process.on('exit', () => dis.client.close);
      setInterval()
      return dis;
    })();
  }
  /**
   * async Updates the file/db to this.readOnlyValue
   * @returns {any}  - this.value
   */
  async update() {
    this.props.rawContent.forEach(async (val) => {
      await this.props.collection.deleteOne({
        _id: new mongo.ObjectID(val._id)
      });
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
    ).map((val) => {
      const v = val;
      delete v._id;
      return v;
    });
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
  LocaleDb
};