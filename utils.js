module.exports.deleteId = (val)=>{
    
    const v = val;
    delete v._id;
    return v;
}

module.exports.throwErrorIfError = (err) => {

    if (err) {

      throw err;
    }
} 