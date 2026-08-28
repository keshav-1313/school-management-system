import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";


// Login user
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Find user
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log(isMatch);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate token
        const token = generateToken(user._id);
        // cookie options
        const isProduction = process.env.NODE_ENV === "production";
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        };
        // send cookie
        res.cookie("token", token, cookieOptions);

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
// logout user
export const logoutUser = async (req, res) => {
    try {
        res.cookie("token", "", {
            httpOnly: true,
            expires: new Date(0)
        });
        res.status(200).json({
            success: true,
            message: "Logout successful"
        });
    } catch (error) {
        console.log("error", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
// forgot password
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        const resetToken = crypto.randomBytes(20).toString("hex");


        // hash token
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        // set token and expiry on user
        const expireTime = Date.now() + 15 * 60 * 1000;
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = expireTime;
        user.resetPasswordExpiry = expireTime;

        await user.save();
        // reset url
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        // html
        const html = `
        <div style="font-family: Arial, sans-sarif; padding: 20px;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p> You requested to reset your password.
            </p>
            <p> Click the button below to reset your password:
            </p>
            <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
            <p style="margin-top: 20px;"> This link will expire in 15 minutes.
            </p>
            <p> If you did not request this, please ignore this email.
            </p>
        </div>
        `;

        await sendEmail({
            email: user.email,
            subject: "Password Reset Request",
            html
        });
        res.status(200).json({
            success: true,
            message: "Password reset link sent to your email"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// reset password
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Password is required"
            });
        }

        // hash token
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        // find user by token and check expiry
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            $or: [
                { resetPasswordExpire: { $gt: Date.now() } },
                { resetPasswordExpiry: { $gt: Date.now() } }
            ]
        });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired token"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        // update password
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        user.resetPasswordExpiry = undefined;
        await user.save();
        res.status(200).json({
            success: true,
            message: "Password reset successfully"
        });
    } catch (error) {
        console.log("error", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// get current user
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}