const nodemailer = require('nodemailer');
//const mailgen = require('mailgen');
const otp = require('otp-generator')

const nodeMailer = (UserEmail) => {
    const email = UserEmail
    const UserOtp = otp.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: 'prasad063918@gmail.com',
            pass: 'kylh cmte jgdy luze',
        },
    });
    console.log(UserOtp,'opopop',email);
    const mailOptions = {
        from: 'prasad063918@gmail.com',
        to: email,
        subject: "Your OTP",
        text: `Hi, I am SIA-Ecommerce. Thank you for logging in. SIA is always with you.OTP: ${UserOtp}`
    };
    transporter.sendMail(mailOptions, function (error, info) {
        console.log(error);
        if (error) {
            // alert('something went wrong')
        }
    })
    return UserOtp

}
module.exports = {
    nodeMailer
};



