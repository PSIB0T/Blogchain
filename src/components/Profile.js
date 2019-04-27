const React = require('react')

const styled = require('styled-components')
const { Grid, Cell,Chip,ChipContact,Badge, Textfield,FABButton,Icon,Card,CardText,CardTitle,CardMenu,IconButton, Button } = require('react-mdl');
const { Link } = require('react-router-dom');
const imageType = require('image-type');
const _ = require('lodash')
const fileReaderPullStream = require('pull-file-reader')
const Modal = require('react-modal');
let ReactSpoiler = require('react-spoiler')

class Profile extends React.Component {
    constructor(props) {
        super(props)
        this.inputElement = null
        this.imageElement = null
        this.state = {
            loading: true,
            noAccount: null,
            globalDB: null,
            nick: "",
            dob: "",
            fname: "",
            email: "",
            post: "",
            modalIsOpen: false,
            description: "",
            profession: "",
            profDb: null,
            postDb: null,
            tagString: "",
            tags: [],
            postTagList: "",
            posts: [],
            followers: [],
            permAddress: null,
            tagIdLabel: "",
            reputation: 0,
            opProps: [
                {
                    name: 'Nickname',
                    prop: 'nick',
                    show: true
                },
                {
                    name: 'Born',
                    prop: 'dob',
                    show: true
                },
                {
                    name: 'Email id',
                    prop: 'email',
                    show: true
                },{
                    name: 'Fullname',
                    prop: 'fname',
                    show: false
                },{
                    name: 'Description',
                    prop: 'description',
                    show: false
                },{
                    name: 'Profession',
                    prop: 'profession',
                    show: false
                },{
                    name: "Tags",
                    prop: "tagString",
                    show: true
                }
            ]
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

    handleChange(event) {
        const name = event.target.name
        this.setState({[name]: event.target.value});
    }

    async handleNickSubmit(event) {
        console.log(this.state.nick)
        let nick = this.state.nick
        let profDb = await this.props.orbitdb.keyvalue(nick);
        profDb.set('nick', nick)
              .then(() => {
                return this.props.globalDB.set(nick, {
                    address: profDb.address.toString(),
                    followers: []
                })
              }).then(() => {
                return this.props.box.public.set('nick', nick)
              }).then(() => {
                return this.props.box.public.set('profDb', profDb.address.toString())
              }).then(() => {
                return this.setStatePromise({
                    profDb
                })
              }).then(async () => {
                    return this.createPostDb()
              }).then(() => {
                  console.log("Success!")
              }).catch((err) => {
                  console.log(err)
              })
    }

    async createPostDb() {
        let postDb = await this.props.orbitdb.docs(this.state.nick + "-posts", {write: ['*']})
        await this.state.profDb.set('postDBUrl', postDb.address.toString())
        return this.setStatePromise({postDb, noAccount: false})
    }

    async deleteAccount() {
        let match = this.props.match2
        console.log(this.props.match2)
        let nick = this.state.nick
        this.props.globalDB.set(nick, null)
            .then(() => {
                return this.props.box.public.remove('profDb')
            }).then(() => {
                console.log("Success!")
                this.props.history.push(match.path)
            })
    }

    async handleTags(newTags) {
        let tempTags,
            profdburl = this.state.profDb.address.toString()
        console.log(profdburl)
        newTags = await Promise.all(newTags.map(tag => {
                        tempTags = this.props.tagDbGlobal.query(doc => doc.tag === tag && doc.profile === profdburl)
                        if (_.isEmpty(tempTags)) {
                            // let _id = Date.now() + Math.floor((Math.random() * 100000) + 1).toString()
                            // console.log(_id)
                            return this.props.tagDbGlobal.put({
                                _id: Date.now() + Math.floor((Math.random() * 100000) + 1).toString(), 
                                tag, 
                                profile: profdburl
                            })
                                        .then(() => Promise.resolve(newTags))
                        }
                        return Promise.resolve(newTags)

                    }))
        tempTags = this.props.tagDbGlobal.query(doc => true)
        console.log(tempTags)
        let arrayDifference = _.difference(this.state.tags, newTags);
        arrayDifference = await Promise.all(arrayDifference.map(tag => {
                                        tempTags = this.props.tagDbGlobal.query(doc => doc.tag === tag && doc.profile === profdburl)
                                        if (!_.isEmpty(tempTags)) {
                                            return this.props.tagDbGlobal.del(tempTags[0]._id)
                                                        .then(() => Promise.resolve(tag))
                                        }
                                            return Promise.resolve(tag)
                                    }))

        return Promise.resolve(arrayDifference)
    }

    async deleteTag(){
        let id = this.state.tagIdLabel
        if (id === null || id.length === 0 || id === undefined)
            return
        // await this.props.tagDbGlobal.del(id)
        let tempTags = this.props.tagDbGlobal.query(doc => true)
        console.log(tempTags)
    }

    async handleTagSubmit() {
        tags = this.state.tagString.split(",").map((tag) => {
            return tag.trim()
        })
        if (!_.isEqual(_.sortBy(tags), _.sortBy(this.state.tags))) {
            this.state.profDb.set('tags', tags)
                        .then(() => {
                            return this.handleTags(tags)
                        })
                        .then(() => {
                            return this.props.loadTags()
                        })
                        .then(() => {
                            console.log("Tags set successfully")
                            this.loadTags()
                        })
        }

    }

    async handlePostDelete(event) {
        let buttonId = event.target.id
        console.log(buttonId)
        this.state.postDb.del(buttonId)
                    .then(() => {
                        this.fetchPosts()
                    })
    }

    async loadTags() {
        let tags = this.state.profDb.get('tags')
        if (tags !== null && tags !== undefined) {
            console.log("Inside loadtags")
            let tagString = tags.join(", ")
            console.log(tagString)
            return this.setStatePromise(({tags, tagString}))
        }
    }

    async fetchPosts() {
        let rep = 0
        let postDb
        postDb = this.state.postDb;
        console.log("In fetchposts")
        console.log(postDb.address.toString())
        let posts = postDb.query((doc) => true)
        posts.sort((a, b) => {
            return a._id - b._id
        })
        posts.map(post => {
            let upvotes = post.upvotes?post.upvotes.length:0,
                downvotes = post.downvotes?post.downvotes.length:0;
            rep = rep + upvotes - downvotes
        })
        return this.setStatePromise({posts, reputation: rep})
    }
    getProfDbAddress() {
        return this.props.box.public.get('profDb')
                    .then((address) => {
                        return this.setStatePromise({permAddress: address})
                    })
    }
    async loadFromBox(props) {
        let self = this;
        console.log(this.props)
        return this.getProfDbAddress()
                    .then(async () => {
                        dbAddress = this.state.permAddress
                        if (dbAddress === null || dbAddress === undefined) {
                            return this.setStatePromise({
                                loading: false,
                                noAccount: true
                            })
                        } else {
                            return this.loadProfDb(dbAddress)
                        }
                    }).then(async () => {
                        if (this.state.noAccount === true)
                            return Promise.reject({code: 404, error: "No account"})
                        return this.loadPostDb()
                    })
    }

    deletePost(event) {
        let id = event.target.id
        if (id !== null && id !== undefined && id !== '') {
            this.state.postDb.del(id)
                      .then(() => {
                          this.fetchPosts()
                      })
        }
    }

    async handleUpvote(event) {
        let id = event.target.id;
        let target = event.target.parentElement
        let address = this.state.permAddress;
        if (target.nodeName === "BUTTON") {
            id = target.id
        }
        if (id !== null && id !== undefined && id !== '') {
            post = this.state.postDb.get(id)[0];
            post.upvotes = new Set(post.upvotes) || new Set([])
            post.downvotes = new Set(post.downvotes) || new Set([])
            if (post.upvotes.has(address)){
                post.upvotes.delete(address)
            } else {
                post.upvotes.add(address)
            }
            post.downvotes.delete(address)
            post.downvotes = Array.from(post.downvotes)
            post.upvotes = Array.from(post.upvotes)
            console.log(post)
            postDb.put(post)
                    .then(res => {
                        console.log("Upvoted successfully")
                        this.fetchPosts()
                    })
        }
    }
    handleDownvote(event) {
        let id = event.target.id;
        let target = event.target.parentElement
        let address = this.state.permAddress;
        if (target.nodeName === "BUTTON") {
            id = target.id
        }
        if (id !== null && id !== undefined && id !== '') {
            post = this.state.postDb.get(id)[0];
            post.upvotes = new Set(post.upvotes) || new Set([])
            post.downvotes = new Set(post.downvotes) || new Set([])
            if (post.downvotes.has(address)){
                post.downvotes.delete(address)
            } else {
                post.downvotes.add(address)
            }
            post.upvotes.delete(address)
            post.downvotes = Array.from(post.downvotes)
            post.upvotes = Array.from(post.upvotes)
            console.log(post)
            postDb.put(post)
                    .then(res => {
                        console.log("Downvoted successfully")
                        this.fetchPosts()
                    })
        }
    }

    async loadProfDb(dbAddress) {
        let profDb = await this.props.orbitdb.keyvalue(dbAddress)
        await profDb.load()
        this.setStatePromise({
            noAccount: false,
            profDb,
        }).then(() => {
            return this.loadProfDbObjects()
        })       
    }

    loadProfDbObjects() {
        let profObjects = this.state.opProps.reduce((prevVal, currentVal) => {
            return {
                ...prevVal,
                [currentVal.prop]: this.state.profDb.get(currentVal.prop) 
            }
        }, {})

        return this.setStatePromise({...profObjects})
                    .then(() => {
                        let followers = this.props.globalDB.get(this.state.nick)?this.props.globalDB.get(this.state.nick).followers:[]
                        console.log(followers)
                        return this.setStatePromise({followers, loading: false})
                    }).then(() => {
                        return this.loadTags()
                    }).then(() => {
                        return this.loadImage(this.state.profDb.get('imageHash'))
                    })

    }

    async loadPostDb() {
        let postDbUrl = this.state.profDb.get('postDBUrl')
        if (postDbUrl === undefined) {
            if (this.props.isFriend === false) {
                await this.createPostDb()
                postDbUrl = this.state.postDb.address.toString()
                console.log(postDbUrl)
            } else {
                return this.setStatePromise({loading: true})
            }
        }
        postDb = await this.props.orbitdb.docs(postDbUrl)
        console.log("Postdburl")
        console.log(postDbUrl)
        await postDb.load()
        postDb.events.on("replicated", () => {
            console.log("Postdb replicated!")
            this.fetchPosts()
        })
        return this.setStatePromise({postDb})
                    .then(() => {
                        return this.fetchPosts()
                    })
    }

    async loadGlobalDb(props) {
        let nick = props.match.params.nick
        this.setState({loading: true, postDb: null, posts: []})
        if (nick === undefined) {
            return this.loadFromBox(props)
                        .catch(err => {
                            console.log(err)
                        })
        } else {
            let dbAddress = this.props.globalDB.get(nick).address.toString()
            return this.loadProfDb(dbAddress)
                        .then(() => {
                            return this.getProfDbAddress()
                        }).then(() => {
                            return this.loadPostDb()
                        })
        }

    }

    async editProp(prop) {
        let oldVal = this.state.profDb.get(prop)
        if (oldVal === this.state[prop]) {
            return Promise.resolve()
        }
        else if (prop === "tagString") {
            return this.handleTagSubmit()
        }
        return this.setStatePromise({loading: true})
                    .then(() => {
                        return this.state.profDb.set(prop, this.state[prop])
                    }).then(() => {
                        console.log("Edit made successfully")
                    }).catch((err) => {
                        console.log(err)
                        return this.setStatePromise({loading: false})
                    })
    }

    loadEventEmitters() {
        console.log("Inside loadeventEmitters")
        this.state.profDb.events.on("replicated", () => {
            console.log("Profdb replicated!")
            if (this.state.postDb === null) {
                this.loadPostDb()
            }
            this.loadProfDbObjects()
        })

        this.state.profDb.events.on('replicate.progress', (address, hash, entry, progress, have) => {
            console.log(progress)
            console.log(address)
        } )


    }

    componentDidMount() {
        if (this.props.tagDbGlobal !== null) {
            this.loadGlobalDb(this.props)
                .then(() => {
                    this.loadEventEmitters()
                })
        }
    }

    componentWillReceiveProps(nextProps) {
        if ((nextProps.tagDbGlobal !== null && this.props.tagDbGlobal !== nextProps.tagDbGlobal) || 
            this.props.match.params.nick !== nextProps.match.params.nick) {
            console.log("Inside willreceiveprops")
            this.loadGlobalDb(nextProps)
                .then(() => {
                    this.loadEventEmitters()
                })
        }
    }

    handleEdit(event) {
        this.setState({loading: true})
        this.state.opProps.map(async (opProp) => {
            await this.editProp(opProp.prop)
        })
        this.setState({loading: false})
    }

    renderPost(post) {
        return (
            <div>
                <Card shadow={5} style={{width:700,marginLeft:20,marginTop:50}}>
                    <CardTitle style={{color: 'black', height: '100px'}} >{post.title}</CardTitle>
                    <CardText>
                        {post.post}
                    </CardText>
        
                    <CardMenu style={{color: 'black'}}>
                    <IconButton name="share" />
                    </CardMenu>
                </Card>  
                <IconButton style={{marginLeft:20,marginTop:20,marginBottom:20 }} id={post._id} onClick={this.handleUpvote.bind(this)} name="thumb_up" />
                {post.upvotes ? post.upvotes.length : 0}
                <IconButton style={{marginLeft:10,marginTop:20,marginBottom:20 }} id={post._id} onClick={this.handleDownvote.bind(this)} name="thumb_down" />
                {post.downvotes ? post.downvotes.length : 0}      
                <IconButton style={{marginLeft: 30,marginTop:20,marginBottom:20 }} id={post._id} name="delete" onClick={this.deletePost.bind(this)}/>
                <div>
                    <Textfield 
                    onChange={() => {}}
                    label="Comment..!!"
                    floatingLabel
                    style={{width: '800px',marginLeft:20}}
                    />
                </div>
            </div>
        )
    }

    renderPosts() {
        return (
        <div>
            {
                this.state.posts.map((post) => {
                    if (post.isSpam === true) {
                        return (
                            <ReactSpoiler>
                                {this.renderPost(post)}
                            </ReactSpoiler>
                    )
                    }
                    return this.renderPost(post);
                })
            }
        </div>

        )
    }
    openModal() {
        this.setState({modalIsOpen: true});
    }

    closeModal() {
        this.setState({modalIsOpen: false});
    }

    renderEditProfile() {
        if (this.props.isFriend === true)
            return 
        return (
            <div>
                <Button raised colored onClick={this.openModal.bind(this)}>Edit Profile</Button>
                    <div>
                        <Modal
                            isOpen={this.state.modalIsOpen}
                            onRequestClose={this.closeModal}
                            contentLabel="Example Modal"
                            style={{
                                content: {
                                    top                   : '50%',
                                    left                  : '50%',
                                    right                 : 'auto',
                                    bottom                : 'auto',
                                    marginRight           : '-50%',
                                    transform             : 'translate(-50%, -50%)',
                                },
                                overlay: {
                                    zIndex                : '5',
                                }
                            }}
                        >
                            <h2>Edit Your Profile </h2>
                            {this.state.opProps.map(opProp => {
                                if (opProp.prop === "nick")
                                    return
                                return (<div>
                                            <Textfield
                                            onChange={this.handleChange.bind(this)}
                                            label={"Edit Your " + opProp.name}
                                            onBlur={this.handleEdit.bind(this)}
                                            floatingLabel
                                            name={opProp.prop}
                                            style={{width: '500px'}}
                                            value={this.state[opProp.prop]}
                                            />
                                        </div>)
                            })}
                            <Button raised colored onClick={this.closeModal.bind(this)}>Submit</Button>
                        </Modal>
                        <hr style={{borderTop: '3px solid #e22947'}} />
                    </div>


            </div>
        )
    }

    clickInputElement() {
        this.inputElement.click()
    }

    captureFile(event){
        event.preventDefault()
        console.log("Captured file!")
        const file = event.target.files[0]
        this.saveToIpfs(file)
    }

    saveToIpfs (file) {
        let ipfsId
        const fileStream = fileReaderPullStream(file)
        this.props.ipfs.files.add(fileStream, { progress: (prog) => console.log(`received: ${prog}`) })
          .then((response) => {
            console.log(response)
            ipfsId = response[0].hash
            console.log(ipfsId)
            this.setStatePromise({added_file_hash: ipfsId})
          }).then(() => {
              return this.state.profDb.set('imageHash', this.state.added_file_hash)
          }).then(() => {
              return this.loadImage(this.state.added_file_hash)
          }).catch((err) => {
            console.error(err)
          })
    }

    loadImage(hash) {
        console.log("Hash is " + hash)
        if (hash === undefined)
            return Promise.resolve()
        return this.props.ipfs.files.cat(`/ipfs/${hash}`)
                        .then(file => {
                            let arrayBufferView = new Uint8Array(file);
                            var blob = new Blob( [ arrayBufferView ], { type:  imageType(file).mime} );
                            var urlCreator = window.URL || window.webkitURL;
                            var imageUrl = urlCreator.createObjectURL( blob );
                            this.imageElement.style.backgroundImage = `url("${imageUrl}")`
                            console.log(imageType(file))
                        })
    }

    followProfile() {
        let followers = this.state.followers
        followers = new Set(followers)
        if (followers.has(this.state.permAddress)) {
            followers.delete(this.state.permAddress)
        } else {
            followers.add(this.state.permAddress)
        }
        followers = Array.from(followers)
        let temp = this.props.globalDB.get(this.state.nick)
        this.props.globalDB.set(this.state.nick, {...temp, followers})
                    .then(() => {
                        return this.setStatePromise({
                            followers
                        })
                    })
    }

    renderImageOrFollow() {
        if (this.props.isFriend === false) {
            return(
                <div>
                    <FABButton colored ripple onClick={this.clickInputElement.bind(this)}>
                        <Icon name="add_a_photo" />
                        <input type="file" id="upload" style={{display: "none"}} ref={input => this.inputElement = input}
                            onChange={this.captureFile.bind(this)}
                        />
                    </FABButton>
                </div>
            )
        } else {
            return (
                <div>
                    <FABButton colored ripple onClick={this.followProfile.bind(this)}>
                        <Icon name="add" />
                    </FABButton>
                </div>
            )
        }

    }

    renderProfile() {
        if (this.state.loading === true ) {
            return (<p>Loading...</p>)
        } else if (this.state.noAccount === true) {
            return (
                <div>
                    <p>Welcome user! please enter your nick</p>
                    <input name="nick" id="nick" value={this.state.nick} onChange={this.handleChange.bind(this)}/>
                    <button onClick={this.handleNickSubmit.bind(this)}>Submit</button>
                </div>
            )
        }
        return(
            <div>
              
              <Grid>
                <Cell col={4}>
                  <div style={{
                                textAlign: 'center', 
                                height: "200px",
                                maxWidth: "300px",
                                backgroundSize: "cover",
                                backgroundPosition: "center"
                                }} ref={(input=> this.imageElement = input)}>
      
                  </div>
             
                {this.renderImageOrFollow()}

                  <h2 style={{paddingTop: '0em'}}>{this.state.fname}</h2>
                  <h4 style={{color: 'grey'}}>{this.state.profession}</h4>
                  <Chip>
                    <ChipContact className="mdl-color--teal mdl-color-text--white">{this.state.reputation}</ChipContact>
                    Reputation
                
                </Chip>
                  <hr style={{borderTop: '3px solid #833fb2', width: '50%'}}/>
                  <p>{this.state.description}</p>
                  <hr style={{borderTop: '3px solid #833fb2', width: '50%'}}/>
                  {
                      this.state.opProps.map(opProp => {
                          if (opProp.show) {
                            return (
                                <div>
                                    <h5>{opProp.name}</h5>
                                    <p>{this.state[opProp.prop]}</p>
                                </div>
                            )
                          }

                      })
                  }
                  <hr style={{borderTop: '3px solid #833fb2', width: '50%'}}/>
                <Chip>
                <ChipContact className="mdl-color--teal mdl-color-text--white">{this.state.followers.length}</ChipContact>
                <Link to="/follower">Followers</Link>
                
                </Chip>
                
                </Cell>
                <Cell className="resume-right-col" col={8}>
                <div></div>
                  {this.renderEditProfile()}
                  <div>

                  </div>
                {this.renderPosts()}
      
                </Cell>
              </Grid>
            </div>
          )
    }

    render(){
        return (
            <div>
                {this.renderProfile()}
            </div>
        );
    }
}

module.exports = Profile