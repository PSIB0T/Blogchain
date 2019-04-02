'use strict'

const EC = require('elliptic').ec
const ec = new EC('secp256k1')

class Keystore {
  constructor(storage, box) {
    this._storage = storage
    this.box = box;
  }

  _getFromBox() {
    let publicKey, privateKey
    return this.box.public.get('orbitpublicKey')
                .then((res) => {
                    publicKey = res;
                    return this.box.private.get('orbitprivateKey')
                }).then((res) => {
                    privateKey = res;
                    return Promise.resolve({publicKey, privateKey})
                })
  }

  async createKey(id) {
    let key;
    let {publicKey, privateKey} = await this._getFromBox();
    console.log("gg from createkey")
    if (publicKey === null || publicKey === undefined || privateKey === null || privateKey === undefined) {
        console.log("Not found in 3box!")
        key = ec.genKeyPair()
        publicKey = key.getPublic('hex')
        privateKey = key.getPrivate('hex')
        await this.box.public.set('orbitpublicKey', publicKey)
        await this.box.private.set('orbitprivateKey', privateKey)
    } else {
        key = ec.keyPair({
            pub: publicKey,
            priv: privateKey,
            privEnc: 'hex',
            pubEnc: 'hex',
        })
        console.log("Inside else bitches!")
        console.log(key.getPublic('hex'))
    }
    console.log("Public key is")
    console.log(publicKey)
    this._storage.setItem(id, JSON.stringify({
        publicKey: publicKey, 
        privateKey: privateKey 
    }))
    return key
  }

  getKey(id) {
    let key = JSON.parse(this._storage.getItem(id))
    if (!key)
      return

    const k = ec.keyPair({ 
      pub:  key.publicKey, 
      priv: key.privateKey,
      privEnc: 'hex',
      pubEnc: 'hex',
    })

    return k
  }

  generateKey() {
    return Promise.resolve(ec.genKeyPair())
  }

  exportPublicKey(key) {
    return Promise.resolve(key.getPublic('hex'))
  }

  exportPrivateKey(key) {
    return Promise.resolve(key.getPrivate('hex'))
  }

  importPublicKey(key) {
    return Promise.resolve(ec.keyFromPublic(key, 'hex'))
  }

  importPrivateKey(key) {
    return Promise.resolve(ec.keyFromPrivate(key, 'hex'))
  }

  sign(key, data) {
    const sig = ec.sign(data, key)
    return Promise.resolve(sig.toDER('hex'))
  }

  verify(signature, key, data) {
    let res = false
    res = ec.verify(data, signature, key)
    return Promise.resolve(res)
  }
}

module.exports = (LocalStorage, mkdir) => {
  return {
    create: (directory = './keystore', box) => {
      // If we're in Node.js, mkdir module is expected to passed
      // and we need to make sure the directory exists
      if (mkdir && mkdir.sync) 
        mkdir.sync(directory)
      // In Node.js, we use the injected LocalStorage module,
      // in the browser, we use the browser's localStorage
      const storage = LocalStorage ? new LocalStorage(directory) : localStorage
      console.log(storage)
      return new Keystore(storage, box)
    }
  }
}
