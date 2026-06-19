import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['coach', 'admin'],
        default: 'admin'
    },
    profileImg: {
        type: String
    },
    active: {
        type: Boolean,
        default: true
    },
    phoneNumber: {
        type:String,
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean
});

userSchema.pre('save', async function() {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 12);
})

userSchema.pre(/^find/,  function() {
    if (this.getOptions().bypassFilter) return;
    this.where({ active: { $ne: false } });
});


const User = mongoose.model('User', userSchema);

export default User;