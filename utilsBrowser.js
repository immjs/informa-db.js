export default {
  setAllTo(db, setTo) {
    if (db.splice) db.splice(0, db.length, ...setTo);
    else {
      Object.keys(db).forEach((k) => delete db[k]);
      Object.keys(setTo).forEach((k) => { db[k] = setTo[k]; });
    }
  },
};
