'use strict'

const React = require('react')
const OrbitDB = require('orbit-db');
const Box = require('3box');
const path = require('path')
const { BrowserRouter, Route, Switch, Link } = require('react-router-dom')
const styled = require('styled-components')
const { Navigation, Header } = require('react-mdl');
const SetNo = require('./SetNo')
const Profile = require('./Profile')
const TagList = require('./TagList')
const KeyStore = require('./../utils/Keystore');
const SearchByUsername = require('./SearchByUsername')
const SearchByTag = require('./SearchByTag')
const ProfFriend = require('./ProfFriend');
let {createIPFSobj} = require('./../utils/IpfsUtil')
const TempTagList = require('./TempTagList')
const FuzzySearch = require('./FuzzySearch')


const DivComponent = styled.default('div')`
                            margin: 0px;`

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
      tagDb: null,
      tagDbGlobal: null,
      tagList: [],
      posts: [],
      db: null,
      value: null,
      globalDB: null,
      searchField: ""
    }
    this.list = []
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
  async loadGlobalDb() {
    let globalDB = await this.state.orbitdb.keyvalue(`/orbitdb/QmeuGQ4KdmdFD8WTN5r5mvF3s6pk1sXG5nXdYxP1dorW7K/globalDatabase`)
    return globalDB.load()
                    .then(() => {
                        console.log("globaldb address")
                        console.log(globalDB.address.toString())
                        globalDB.events.on('replicated', () => {
                          console.log("Globaldb replicated!")
                        })
                        return this.setStatePromise({globalDB})
                    }).then(() => {
                      return this.loadTagDb()
                    })
  }

  async loadTagDb() {
    let tagDbGlobal = await this.state.orbitdb.docs('/orbitdb/QmNwa1jH1F9AmX8P2s7yywp2SBJdrsXwTM4VVyevR2tRrg/tagdbGlobal')
    let tagDb = await this.state.orbitdb.docs('/orbitdb/QmPC79YHyyJM3DcZVyc33GRC2i9ohQD6Nbv9sDaKXMo77T/tagdb2')
    await tagDb.load(5)
    tagDb.events.on('replicated', () => {
      console.log("Replicated tagdb!")
      this.loadTags()
    })
    return this.setStatePromise({tagDbGlobal, tagDb})
                .then(() => {
                  return this.loadTags()
                })
  }

  async loadTags() {
    let posts = this.state.tagDb.query(doc => true)
    let tags = Array.from(new Set(posts.map(post => post.tag)))
    tags = tags.map(tag => {
        return {
            title: tag
        }
    })
    console.log(posts)
    // console.log(tags)
    return this.setStatePromise({tagList: tags, posts})
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
              // console.log("Orbit db public key is ")
              // console.log(orbitdb.key.getPublic('hex'))
              self.setStatePromise({orbitdb,id: id.id})
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
  }
  action(event) {
    let match = this.props.match
    // console.log(event)
    this.props.history.push("/main/tag/" + event.title)
  } 

  render () {
    let match = this.props.match
    return (
        <DivComponent>
          {this.renderAuthErr()}
          <Header className="header-color" title={<Link style={{textDecoration: 'none', color: 'white'}} to={`${match.path}`}>Home</Link>} scroll>
            <Navigation>
            <FuzzySearch
                list2={this.state.tagList}
                list={this.list}
                keys={['title']}
                width={430}
                onSelect={this.action.bind(this)}
              />  
              <Link to="/main/profile" className="navLink">Profile</Link>
              <Link to="/main/search" className="navLink">Search Profile</Link>
              <Link to="/main/tags" className="navLink">PostsByTag</Link>
            </Navigation>
          </Header>

          <Switch>
            <Route 
              exact path={`/main/profile/:nick`}
              render={(props) => 
              <Profile
                {...props}
                orbitdb={this.state.orbitdb}
                isFriend={true}
                box={this.state.box}
                globalDB={this.state.globalDB}
                match2={this.props.match}
                tagDbGlobal={this.state.tagDbGlobal}
                />}
              />
            <Route 
              exact path={`/main/tag/:tag`}
              render={(props) => <TempTagList {...props} 
              setStatePromise={this.setStatePromise} 
              tagDb={this.state.tagDb}
              orbitdb={this.state.orbitdb}
              posts={this.state.posts}
              loadTags={this.loadTags.bind(this)}
              metamaskOff={this.state.metamaskOff}
              address={this.state.address}
              />}
            />
            <Route 
                exact path={`/main/tags`}
                render={(props) => <TempTagList {...props} 
                setStatePromise={this.setStatePromise} 
                tagDb={this.state.tagDb}
                orbitdb={this.state.orbitdb}
                posts={this.state.posts}
                loadTags={this.loadTags.bind(this)}
                metamaskOff={this.state.metamaskOff}
                address={this.state.address}
                />}
            />
            <Route
              exact path={`/main/search`}
              render={(props) => <SearchByUsername {...props}
                match2={this.props.match}
              />}
            />
            <Route
              exact path={`/main/searchbytag`}
              render={(props) => <SearchByTag {...props}
                match2={this.props.match}
              />}
            />
            <Route 
              exact path={`/main/profile`}
              render={(props) => 
              <Profile
                {...props}
                orbitdb={this.state.orbitdb}
                box={this.state.box}
                isFriend={false}
                globalDB={this.state.globalDB}
                match2={this.props.match}
                tagDbGlobal={this.state.tagDbGlobal}
                />}
            />
            <Route 
              exact path={`/main/`}
              render={(props) => 
                <SetNo id={this.state.id} 
                tagDb={this.state.tagDb}
                globalDB={this.state.globalDB}
                orbitdb={this.state.orbitdb}
                box={this.state.box}
                metamaskOff={this.state.metamaskOff}
                setStatePromise={this.setStatePromise} 
              />  
            }
            />
 

          </Switch>
        </DivComponent>
    )
  }
}


module.exports = MainProfile