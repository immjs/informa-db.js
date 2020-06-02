module.exports.deleteId = (val) => {
  const v = val;
  delete v._id;
  return v;
};

module.exports.throwErrorIfError = (err) => {
  if (err) {
    throw err;
  }
};

module.exports.jsonContentWithFind = async (content, find) => {
  return JSON.parse(JSON.stringify(await content.find(find).toArray()));
};
module.exports.jsonContent = async (content) => {
  return JSON.parse(JSON.stringify(content));
};

module.exports.tryMongo = () => {
  try {
    mongo = require('mongodb');

    MongoClient = mongo.MongoClient;
  } catch (err) {
    mongo = null;
    MongoClient = null;
  }
  return { mongo, MongoClient };
};

module.exports.spliceOrDelete = (obj, prop) => {
  _obj = obj;
  try {
    _obj.splice(prop, 1);
  } catch (err) {
    delete _obj[prop];
  }
  return _obj;
};
