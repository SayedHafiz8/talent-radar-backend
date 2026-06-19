import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        lowercase: true
    },
    ageGroup: {
        type: mongoose.Schema.ObjectId,
        ref: 'AgeGroup',
        required: true
    },
    clubName: {
        type: String,
        required: true
    },
    coach: {
        type: String,
        required: true
    }, 
    coachNumber: {
        type: String,
    },
    active: {
        type: Boolean,
        default: true
    }
});

teamSchema.index({name: 1, ageGroup: 1}, {
    unique: true,
    partialFilterExpression: {
        active: { $eq: true }
    }
});

teamSchema.pre(/^find/, function(next) {
    if (this.getOptions().bypassFilter) return;
  this.find({ active: { $ne: false } });
  next();
});

const Team = mongoose.model('Team', teamSchema);

export default Team;