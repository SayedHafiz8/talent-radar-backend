import mongoose from "mongoose";

const scoutingReportSchema = new mongoose.Schema(
    {
        player: {
            type: mongoose.Schema.ObjectId,
            ref: "Player",
            required: true,
        },
        coach: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
        },
        matchDate: {
            type: Date,
            required: true,
        },

        // ===== Technical Skills =====
        technical: {
            passing: {
                type: Number,
                min: 1,
                max: 10,
                required: true,
            },
            dribbling: {
                type: Number,
                min: 1,
                max: 10,
                required: true,
            },
            shooting: {
                type: Number,
                min: 1,
                max: 10,
                required: true,
            },
            ballControl: {
                type: Number,
                min: 1,
                max: 10,
                required: true,
            },
        },

        // ===== Physical Skills =====
        physical: {
            speed: {
                type: Number,
                min: 1,
                max: 10,
                required: true,
            },
            stamina: {
                type: Number,
                min: 1,
                max: 10,
                required: true,
            },
            strength: {
                type: Number,
                min: 1,
                max: 10,
                required: true,
            },
            agility: {
                type: Number,
                min: 1,
                max: 10,
                required: true,
            },
        },

        // ===== Mental Skills =====
        mental: {
            positioning: {
                type: Number,
                min: 1,
                max: 10,
                required: true,
            },
            decisionMaking: {
                type: Number,
                min: 1,
                max: 10,
                required: true,
            },
            teamwork: {
                type: Number,
                min: 1,
                max: 10,
                required: true,
            },
            attitude: {
                type: Number,
                min: 1,
                max: 10,
                required: true,
            },
        },

        // ===== Overall Rating (يتحسب تلقائي) =====
        overallRating: {
            type: Number,
            min: 1,
            max: 10,
        },

        recommendation: {
            type: String,
            enum: ["promote", "continue", "review"],
            required: true,
        },

        notes: {
            type: String,
        },
    },
    { timestamps: true }
);

// ===== حساب Overall Rating تلقائي قبل الحفظ =====
function calcOverallRating(doc) {
    const allScores = [
        doc.technical.passing,
        doc.technical.dribbling,
        doc.technical.shooting,
        doc.technical.ballControl,
        doc.physical.speed,
        doc.physical.stamina,
        doc.physical.strength,
        doc.physical.agility,
        doc.mental.positioning,
        doc.mental.decisionMaking,
        doc.mental.teamwork,
        doc.mental.attitude,
    ];

    const sum = allScores.reduce((acc, val) => acc + val, 0);
    return parseFloat((sum / allScores.length).toFixed(2));
}

scoutingReportSchema.pre("save", function () {
    this.overallRating = calcOverallRating(this);
    
});

scoutingReportSchema.pre("findOneAndUpdate", async function () {
    const update = this.getUpdate();

    // لو مفيش تعديل على أي تقييم — مش محتاج نحسب
    if (!update.technical && !update.physical && !update.mental) {
        return;
    }

    // ① جيب الـ document الحالي من الـ DB
    const current = await this.model.findOne(this.getQuery()).lean();
    if (!current) return;

    // ② ادمج القيم الجديدة على القيم الحالية (deep merge)
    const merged = {
        technical: { ...current.technical, ...update.technical },
        physical:  { ...current.physical,  ...update.physical  },
        mental:    { ...current.mental,     ...update.mental    },
    };

    // ③ احسب الـ overallRating من القيم المدموجة
    const allScores = [
        merged.technical.passing,
        merged.technical.dribbling,
        merged.technical.shooting,
        merged.technical.ballControl,
        merged.physical.speed,
        merged.physical.stamina,
        merged.physical.strength,
        merged.physical.agility,
        merged.mental.positioning,
        merged.mental.decisionMaking,
        merged.mental.teamwork,
        merged.mental.attitude,
    ];

    const sum = allScores.reduce((acc, val) => acc + val, 0);
    update.overallRating = parseFloat((sum / allScores.length).toFixed(2));
    
});

// ===== Populate Player و Coach تلقائي =====
scoutingReportSchema.pre(/^find/, function () {
    this.populate({
        path: "player",
        select: "name position ageGroup -_id",
    }).populate({
        path: "coach",
        select: "name -_id",
    });
});

const ScoutingReport = mongoose.model("ScoutingReport", scoutingReportSchema);

export default ScoutingReport;