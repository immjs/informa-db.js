module.exports.deleteId=(val)=>{
    
    const v = val;
    delete v._id;
    return v;
}