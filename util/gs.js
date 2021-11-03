

const get = (fileName) => {
    return require('../bucket/' + fileName)
}

const insert = (file, fileName) => {
    
}

exports.get = get
exports.insert = insert