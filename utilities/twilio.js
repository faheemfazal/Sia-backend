//const dotenv = require('dotenv')

//dotenv.config({ path: './.env' })


const accountSid = 'ACe61b8641c1f1a9a9b3fb2b2ea4396bb7'
const authToken = '6f41c720001f5190c648945b46421fb7'
const verifySid = 'VA7efe1ee692645594a3faacbb273f3b3d'


const client = require('twilio')(accountSid, authToken);

function sendotp(sendotpphone) {
    console.log(sendotpphone, 'hkhkhkhkhkjjjjjjjjjjjjjj')
    client.verify.v2
        .services(verifySid)
        .verifications.create({ to: `+91${Number(sendotpphone)}`, channel: "sms" })
        .then((verification) => console.log(verification.status))
        .catch((err) => {
            console.log(err)
        })

}

function verifyotp(phone, otp) {
    return new Promise((resolve, reject) => {
        client.verify.v2
            .services(verifySid)
            .verificationChecks.create({ to: `+91${phone}`, code: otp })
            .then((verification_check) => {
                console.log(verification_check.status)
                resolve(verification_check)
            })
    })


}
module.exports = {
    sendotp,
    verifyotp

}

