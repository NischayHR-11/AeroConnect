// Customer Schema
const { number, required } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Flight Schema
const flightSchema = new Schema({
    airline_company: { type: String, required: true },
    aircraftModel: { type: String, required: true },
    flightname: { type: String, required: true },
    last_service_date: { type: Date, required: true },
    arrival:{ type: Schema.Types.ObjectId, ref: 'Arrival' },
    departures:{ type: Schema.Types.ObjectId, ref: 'Departure' },
    staffs:[{type: Schema.Types.ObjectId, ref: 'Staff'},],
    amount:{type:Number,default:0,required:true}
});

const Flight=mongoose.model("Flight",flightSchema);

module.exports=Flight;

