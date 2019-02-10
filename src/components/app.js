'use strict'

const React = require('react')
const IPFS = require('ipfs')
const OrbitDB = require('orbit-db');

const stringToUse = 'hello world from webpacked IPFS'

class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      id: null,
      version: null,
      protocol_version: null,
      added_file_hash: null,
      added_file_contents: null,
      receiveurl: "",
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

  componentDidMount () {
    const self = this
    let node

    create()

    function create () {
      // Create the IPFS node instance

      node = new IPFS({
          EXPERIMENTAL: {pubsub: true},
          config: {
            Addresses: {
              Swarm: [
                '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
              ]
            }
          }
        })

      node.once('ready', () => {
        console.log('IPFS node is ready')
        ops()
      })
    }

    function ops () {
      node.id((err, res) => {
        if (err) {
          throw err
        }
        self.setStatePromise({
          id: res.id,
          version: res.agentVersion,
          protocol_version: res.protocolVersion
        }).then(async () => {
          let orbitdb = new OrbitDB(node)
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