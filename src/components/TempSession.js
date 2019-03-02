'use strict'

const React = require('react')
const OrbitDB = require('orbit-db');

let {createIPFSobj} = require('./../utils/IpfsUtil')


class TempSession extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            errorLoading: false,
            orbitdb: null,
            ipfs: null,
            tag: "",
            post: "",
            tagList: new Set(),
            postList: [],
            tagDb: null
        }
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
            this.loadPosts()
        })
        return this.setStatePromise({tagDb})
    }

    loadPosts() {
        let posts = this.state.tagDb.query((doc) => true),
            tags = new Set(posts.map(post => post.tag))
        posts.sort((a, b) => {
            return a._id - b._id
        })
        let postByTag = posts.reduce((accumulator, currentvalue) => {
            accumulator[currentvalue.tag] = accumulator[currentvalue.tag] || []
            accumulator[currentvalue.tag].push(currentvalue.post)
            return accumulator
        }, {})
        return this.setStatePromise({
            tagList: tags,
            postList: postByTag
        })
    }

    componentDidMount() {
        this.create("")
            .then(() => {
                return new Promise((resolve, reject) => {
                    this.state.ipfs.once('ready', () => {
                        let orbitdb = new OrbitDB(this.state.ipfs)
                        this.setStatePromise({orbitdb, isLoading: false})
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
                return this.loadPosts()
            }).catch((err) => {
                this.setStatePromise({isLoading: false, errorLoading: true})
                console.log(err)
            })
    }

    handleChange(event) {
        const name = event.target.name
        this.setState({[name]: event.target.value});
    }

    handlePostSubmit() {
        let tag = this.state.tag,
            post = this.state.post;
        this.state.tagDb.put({
            _id: Date.now(),
            tag,
            post
        }).then((res) => {
            this.loadPosts()
        })
    }

    renderPosts() {
        let tagList = Array.from(this.state.tagList)
        return (
        <div>
            {tagList.map((tag) => {
                return (
                    <div>
                        <h2>{tag}</h2>
                        {this.state.postList[tag].map(post => {
                            return (<p>{post}</p>)
                        })}
                    </div>
                );
            })}
        </div>);
    }

    loadComponent() {
        if (this.state.isLoading) {
            return (<p>Loading...</p>)
        } if (this.state.err) {
            return (<p>Error loading...</p>)
        } 
        return (
        <div>
            <label for="tag">Tag</label>
            <input name="tag" id="tag" value={this.state.tag} onChange={this.handleChange.bind(this)} />
            <br />
            <label for="post">Post</label>
            <input name="post" id="post" value={this.state.post} onChange={this.handleChange.bind(this)} />
            <br />
            <button onClick={this.handlePostSubmit.bind(this)}>Submit</button>
            {this.renderPosts()}
        </div>)
    }

    render() {
        return (
          <div>
              {this.loadComponent()}
          </div>  
        );
    }
}

module.exports = TempSession