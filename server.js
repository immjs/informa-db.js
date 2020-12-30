const fs = require('fs');

const DbUtils = require('./utils');

class Db {
  constructor(path, settings = {}) {
    settings.soc = settings.soc ?? settings.saveOnChange ?? true;
    this.saveOnChange = settings.soc;
    this.saveSpace = settings.saveSpace;
    if (!settings.exportThis && !settings.soc) throw new Error('Cannot have saveOnChange disabled without exportThis enabled');

    if (!path) throw new Error('No path provided');
    if (typeof path !== 'string') throw new Error('Provided path is not a string');
    this.path = path;

    if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify(settings.defaultValue) ?? '{}', (e) => { if (e) throw e; });

    if (fs.readFileSync(path, 'utf8') === '') fs.writeFileSync(path, JSON.stringify(settings.defaultValue) ?? '{}', (e) => { if (e) throw e; });

    this.readOnlyValue = JSON.parse(fs.readFileSync(path, 'utf8'));
    if (!settings.exportThis || settings.exportThis == null) return this.value;
  }

  genProxy(data, saveOnChange, update) {
    return new Proxy(data, {
      set: (obj, prop, val) => {
        obj[prop] = val;
        if (saveOnChange) {
          update();
        }
        return true;
      },
      deleteProperty: (obj, prop) => {
        delete obj[prop];
        if (saveOnChange) {
          update();
        }
        return true;
      },
      get: (obj, prop) => (
        typeof obj[prop] === 'object' && obj[prop]
          ? this.genProxy(obj[prop])
          : obj[prop]
      ),
    });
  }

  /**
   * async Updates the file/db from this.readOnlyValue
   * @returns {any}  - The json file
   */
  update() {
    fs.writeFileSync(this.path, JSON.stringify(this.readOnlyValue, null, this.saveSpace ? null : '\t'));
    return this.readOnlyValue;
  }

  /**
   * @type {any}
   * @returns {true}
   */
  set value(setTo) {
    this.readOnlyValue = setTo;
    if (this.saveOnChange) {
      this.update();
    }
    return true;
  }

  /**
   * @type {any}
   * @returns {true}
   */
  get value() {
    return this.genProxy(this.readOnlyValue);
  }
}

module.exports = { Db, DbUtils };
