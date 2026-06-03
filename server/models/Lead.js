
const mongoose=require('mongoose');
module.exports=mongoose.model('Lead',new mongoose.Schema({
name:{type:String,required:true},
email:{type:String,required:true},
phone:String,company:String,
status:{type:String,enum:['New','Contacted','Qualified','Converted','Lost'],default:'New'},
notes:String,
createdDate:{type:Date,default:Date.now}
},{timestamps:true}));
