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
        default: 'coach'
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
    passwordResetVerified: Boolean,
    refreshToken: String,
    refreshTokenExpires: Date,
});

userSchema.pre('save', async function() {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 12);
})

userSchema.pre(/^find/,  function() {
    if (this.getOptions().bypassFilter) return;
    this.where({ active: { $ne: false } });
});

userSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.password;
        delete ret.passwordResetCode;
        delete ret.passwordResetExpires;
        delete ret.passwordResetVerified;
        delete ret.refreshToken; 
        delete ret.refreshTokenExpires;
        return ret;
    }
});


const User = mongoose.model('User', userSchema);

export default User;