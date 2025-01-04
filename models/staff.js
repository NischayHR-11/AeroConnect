const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Staff Schema
const staffSchema = new Schema({

    flightname:{ type: String, required: true },
    fullname: { type: String, required: true },
    email: { type: String, required: true },
    phone_number: { type: Number, required: true },
    role: { type: String, enum: ['Pilot', 'Co_Pilot', 'Flight Attendant', 'Ground_Staff', 'Customer_Support'], required: true },
    working_terminal: { type: String },
    shift_start_time: { type: String, required: true },
    shift_end_time: { type: String, required: true },
});

const Staff=mongoose.model("Staff",staffSchema);

module.exports=Staff;