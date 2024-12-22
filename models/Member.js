const mongoose = require('mongoose');

const MemberSchema = mongoose.Schema({
   groupId:{
     type:mongoose.Schema.Types.ObjectId,
     ref:'Group'
   },
   userId:{
     type:mongoose.Schema.Types.ObjectId,
     ref:'User'
   },
   message:{
    type:String,
    required:true
   },
   
},{
    Timestamp:true
});


module.exports = mongoose.model('Member' , MemberSchema)