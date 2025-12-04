import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        unique: true
    },
    name:{
        type: String,
        required: true
    },
    image:{
        type: String,
        required: true
    },
    clerkId:{
        type: String,
        required: true,
        unique: true
    }
}, {timeStamps: true});

export const User = mongoose.model('User', userSchema)