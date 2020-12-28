module.exports = {
  setAllTo(db, setTo) {
    Object.keys(db).forEach((k) => delete db[k]);
    Object.keys(setTo).forEach((k) => { db[k] = setTo[k]; });
  },
};
