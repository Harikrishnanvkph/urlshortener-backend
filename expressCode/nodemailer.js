const nodemailer = require("nodemailer");

const transportor = nodemailer.createTransport({
    host : "smtp.gmail.com",
    auth : {
        user : `${process.env.MY_MAIL}`,
        pass : process.env.APP_KEY
    }
})

async function senderMail(OTP,receiver){
    await transportor.sendMail({
        from : `${process.env.MY_MAIL}`,
        to : receiver,
        subject : "Link To Reset Your Password",
        html : `<div>Welcome to Hari GAS Booking .come<p>Please DONOT Share the provided Unique Key to anyone</p>
        <p>Click on the ShortURL token <a href="${process.env.RESET}${receiver}?scKey=${OTP}">${OTP}</a> to navigate to password reset page<p></div>`
    })
}

async function senderMailValidate(OTP,webKey,receiver){
    await transportor.sendMail({
        from : `${process.env.MY_MAIL}`,
        to : receiver,
        subject : "Link To Reset Your Password",
        html : `<div>Welcome to Hari GAS Booking .come<p>Please DONOT Share the provided Unique Key to anyone</p>
        <p>Click on the ShortURL token <a href="${process.env.VALIDATE}${receiver}?webKey=${webKey}">${OTP}</a> to navigate to validate your account<p></div>`
    })
}

module.exports = {senderMail,senderMailValidate}