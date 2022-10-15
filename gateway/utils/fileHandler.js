const fs = require('fs');
module.exports.isExistInstance = function(service, data) {
    const {url} = data;
    if(service.instances.some(instance=>instance.url === url)) 
        return true;
    return false;
}

module.exports.writeFile = function(filename, data) {
    fs.writeFile(filename, JSON.stringify(data), (err)=>{
        if(err) throw err;
    })
}