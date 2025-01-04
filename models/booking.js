const { date } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// Booking Schema
const bookingSchema = new Schema({
    flight_id: { type: Schema.Types.ObjectId, ref: 'Flight', required: true },
    from: { type: String, required: true },
    destination: { type: String, required: true },
    arrivaltime:{ type: String, required: true },
    departuretime:{ type: String, required: true },
    seat_number: { type: String, required: true },
    status: { type: String,default:"Booked", required: true },
    booking_date: { type: Date,default:Date.now, required: true },
    terminal_no: { type: String},
    amount: { type: Number, required: true },
});

const Booking=mongoose.model("Booking",bookingSchema);

module.exports=Booking;