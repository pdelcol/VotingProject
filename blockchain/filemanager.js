//File manager to save chain to disk
const writeJsonFile = require('write-json-file');  // both libraries from npm
const loadJsonFile = require('load-json-file');
const blockchain = require('./blockchain');

const jsonFile = 'backup.json';

/**
 * function responsible for printing the blockchain backup
 */
function writeBlockchainJSON() {
    writeJsonFile(jsonFile, blockchain.blockchain.getBlockchain()).then( () => {
        console.log("Backup successful");
    }, () => {
        console.log("Backup failed");
    });
}

/**
 * Load the blockchain
 */
function loadBlockchainJSON() {
    loadJsonFile(jsonFile).then( json => {
        var newData = JSON.stringify(json);
        try{
            blockchain.blockchain.setBlockchainFromFile(json);
        }catch(ex){
            console.log(ex);
        }
    }, json => {
        console.log("Failed to load JSON:" + json);
    });
}


function loadConnectionList() {

}

module.exports.loadBlockchainJSON = loadBlockchainJSON;
module.exports.writeBlockchainJSON = writeBlockchainJSON;