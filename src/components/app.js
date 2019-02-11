'use strict'

const React = require('react')
let {createIPFSobj} = require('./../utils/IpfsUtil')
const OrbitDB = require('orbit-db');
const Box = require('3box');

const stringToUse = 'hello world from webpacked IPFS'

class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      isLoading: true,
      metamaskOff: false,
      name: "",
      publicAddress: "",
      privateKey: null,
      ethereumProvider: null,
      id: null,
      added_file_hash: null,
      added_file_contents: null,
      receiveurl: "",
      ipfs: null,
      orbitdb: null,
      db: null,
      value: null
    }
  }

  setStatePromise(val){
    let self = this;
    return new Promise((resolve, reject) => {
      this.setState(val, (err) => {
        if (err)
          reject(err)
        else
          resolve(err) 
      })
    })
  }

  getEthAccounts(web3Provider) {
    return new Promise((resolve, reject) => {
      web3Provider.eth.getAccounts((err, res) => {
        if (err)
          reject(err)
        else
          resolve(res)
      })
    })
  }

  async create(newNode, id, pubKey, privKey) {

    return createIPFSobj(newNode, id, pubKey, privKey)
                    .then(({ipfs, privateKey}) => {
                      return this.setStatePromise({ipfs, privateKey})
                    })
  }

  async getProfile() {
    let self = this;
    let globalNode, address, ethereumProvider;
    try {
      ethereumProvider = window.web3.currentProvider
      address = await this.getEthAccounts(window.web3)
      if (address.length === 0) 
        throw "Please log into metamask"
      address = address[0].toString()
      console.log("Address is " + address)
    } catch(err) {
      console.log(err)
      this.setState({
        isLoading: false,
        metamaskOff: true
      })
      console.log(err)
      return;
    }
    let profile = await Box.getProfile(address)
    return self.setStatePromise({
      name: profile.name,
      ethereumProvider,
      publicAddress: address
    })
  }

  setBoxValues(box) {
    let node = this.state.ipfs,
        self = this;
    return new Promise((resolve, reject) => {
      node.once('ready', async () => {
        let id = await node.id()
        self.setStatePromise({
                                id: id.id
                              })
            .then(() => {
              return box.public.set('ipfsid', id.id)
            }).then(() => {
              return box.public.set('ipfspubkey', id.publicKey)
            }).then(() => {
              return box.private.set('ipfsprivkey', self.state.privateKey)
            }).then(() => {
              resolve("Success")
            })
      })
    })
  }

  async initializeNode() {
    let self = this;
    return Box.openBox(this.state.publicAddress, this.state.ethereumProvider)
                  .then((box) => {
                    return new Promise((resolve, reject) => {
                      box.onSyncDone(async () => {
                        let ipfsId = await box.public.get('ipfsid');
                        if (ipfsId === null || ipfsId === undefined) {
                          console.log("Ipfsid is null!");
                          self.create(true)
                              .then(() => {
                                return self.setBoxValues(box)
                              }).then((res) => {
                                resolve("Success!")
                              })
                        } else {
                          console.log("Inside else of init node!")
                          console.log(ipfsId)
                          self.setState({
                            isLoading: false,
                            id: ipfsId
                          })
                          console.log("Over here in else")
                          let pubKey, privKey;
                          pubKey = await box.public.get('ipfspubkey');
                          privKey = await box.private.get('ipfsprivkey');
                          self.create(false, ipfsId, pubKey, privKey)
                              .then(() => {
                                resolve("Success")
                              })
                        }
                      })
                    })

                  })
  }

  componentDidMount () {
    const self = this
    this.getProfile()
        .then(() => {
          return this.initializeNode()
        }).then((res) => {
          return new Promise((resolve, reject) => {
            self.state.ipfs.once('ready', async () => {
              let orbitdb = new OrbitDB(self.state.ipfs)
              let db = await orbitdb.keyvalue('myfirstdb')
              await db.load();
              let value = db.get("value")
              console.log(db.address.toString())
              self.setStatePromise({orbitdb, db, value})
                  .then(() => {
                    resolve("Success")
                  })
            })
          })


          // let value = db.get("value")
          // console.log(db.address.toString())
          // return self.setState({orbitdb})
          
        }).then(() => {
          console.log("App is now ready")
        })
    // self.create(true)
    //     .then(() => {
    //       self.state.ipfs.once('ready', () => {
    //         console.log('IPFS node is ready')
    //         ops()
    //       })
    //     })

    // function ops () {
    //   self.state.ipfs.id((err, res) => {
    //     if (err) {
    //       throw err
    //     }
    //     self.setStatePromise({
    //       id: res.id,
    //       version: res.agentVersion,
    //       protocol_version: res.protocolVersion
    //     }).then(async () => {
    //       let orbitdb = new OrbitDB(self.state.ipfs)
    //       let db = await orbitdb.keyvalue('myfirstdb')
    //       await db.load();
    //       let value = db.get("value")
    //       console.log(db.address.toString())
    //       return self.setState({orbitdb, db, value})
    //     }).then(() => {
    //       console.log("App is now ready")
    //     }).catch((err) => {
    //       console.log(err)
    //     })
    //   })

    //   // node.files.add([Buffer.from(stringToUse)], (err, filesAdded) => {
    //   //   if (err) { throw err }

    //   //   const hash = filesAdded[0].hash
    //   //   self.setState({ added_file_hash: hash })

    //   //   node.files.cat(hash, (err, data) => {
    //   //     if (err) { throw err }
    //   //     self.setState({ added_file_contents: data.toString() })
    //   //   })
    //   // })
    // }
  }
  handleChange(event) {
    const name = event.target.name
    this.setState({[name]: event.target.value});
  }

  async handleNoSubmit(event) {
    console.log(this.state.setno)
    await this.state.db.set("value", this.state.setno)
    this.setState({value: this.state.db.get("value")})
    console.log("Value set successfully")
  }

  async handleUrlSubmit(event) {
    console.log(this.state.receiveurl)
    let db2 = await this.state.orbitdb.keyvalue(this.state.receiveurl)
    await db2.load()
    this.setState({value: db2.get("value")})
    db2.events.on('replicated', async () => {
      const result = db2.get('value')
      this.setState({value: result})
    })
  }

  render () {
    return (
      <div style={{ textAlign: 'center' }}>
        <h1>Everything is working!</h1>
        <p>Your ID is <strong>{this.state.id}</strong></p>
        <hr />
        <p>Value of value is {this.state.value}</p>
        <div>
          <label for="setno">Set number</label>
          <input name="setno" id="setno" value={this.state.setno} onChange={this.handleChange.bind(this)}/>          
          <button onClick={this.handleNoSubmit.bind(this)}>Submit</button>
        </div>
        <div>
          <label for="receiveurl">Enter receiver url</label>
          <input name="receiveurl" id="receiveurl" value={this.state.receiveurl} onChange={this.handleChange.bind(this)}/>
          <button onClick={this.handleUrlSubmit.bind(this)}>Submit</button>
        </div>

        <br />
        <br />
        <p>
          Contents of this file: <br />
          {this.state.added_file_contents}
        </p>
      </div>
    )
  }
}
module.exports = App