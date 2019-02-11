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
      ethereumProvider: null,
      id: null,
      version: null,
      protocol_version: null,
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

  async create() {

    return createIPFSobj(false, "QmXMrn2WKrWp9xdLWBKu2V8dth5R3emp6MPhrgiFRdfgBZ",
                          "CAASpgIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDpOsOBI06wuq4Z0pGEifwHE234PhB6y4+g4ukdzQ3Z1Oe7iyCihuECJW3wr3ic3MWUWF/lpbc6RMTOjqgmTA0Y2BFSQs3AifpuUmcoeAUPu1b6rn2J34OiVNE6ZZJ/oVS7M6e+zLjmxqloB4RLXjZNdj2cCLGVYO27VCgvEyjLFtxCY+gnFRYP2XwQ2U0v6s9ZqEeHIEbrFY8e0Qm7GE/pp5cT4N8ZPJKVY7lL0NEqieRYpBNMG9a7tbmDNMzXDuFqmTmZvR8PvTKgFSwuTFfQ4TyzTnLffStmADj3MmH/IafKmDuqcf9j6K9Maoq2Cm0UYvCqlF5HHY0PjWCtYHGvAgMBAAE="
                          ,"CAASqQkwggSlAgEAAoIBAQDpOsOBI06wuq4Z0pGEifwHE234PhB6y4+g4ukdzQ3Z1Oe7iyCihuECJW3wr3ic3MWUWF/lpbc6RMTOjqgmTA0Y2BFSQs3AifpuUmcoeAUPu1b6rn2J34OiVNE6ZZJ/oVS7M6e+zLjmxqloB4RLXjZNdj2cCLGVYO27VCgvEyjLFtxCY+gnFRYP2XwQ2U0v6s9ZqEeHIEbrFY8e0Qm7GE/pp5cT4N8ZPJKVY7lL0NEqieRYpBNMG9a7tbmDNMzXDuFqmTmZvR8PvTKgFSwuTFfQ4TyzTnLffStmADj3MmH/IafKmDuqcf9j6K9Maoq2Cm0UYvCqlF5HHY0PjWCtYHGvAgMBAAECggEAJg29emONYk6DO5lcvthYs7ra1Yci3zY5cBG14XPkj6cqTDJOF9aT/eqnfn7S2h03a5Xjx697Ltmrltw12VHNTUFryhU2RvT8VGXDiRnUEZYKggpYV1eNvb3DCZkrBwIGtiiedQYoIRdG6r9XOYjcqVTihoPwnaPcBhWcHNoubLw1ZK7HcIuFJaBNnpewJawuzn6tlFoYyk2GpJiySc/XZiQ17glD7qks4qwCuG6EguLHVEOWZbb8G4ja9bknESrz8EbA28cFN9ZA7pJ3J2u+sPT41VH/uA9YYVCVWlyTgg6DOEpS8YX156ZVmrJzU8Lstgu4qcWN7NZ5JwUA0qTQkQKBgQD2Dr/VKhJKVD4O6S8gAU3I0a/iuxom7Fnf7EsZ+FBodBSgQzu730sdwvcneYMhzArrEMpkCo6Mo8AAGBI5J1WJ2BUdalxYLV0yUhPN2rDI7tZYJjbvhXsVHbpwQoFc5BgldJyekKg+3w68m5z4NqSMK+n7ZUrKy6tnPYUyNQPkuQKBgQDyp1G27YWqBUMyw/3O6wtVbJH/Ksosb0uwrcNGoVUUHAVBmbhQpNxTz6ZB/fEno3Z4NtqyvoOlP4LYEqu3Ip2p8ozkp0blmpbCchMjoFETSISEfkbFf7appYwVGkAeKBWd2UL/9NNds0Rb9T+sik8ZdQsHSU3kiWTWOqZjAUOlpwKBgQDU4/gIOAlxNCgpgInceCRTz1ENq/K5oJ82RdzI0HbJmT3LV8CUEWONkYWEKvdRQ5hiv7lNC3FAr+FMc4c42haBWGsUc1UImd9bzXYDEucIQtVDmXTIkkXnBDyuKmyA8X0O0zE7ZE+dbiLy/vS2MZj3Cnu8nmwywDtB7RGUWhhPSQKBgQC3FGUD9uv9nuDXoaaTAyZW+oahFoDZy9M457HJTZpqhMW2fCvjtK+EEMzpR5c3CA8vnnudlz6uZF/tdRDYKSb5/cYuEsPcIqoS5YzpOWFSgklxyfDNvJFuKDisB1VPK4E7ypvRkMAVF1fBZiX3oZcSpwt+IOHDR6KsPC4jzuViSwKBgQDOBZuR2unBip7oBhrdNRiUZ0+NL+lj0DVDjC4aVuSoQ80pXAW7qzRdJaMcDe2Xo7Kmy+a4w7fS+T7wPA8Vu4R3X2xbjP4I4eCurwvipXzDgdGrIIzHhbW/RkaKQcCq/SaqfkcqeMWe3ZRN2o8ZlpyFoEf2AwtiAFD+/ouPn6Vptw==")
      .then(({ipfs}) => {
        return this.setStatePromise({ipfs})
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

  async initializeNode() {
    Box.openBox(this.state.publicAddress, this.state.ethereumProvider)
        .then((box) => {
          box.onSyncDone(async () => {
            console.log("Synced with box!")
            
          })
        })
  }

  componentDidMount () {
    const self = this
    self.getProfile()
        .then(() => {
          this.initializeNode()
        })
    self.create(true)
        .then(() => {
          self.state.ipfs.once('ready', () => {
            console.log('IPFS node is ready')
            ops()
          })
        })

    function ops () {
      self.state.ipfs.id((err, res) => {
        if (err) {
          throw err
        }
        self.setStatePromise({
          id: res.id,
          version: res.agentVersion,
          protocol_version: res.protocolVersion
        }).then(async () => {
          let orbitdb = new OrbitDB(self.state.ipfs)
          let db = await orbitdb.keyvalue('myfirstdb')
          await db.load();
          let value = db.get("value")
          console.log(db.address.toString())
          return self.setState({orbitdb, db, value})
        }).then(() => {
          console.log("App is now ready")
        }).catch((err) => {
          console.log(err)
        })
      })

      // node.files.add([Buffer.from(stringToUse)], (err, filesAdded) => {
      //   if (err) { throw err }

      //   const hash = filesAdded[0].hash
      //   self.setState({ added_file_hash: hash })

      //   node.files.cat(hash, (err, data) => {
      //     if (err) { throw err }
      //     self.setState({ added_file_contents: data.toString() })
      //   })
      // })
    }
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
        <p>Your IPFS version is <strong>{this.state.version}</strong></p>
        <p>Your IPFS protocol version is <strong>{this.state.protocol_version}</strong></p>
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