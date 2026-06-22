import mongoose from "mongoose";
import AgeGroup from "./ageGroupModel.js";

const playerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
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
    position:{
        type:String,
        enum:[
        "GK",
        "CB",
        "LB",
        "RB",
        "CM",
        "AM",
        "LW",
        "RW",
        "ST"
        ]
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
    preferredFoot:{
        type:String,
        enum:["right","left","both"]
    },
    nationality: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    status:{
        type:String,
        enum:[
            "pending",
            "selected",
            "rejected"
        ],
        default:"pending"
    },
    notes: {
        type: String
    },
    coach: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
},
},{ timestamps: true });

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




playerSchema.pre('save', async function () {
    const age = calculateAge(this.dateOfBirth);
    
    // ❌ منع الأعمار الغلط
    if (age < 10 || age > 18 ) {
        throw new Error(`Age must be between (10 - 18) `);
    }

    // ✅ ربط الفئة
    const ageGroup = await AgeGroup.findOne({ age });

    if (!ageGroup) {
        throw new Error('AgeGroup not found for this age');
    }

    this.ageGroup = ageGroup._id;

    
});

// Database indexes
playerSchema.index({ coach: 1, createdAt:-1 });
// search بالاسم
playerSchema.index({ name: "text" });
// فلترة بالمركز والقدم المفضلة
playerSchema.index({ coach: 1, position: 1 });
playerSchema.index({ coach: 1, preferredFoot: 1 });
// فلترة بالفئة العمرية
playerSchema.index({ coach: 1, ageGroup: 1 });
// dashboard aggregations — status filtering & grouping
playerSchema.index({ status: 1 });              // admin dashboard: group by status across all players
playerSchema.index({ coach: 1, status: 1 });    // coach dashboard: match coach then group by status
// daily summary — range query on createdAt across all coaches
playerSchema.index({ createdAt: 1 });           // dailySummary: $match createdAt > lastSentAt



playerSchema.pre('findOneAndUpdate', async function () {

    const update = this.getUpdate();

    const data = update.$set || update;

    if(data.dateOfBirth){

        const age = calculateAge(data.dateOfBirth);

        if(age < 10 || age > 18){
            throw new Error("Age must be between 10 - 18");
        }

        const ageGroup = await AgeGroup.findOne({age});

        if(!ageGroup){
            throw new Error("AgeGroup not found");
        }

        data.ageGroup = ageGroup._id;
    }
});

const Player = mongoose.model('Player', playerSchema);

export default Player;