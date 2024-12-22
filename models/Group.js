const mongoose = require('mongoose');

const GroupSchema = mongoose.Schema({
   craetorId:{
     type:mongoose.Schema.Types.ObjectId,
     ref:'User',
     required: true
   },
   name:{
     type:String,
     required :true
   },
   image:{
    type:String,  
    required:true
   },
   limit:{
    type:Number,
    required:true
   },
   members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Member references
},{
    Timestamp:true
});


module.exports = mongoose.model('Group' , GroupSchema)