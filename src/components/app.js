'use strict'

const React = require('react')
let {createIPFSobj} = require('./../utils/IpfsUtil')
const OrbitDB = require('orbit-db');
const Box = require('3box');
const KeyStore = require('./../utils/Keystore');
const path = require('path')

const stringToUse = 'hello world from webpacked IPFS'

class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      address: null,
      isLoading: true,
      metamaskOff: false,
      name: "",
      box: null,
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

  async create(pubString) {

    return createIPFSobj(pubString)
                    .then(({ipfs}) => {
                      return this.setStatePromise({ipfs})
                    })
  }

  async getProfile() {
    let self = this;
    let address, ethereumProvider;
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
    return self.setStatePromise({
      address,
      ethereumProvider,
      publicAddress: address
    })
  }

  async initializeNode() {
    let self = this;
    return Box.openBox(this.state.publicAddress, this.state.ethereumProvider)
                  .then((box) => {
                    return new Promise((resolve, reject) => {
                      box.onSyncDone(async () => {
                        self.create(self.state.address)
                            .then(() => {
                              return self.setStatePromise({box})
                            }).then(() => {
                              resolve("Success!")
                            })
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
              let id = await self.state.ipfs.id()
              let keystore = KeyStore().create(null, this.state.box)
              let orbitdb = new OrbitDB(self.state.ipfs,null, {keystore})
              let db = await orbitdb.keyvalue('myfirstdb')
              console.log("Orbit db public key is ")
              console.log(orbitdb.key.getPublic('hex'))
              await db.load();
              let value = db.get("value")
              console.log(db.address.toString())
              self.setStatePromise({orbitdb, db, value, id: id.id})
                  .then(() => {
                    resolve("Success")
                  })
            })
          })
          
        }).then(() => {
          console.log("App is now ready")
        })

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
    let ipfs = this.state.ipfs;
    let networkPeers = ipfs.swarm.peers()
    let db2 = await this.state.orbitdb.keyvalue(this.state.receiveurl)
    await db2.load()
    let databasePeers = await ipfs.pubsub.peers(db2.address.toString())
    console.log(databasePeers)
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