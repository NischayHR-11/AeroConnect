const { string } = require("joi");
const mongoose=require("mongoose");
const Schema = mongoose.Schema;
const passportlocalmongoose=require("passport-local-mongoose");
const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    dob: { type: Date},
    fullname: { type: String},
    passport: { type: String },
    phone_number: { type: String },
    type: { type: String },
    bookings:[{type: Schema.Types.ObjectId, ref: 'Booking'},],
})

userSchema.plugin(passportlocalmongoose);

module.exports=mongoose.model("User",userSchema);