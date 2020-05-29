const fs = require('fs');

let MongoClient;

class Db {
  constructor(file, defaultStr, isMongo, db, collection) {
    this.genProxy = (data) => new Proxy(data, {
      set: (pObj, prop, val) => {
        const obj = pObj;
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
        ? this.genProxy(obj[prop].map((val) => { const v = val; delete v._id; return v; }))
        : obj[prop]),
    });
    if (!file) throw new Error('No path provided');
    const dis = this;
    return (async () => {
      dis.path = file;
      dis.isMongo = typeof isMongo === 'boolean' ? isMongo : dis.path.startsWith('mongodb');
      if (dis.isMongo) {
        MongoClient = (await import('mongodb')).default.MongoClient;
        dis.client = await MongoClient.connect(file, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        if (!db) {
          if (!(await dis.client.db().admin().listDatabases()).databases.some((v) => v.name === 'infodbs')) {
            throw new Error('\'infodbs\' is not a valid db.');
          }
          dis.collection = dis.client.db('infodbs');
        } else {
          if (
            !(await dis.client.db().admin().listDatabases()).databases.some((v) => v.name === db)
          ) {
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
        dis.readOnlyValue = JSON.parse(JSON.stringify(await dis.collection.find({}).toArray()));
        dis.rawContent = JSON.parse(JSON.stringify(dis.readOnlyValue));
        dis.readOnlyValue = dis.readOnlyValue.map((val) => {
          const v = val;
          delete v._id;
          return v;
        });
        process.on('exit', dis.client.close);
        dis.value = dis.genProxy(dis.readOnlyValue);
      } else {
        if (!fs.existsSync(file)) {
          fs.writeFileSync(file, defaultStr ?? '{}', (err) => {
            if (err) {
              throw err;
            }
          });
        }
        dis.readOnlyValue = JSON.parse(fs.readFileSync(file, 'utf8'));
        dis.value = dis.genProxy(dis.readOnlyValue);
      }
      dis.saveOnChange = true;
      return dis;
    })();
  }

  exist(index) {
    if (!this.readOnlyValue[index]) {
      return false;
    }
    return true;
  }

  async update() {
    if (!this.isMongo) {
      fs.writeFileSync(this.path, JSON.stringify(this.readOnlyValue, null, '\t'));
      return this.readOnlyValue;
    }
    this.rawContent.forEach((val) => {
      this.collection.deleteOne({ _id: val._id });
    });
    if (this.readOnlyValue.length > 0) this.collection.insertMany(this.readOnlyValue);
    this.rawContent = JSON.parse(JSON.stringify(await this.collection.find({}).toArray()));
    this.readOnlyValue = JSON.parse(
      JSON.stringify(
        this.rawContent,
      ),
    ).map((val) => { const v = val; delete v._id; return v; });
    this.value = this.genProxy(this.readOnlyValue);
    return this.readOnlyValue;
  }

  add(index, pseudoValue) {
    if (!this.exist(index)) {
      this.readOnlyValue[index] = pseudoValue;
    } else {
      return false;
    }
    if (this.saveOnChange) {
      return this.update()[index];
    }
    return pseudoValue;
  }

  remove(index) {
    this.readOnlyValue.splice(index, 1);
    return undefined;
  }

  addOverWrite(index, pseudoValue) {
    this.readOnlyValue[index] = pseudoValue;
    if (this.saveOnChange) {
      return this.update(this.readOnlyValue)[index];
    }
    return pseudoValue;
  }
}
module.exports = Db;
// Hey u still here?
//
