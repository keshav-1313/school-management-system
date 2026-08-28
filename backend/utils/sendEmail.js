import nodemailer from "nodemailer";

const sendEmail = async ({ email, subject, message, html }) => {
    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_HOST,
        port: process.env.MAILTRAP_PORT,
        auth: {
            user: process.env.MAILTRAP_USER,
            pass: process.env.MAILTRAP_PASS
        }
    });

    const mailOptions = {
        from: process.env.MAIL_FROM,
        to: email,
        subject,
        text: message,
        html
    };

    await transporter.sendMail(mailOptions);
}
export default sendEmail;