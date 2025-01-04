const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const arrivalSchema = new Schema({
    scheduledTime: { type: String, required: true },
    arrivalTime: { type: String,required:true},
    terminal: { type: String, required: true },
    from: { type: String, required: true },
});

const Arrival=mongoose.model("Arrival",arrivalSchema);

module.exports=Arrival;