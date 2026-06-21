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

    const hasNestedUpdate =
        update.technical || update.physical || update.mental ||
        Object.keys(update).some(key =>
            key.startsWith("technical.") ||
            key.startsWith("physical.") ||
            key.startsWith("mental.")
        );

    if (!hasNestedUpdate) return;

    const current = await this.model.findOne(this.getQuery()).lean();
    if (!current) return;

    // لازم تدمج الـ dot notation كمان مش بس nested objects
    const flatUpdate = {};
    for (const key in update) {
        if (key.includes(".")) {
            const [parent, child] = key.split(".");
            flatUpdate[parent] = { ...(flatUpdate[parent] || {}), [child]: update[key] };
        }
    }

    const merged = {
        technical: { ...current.technical, ...update.technical, ...flatUpdate.technical },
        physical:  { ...current.physical,  ...update.physical,  ...flatUpdate.physical  },
        mental:    { ...current.mental,     ...update.mental,    ...flatUpdate.mental    },
    };

    const allScores = [
        merged.technical.passing, merged.technical.dribbling,
        merged.technical.shooting, merged.technical.ballControl,
        merged.physical.speed, merged.physical.stamina,
        merged.physical.strength, merged.physical.agility,
        merged.mental.positioning, merged.mental.decisionMaking,
        merged.mental.teamwork, merged.mental.attitude,
    ];

    update.overallRating = parseFloat(
        (allScores.reduce((a, v) => a + v, 0) / allScores.length).toFixed(2)
    );
});

scoutingReportSchema.index(
    { player: 1, coach: 1, matchDate: 1 },
    { unique: true }
);
scoutingReportSchema.index({ player: 1, createdAt: -1 });
scoutingReportSchema.index({ coach: 1, createdAt: -1 });
scoutingReportSchema.index({
    notes:"text",
    recommendation:"text"
});

// ===== Populate Player و Coach تلقائي =====


const ScoutingReport = mongoose.model("ScoutingReport", scoutingReportSchema);

export default ScoutingReport;