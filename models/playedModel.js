import mongoose from "mongoose";
import AgeGroup from "./ageGroupModel.js";

const playerSchema = new mongoose.Schema({
    name: {
        type: String,
        requied: true,
    },
    city: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    ageGroup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AgeGroup"
        
    },
    jerseyNum: {
        type: Number,
        required: true
    },
    height: {
        type: Number,
    },
    weight: {
        type: Number,
    },
    preferredFoot: {
        type: String,
        requied: true
    },
    nationality: {
        type: String,
        requierd: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    status: {
        type:String
        
    },
    notes: {
        type: String
    },
    coach: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
},
});

// Calculate Age
function calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);

    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}

playerSchema.pre(/^find/,  function() {
    this.populate({
        path: "coach",
        select: "name -_id"
    });
});


playerSchema.pre('save', async function () {
    const age = calculateAge(this.dateOfBirth);
    
    // ❌ منع الأعمار الغلط
    if (age < 8 || age > 18 ) {
        throw new Error(`Age must be between (8 - 18) `);
    }

    // ✅ ربط الفئة
    const ageGroup = await AgeGroup.findOne({ age });

    if (!ageGroup) {
        throw new Error('AgeGroup not found for this age');
    }

    this.ageGroup = ageGroup._id;

    
});

playerSchema.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate();

    if (update.dateOfBirth) {
        const age = calculateAge(update.dateOfBirth);

        if (age < 8 || age > 18) {
        return next(new Error(`Age must be between (8 - 18) `));
        }

        const ageGroup = await AgeGroup.findOne({ age });

        if (!ageGroup) {
        return next(new Error('AgeGroup not found'));
        }

        update.ageGroup = ageGroup._id;
    }

    next();
});

const Player = mongoose.model('Player', playerSchema);

export default Player;