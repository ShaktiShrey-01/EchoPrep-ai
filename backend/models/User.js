import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = mongoose.Schema({
    username: { type: String, required: true }, // Changed 'name' to 'username' to match your controller
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    refreshToken: { type: String } // <--- ADD THIS
}, { timestamps: true });

userSchema.pre("save", async function() {
    // If password is NOT modified, just return (exit the function)
    if (!this.isModified("password")) return;

    // If it IS modified, hash it
    this.password = await bcrypt.hash(this.password, 10);
});

// 2. FIXED METHOD NAME & LOGIC
userSchema.methods.isPasswordCorrect = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Access Token (Short life: 15m - 1h)
userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        { _id: this._id, email: this.email, username: this.username },
        process.env.ACCESS_TOKEN_SECRET, // Make sure to add this to .env
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY } // e.g., "15m"
    );
};

// Refresh Token (Long life: 7d - 30d)
userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        { _id: this._id },
        process.env.REFRESH_TOKEN_SECRET, // Make sure to add this to .env
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY } // e.g., "10d"
    );
};
export default mongoose.model('User', userSchema); // Changed from module.exports