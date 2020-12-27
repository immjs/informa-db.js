module.exports = {
  setAllTo(db, setTo) {
    Object.keys(db).forEach((k) => delete db[k]);
    Object.keys(setTo).forEach((k) => { db[k] = setTo[k]; });
  },
  genProxy(data) {
    return new Proxy(data, {
      set: (obj, prop, val) => {
        obj[prop] = val;
        if (this.saveOnChange) {
          this.update();
        }
        return true;
      },
      deleteProperty: (obj, prop) => {
        delete obj[prop];
        if (this.saveOnChange) {
          this.update();
        }
        return true;
      },
      get: (obj, prop) => (
        typeof obj[prop] === 'object' && obj[prop]
          ? this.genProxy(obj[prop])
          : obj[prop]
      ),
    });
  },
};
