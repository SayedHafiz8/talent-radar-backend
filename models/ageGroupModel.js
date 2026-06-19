import mongoose from "mongoose";
import { type } from "node:os";

const ageGroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    age: {
        type: Number,
        required: true,
        unique: true,
        min: 10,
        max: 18
    }
});

const AgeGroup = mongoose.model('AgeGroup', ageGroupSchema);
export default AgeGroup;