const fs = require('fs')

const get = (fileName) => {
    return require('../bucket/' + fileName)
}

const insert = (fileName, file) => {
    fs.writeFile('./bucket/' + fileName, JSON.stringify(file), (err) => {
        console.log(err)
    })
}

const update = (fileName, fields) => {
    let file = get(fileName)
    Object.keys(fields).forEach((key) => {
        file[key] = fields[key]
    })
    insert(fileName, file)
}

exports.get = get
exports.insert = insert
exports.update = update