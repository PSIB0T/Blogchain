import IPFS from 'ipfs'
import PeerId from 'peer-id';

function createPeer(newNode, id, pubKey, privKey) {
    return new Promise((resolve, reject) => {
        if (newNode === true) {
            PeerId.create((err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res)
                }                
            })
        } else {
            PeerId.createFromJSON({
                id,
                pubKey,
                privKey
            }, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res)
                }
                
            })
        }

    })

}


export function createIPFSobj (newNode, id, pubKey, privKey) {
    // Create the IPFS node instance

    return new Promise((resolve, reject) => {
        let repo = "./repo-"
        createPeer(newNode, id, pubKey, privKey)
            .then((peerNode) => {
                let tempVar = JSON.parse(JSON.stringify(peerNode, null, 1))
                repo += tempVar.id
                console.log(tempVar)
                let ipfs = new IPFS({
                    repo,
                    EXPERIMENTAL: {pubsub: true},
                    init: {
                        privateKey: tempVar.privKey
                    },
                    config: {
                        Addresses: {
                            Swarm: [
                                '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
                            ]
                        }
                    }
                })
                resolve({ipfs, privateKey:tempVar.privKey})
            })

        

    })

    
}