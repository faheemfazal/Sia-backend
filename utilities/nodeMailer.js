const nodemailer = require('nodemailer');
//const mailgen = require('mailgen');
const otp = require('otp-generator')

const nodeMailer = (UserEmail) => {
    console.log(UserEmail, 'UserEmail')

    const email = UserEmail
    const UserOtp = otp.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
    console.log(UserOtp, 'Generated OTP')

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.Email,
            pass: process.env.Password, // Ensure you have this in your .env file
        },
    });

    const mailOptions = {
        from: process.env.Email,
        to: email,
        subject: "Your OTP From PICKUP PIKO",
        text: `Hi, I am PICKUP-PIKO-Ecommerce. Thank you for logging in. PICKUP-PIKO is always with you.OTP: ${UserOtp}`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }

    return UserOtp
}
module.exports = {
    nodeMailer
};



