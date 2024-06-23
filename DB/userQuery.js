const {senderMail,senderMailValidate} = require('../expressCode/nodemailer.js');
const { passwordGenerate, comparePassword } = require('../expressCode/userLogic.js');
const client = require('../server.js')
const randomString = require("randomstring");

const dbClient = client.db("PasswordResetTask").collection("Users");

async function getUser(name){
    const user = await dbClient.findOne({mail :  name});
    return user;
}

async function addUser(reg){
    const user = await getUser(reg.mail);
    if(user){
        return false
    }
    //doing instead of bcryptjs
    const pass = await passwordGenerate(reg.password);
    const generatedKey = randomString.generate({
        length : 10,
        charset : "alphabetic"
    })
    const generatedWebLink = randomString.generate({
        length : 25
    })
    await senderMailValidate(generatedKey,generatedWebLink,reg.mail);
    await dbClient.insertOne({
        mail : reg.mail,
        firstName : reg.firstname,
        lastName : reg.lastname,
        password : pass,
        isValidated : false,
        resetKey : generatedKey,
        generatedWebLink : generatedWebLink,
        shortUrls : [
            {
                url : `${process.env.VALIDATE}${reg.mail}?webKey=${generatedWebLink}`,
                click : 0,
                dateCreated : new Date().getTime().toString()
            }
        ],
        shortUrlCount : 1
    })
    return true;
}

async function loginUser(reg){
    const user = await getUser(reg.mail);
    if(!user){
        return "404";
    }else if(user.isValidated){
        const bol = await comparePassword(reg.password,user.password);
        return bol ? "200" : "418";
    }
    
    return "412";
}

async function passwordReset(reg){
    const user = await getUser(reg.mail);
    if(user){
        const generatedKey = randomString.generate({
            length : 10,
            charset : "alphabetic"
        })
        await senderMail(generatedKey,user.mail);
        await dbClient.updateOne({mail : user.mail}, {
            $set :{
                resetKey : generatedKey
            },
            $push : {
                shortUrls : {
                    url : `${process.env.RESET}${reg.mail}?scKey=${generatedKey}`,
                    click : 0
                }
            },
            $inc : {shortUrlCount : 1}
        })
        return true;
    }
    return false;
}

async function validateAndResetPassword(mail,resetKey){
    const user = await getUser(mail);
    const validate = await isResetKeySent(user);
    return validate && user.resetKey === resetKey;
}

async function isResetKeySent(user){
    const keyCheck = await dbClient.findOne({mail : user.mail, resetKey : {$exists : true}});
    return keyCheck ? true : false;
}

async function checkResetKey(mail, resetKey){
    const check = await dbClient.findOne({mail : mail, resetKey : resetKey});
    return check ? 
        (await dbClient.updateOne({mail : mail},{
            $set : {
                isValidated : true
            },
            $unset :{
                generatedWebLink : "",
                resetKey : ""
            }
        }))
    : false;
}

async function incShortUrlCount(reg){
    const tip = await dbClient.updateOne({mail : reg.mail,
        "shortUrls.url" : `${process.env.HOST}${reg.pathname}${reg.search}`
    },{
        $inc : {"shortUrls.$.click" : 1}
    })
}

async function checkWebKey(mail, webKey){
    const check = await dbClient.findOne({mail : mail, generatedWebLink : webKey});
    return check != null ? true : false;
}

async function setPassword(mail,password){
    const genPass = await passwordGenerate(password);
    const keyCheck = await dbClient.updateOne({mail : mail},
        {
            $set : {password : genPass},
            $unset :{resetKey : ""}
        }
    );
    return keyCheck ? true : false;
}

async function getUrls(mail){
    return await dbClient
    .aggregate([{$match : {mail : mail}},{
        $project : {
            _id : 0,
            shortUrls : 1,
            shortUrlCount : 1
        }
    }]).toArray();
}

module.exports = {getUrls,incShortUrlCount,checkWebKey,checkResetKey,setPassword,getUser,addUser,loginUser,passwordReset,validateAndResetPassword}