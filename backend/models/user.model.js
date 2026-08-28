import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['teacher', 'admin', "student"],
    },
    avatar: {
        public_id: {
            type: String,
            default: ""
        },
        url: {
            type: String,
            default: ""
        }
    },
    resetPasswordToken: {
        type: String,
        default: ""
    },
    resetPasswordExpire: {
        type: Date
    }
}, {
    timestamps: true
})

const User = mongoose.model('User', userSchema);

export default User;    