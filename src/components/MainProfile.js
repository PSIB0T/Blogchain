'use strict'

const React = require('react')
const OrbitDB = require('orbit-db');
const Box = require('3box');
const path = require('path')
const { BrowserRouter, Route, Switch } = require('react-router-dom')
const styled = require('styled-components')

const SetNo = require('./SetNo')
const Navigation = require('./Navigation')
const Profile = require('./Profile')
const KeyStore = require('./../utils/Keystore');
const Search = require('./Search')
const ProfFriend = require('./ProfFriend');
let {createIPFSobj} = require('./../utils/IpfsUtil')
const SideNav = require('./Sidenav')


const DivComponent = styled.default('div')`
                            margin:10px 0px 0px 258px;`

class MainProfile extends React.Component {
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
      receiveurl: "",
      ipfs: null,
      orbitdb: null,
      db: null,
      value: null,
      globalDB: null,
      searchField: ""
    }
    console.log("Mainprops")
    console.log(props)
    this.setStatePromise = props.setStatePromise
  }

  renderAuthErr() {
    if (this.state.metamaskOff === true) {
      return (
        <p>Please login using metamask</p>
      );
    }
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
  async loadGlobalDb(props) {
    let globalDB = await this.state.orbitdb.keyvalue(`/orbitdb/QmeuGQ4KdmdFD8WTN5r5mvF3s6pk1sXG5nXdYxP1dorW7K/globalDatabase`)
    return globalDB.load()
                    .then(() => {
                        console.log("globaldb address")
                        console.log(globalDB.address.toString())
                        return this.setStatePromise({globalDB})
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
      throw err
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
        }).then(() => {
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
          return this.loadGlobalDb()
        })
        .then(() => {
          console.log("App is now ready")
        }).catch((err) => {
          console.log(err)
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
    let match = this.props.match
    return (
      <BrowserRouter>
        <DivComponent>
          {this.renderAuthErr()}
          {/* <Navigation /> */}
          {/* <Search /> */}
          <SideNav match={match}/>
          <Switch>
            <Route 
              path={`${match.path}/profile/:nick`}
              render={(props) => <ProfFriend {...props} 
              orbitdb={this.state.orbitdb}
              globalDB={this.state.globalDB}
              />}
            />
            <Route
              path={`${match.path}/search`}
              render={(props) => <Search {...props}
                match2={this.props.match}
              />}
            />
            <Route 
              path={`${match.path}/profile`}
              render={(props) => 
              <Profile 
                orbitdb={this.state.orbitdb}
                box={this.state.box}
                globalDB={this.state.globalDB}
                />}
            />
            <Route 
              path={`${match.path}`}
              render={(props) => 
                <SetNo id={this.state.id} 
                value={this.state.value}
                handleChange={this.handleChange.bind(this)} 
                handleNoSubmit={this.handleNoSubmit.bind(this)}
                receiveurl={this.state.receiveurl}
                handleUrlSubmit={this.handleUrlSubmit.bind(this)}
              />
            }
            />
 

          </Switch>
        </DivComponent>

      </BrowserRouter>
    )
  }
}


module.exports = MainProfile