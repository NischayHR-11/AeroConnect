const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Departure Schema
const departureSchema = new Schema({
    scheduledDepartureTime: { type: String, required: true },
    departureTime: { type: String,required:true },
    terminal: { type: String, required: true },
    destination: { type: String, required: true },
});

const Departure=mongoose.model("Departure",departureSchema);

module.exports=Departure;