import mongoose from 'mongoose'

// Defining how the data is gonna be build - Data Structure

const whatsappSchema = mongoose.Schema({
    message: String,
    name: String,
    timestamp: String,
    received: Boolean,
});

// this is refering to the collection (msgCollection)
export default mongoose.model("messageContent", whatsappSchema);