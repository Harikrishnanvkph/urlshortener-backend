const bcryptjs = require('bcryptjs');


async function passwordGenerate(password){
    const salt = await bcryptjs.genSalt(5);
    const hash = await bcryptjs.hash(password,salt);
    return hash;
}

async function comparePassword(pass,dbPass){
    return await bcryptjs.compare(pass,dbPass);
}

module.exports = {passwordGenerate, comparePassword}