const React = require('react')
const { Router, Route, Switch, Link } = require('react-router-dom')
const { Layout, Header, Navigation, Drawer, Content } = require('react-mdl');
const FuzzySearch = require('./FuzzySearch')
const TempTagList = require('./TempTagList')
let {createIPFSobj} = require('./../utils/IpfsUtil')
const OrbitDB = require('orbit-db');

class TempSession extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            tagDb: null,
            tagList: [],
            orbitdb: null,
            ipfs: null,
            posts: []
        }

        this.list = [{
            id: 1,
            title: 'The Great Gatsby',
            author: 'F. Scott Fitzgerald'
          }, {
            id: 2,
            title: 'The DaVinci Code',
            author: 'Dan Brown'
          }, {
            id: 3,
            title: 'Angels & Demons',
            author: 'Dan Brown'
          }];
        this.list2 = [{
            id: 1,
            title: 'The Great contraception',
            author: 'F. Scott Fitzgerald'
            }, {
            id: 2,
            title: 'The gg Code',
            author: 'Dan Brown'
            }, {
            id: 3,
            title: 'Angels & fucbois',
            author: 'Dan Brown'
        }];

        this.setStatePromise = this.props.setStatePromise
    }

    async create(pubString) {

        return createIPFSobj(pubString)
                        .then(({ipfs}) => {
                            return this.setStatePromise({ipfs})
                        })
    }

    async loadTagDb() {
        let tagDb = await this.state.orbitdb.docs('/orbitdb/QmTTmfEZwHcD35Mojh468qp5iJS3Dv8QdYoGU3r6Xf3Fsv/tagdb')
        await tagDb.load()
        tagDb.events.on('replicated', () => {
            console.log("Replicated!")
            this.loadTags()
        })
        return this.setStatePromise({tagDb})
    }

    async loadTags() {
        let posts = this.state.tagDb.query(doc => true)
        let tags = Array.from(new Set(posts.map(post => post.tag)))
        tags = tags.map(tag => {
            return {
                title: tag
            }
        })
        // console.log(tags)
        return this.setStatePromise({tagList: tags, posts})
    }

    componentDidMount() {
        this.create("")
            .then(() => {
                return new Promise((resolve, reject) => {
                    this.state.ipfs.once('ready', () => {
                        let orbitdb = new OrbitDB(this.state.ipfs)
                        this.setStatePromise({orbitdb})
                            .then(() => {
                                resolve("Success")
                            }).catch((err) => {
                                reject(err)
                            })
                    })
                })

            }).then(() => {
                return this.loadTagDb()
            }).then(() => {
                return this.loadTags()
            })
    }

    action(event) {
        let match = this.props.match
        // console.log(event)
        this.props.history.push("/temp/tag/" + event.title)
    }

    render () {
        let match = this.props.match
        return (
                <div>
                    <Header className="header-color" title={<Link style={{textDecoration: 'none', color: 'white'}} to="/">Home</Link>} scroll>
                        <Navigation>

                        </Navigation>
                    </Header>
                    <Switch>
                        <Route 
                            exact path={`/temp/tag/:tagId`}
                            render={(props) => <TempTagList {...props} 
                                                setStatePromise={this.setStatePromise} 
                                                tagDb={this.state.tagDb}
                                                orbitdb={this.state.orbitdb}
                                                posts={this.state.posts}
                                                loadTags={this.loadTags.bind(this)}
                            
                                                />}
                        />
                        <Route 
                            exact path={`/temp/`}
                            render={(props) => <TempTagList {...props} 
                                                setStatePromise={this.setStatePromise} 
                                                tagDb={this.state.tagDb}
                                                orbitdb={this.state.orbitdb}
                                                posts={this.state.posts}
                                                loadTags={this.loadTags.bind(this)}
                                                />}
                        />
                    </Switch>
                </div>
        );
    }
}

module.exports = TempSession