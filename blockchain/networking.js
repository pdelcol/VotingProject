var blockchain = require('./blockchain');
var message = require('./message');

const WebSocket = require('ws');

const sockets = [];

/**
 * get sockets (peers)
 */
function getSockets() {
    return sockets;
}

/***
 * initialize the listening on port
 * @param port
 */
function initNetworkingServer(port) {

    const wss = new WebSocket.Server({
        port: port
    });
    wss.on('connection', function connection(ws, req) {
        console.log("in function");
        if (ws instanceof WebSocket) {
            initConnection(ws);
            console.log("WebSocket listening on port" + port);
        } else {
            console.log("Error: ws no recieved in initNetworkingServer");
        }
    });
}


/**
 * initialize the various handlers to watch the connection and add it to the list of peers
 * @param ws
 */
function initConnection(ws) {

    // if (sockets !== []) {    // can't figure out how to check array type
    //     console.log("sockets is not a WebSocket[]");
    //     return;
    // }
    sockets.push(ws);
    initMessageHandler(ws);
    initErrorHandler(ws);
    sendMessage(ws, message.queryChainLengthMessage());
}


/**
 * connect to peers
 *
 * @param peer - address
 */
function connectToPeers(peer) {

    const ws = new WebSocket(peer);
    ws.on('open', () => initConnection(ws));
    ws.on('error', () => console.log("connection failed"));
}


/**
 * establishing what is to be done if webSocket fails or closes
 * @param ws
 */
function initErrorHandler(ws) {

    if (!(ws instanceof WebSocket)) {
        console.log("ws is not a WebSocket");
        return;
    }

    ws.on('close', () => closeConn(ws));
    ws.on('error', () => closeConn(ws));

}



/**
 * closing connection and printing error, if it fails
 * @param ws
 */
function closeConn(ws) {

    console.log("connection failed:" + ws.url);
    sockets.splice(sockets.indexOf(ws), 1);

}


/**
 * handling when blockchain is requested
 * @param receivedBlocks
 */
function handleBlockchainResponse(receivedBlocks) {

    console.log('incoming chain: ' + receivedBlocks);
    /*** checking if empty ***/
    if (receivedBlocks.length === 0) {
        console.log("Blockchain is empty");
        return;
    }

    /*** validating structure ***/
    const latestBlockReceived = receivedBlocks[receivedBlocks.length-1];
    console.log(latestBlockReceived);
    if (!latestBlockReceived.isValidBlockStructure()) {
        console.log("Invalid Block");
        return;
    }

    const latestBlock = blockchain.blockchain.getLatestBlock();
    /*** is this a new block that agrees with previous chain ***/
    if ( latestBlockReceived.getPHash() === latestBlock.getHash()) {
        /*** if so, lets add it to chain ***/
        if (blockchain.blockchain.addBlock(latestBlockReceived)) {
            broadcast(message.responseLatestMessage());
        }
    } else if (receivedBlocks.length === 1) {
        /*** query bc this shouldn't be ***/
        broadcast(message.queryAllMessage());
    } else {
        /*** there's > 1 block, so take em all ***/
        this.replaceChain(receivedBlocks);
    }
}


/**
 * processes any received message
 * @param ws
 */
function initMessageHandler(ws) {

    if (!(ws instanceof WebSocket)) {
        console.log("initMessageHandler failed: ws is not a WebSocket");
        return;
    }

    /**
     * anonymous function, in which dara is the actual message
     */
    ws.on('message', (data) => {
        const msg = parseMessage(data);
        if (!msg instanceof message.Message) return;

        console.log("Received Message" + JSON.stringify(msg));

        /*** testing message type, to react properly ***/
        switch (msg.type) {
            case message.MessageType.QUERY_LATEST:
                sendMessage(ws, message.responseLatestMessage());
                break;
            case message.MessageType.QUERY_ALL:
                sendMessage(ws, message.responseBlockchainMessage());
                break;
            case message.MessageType.RESPONSE_BLOCKCHAIN:
                const receivedBlocks = msg.data;
                if (receivedBlocks === null) {
                    console.log("Message Data: Invalid Blocks");
                    return;
                }
                handleBlockchainResponse(receivedBlocks);
                break;
            default:
                console.log("Message missed all cases");
                break;
        }
    });
}

/**
 * \parses message
 * @param data
 */
function parseMessage(data) {
    try {
        return JSON.parse(data);
    } catch (e) {
        console.log("Error parsing message");
        return null;
    }
}


/**
 * send message to webSocket
 *
 * @param who
 * @param message
 */
function sendMessage(who, message) {
    if (who instanceof WebSocket) who.send(JSON.stringify(message));
}


/**
 * send a message to all sockets
 */
function broadcast(message) {
    sockets.forEach(s => sendMessage(s, message));
}


module.exports.initNetworkingServer = initNetworkingServer;
module.exports.connectToPeers = connectToPeers;
module.exports.getSockets = getSockets;
module.exports.broadcast = broadcast;