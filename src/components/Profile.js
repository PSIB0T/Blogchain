const React = require('react')

const styled = require('styled-components')
const { Grid, Cell,Chip,ChipContact,Badge, Textfield,FABButton,Icon,Card,CardText,CardTitle,CardMenu,IconButton, Button } = require('react-mdl');
const { Link } = require('react-router-dom');
const imageType = require('image-type');
const _ = require('lodash')
const fileReaderPullStream = require('pull-file-reader')

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
            profDb: null,
            postDb: null,
            tagString: "",
            tags: [],
            postTagList: "",
            posts: [],
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
                return this.props.globalDB.set(nick, profDb.address.toString())
              }).then(() => {
                return this.props.box.public.set('nick', nick)
              }).then(() => {
                return this.props.box.public.set('profDb', profDb.address.toString())
              }).then(() => {
                return this.setStatePromise({
                    noAccount: false,
                    profDb
                })
              }).then(() => {
                  console.log("Success!")
              }).catch((err) => {
                  console.log(err)
              })
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
        newTags.forEach(async (tag) => {
            tempTags = this.props.tagDbGlobal.query(doc => doc.tag === tag && doc.profile === profdburl)
            console.log("temptag for " + tag)
            console.log(tempTags)
            if (_.isEmpty(tempTags)) {
                await this.props.tagDbGlobal.put({_id: Date.now(), tag, profile: profdburl})
            }
        })

        let arrayDifference = _.difference(this.state.tags, newTags);
        arrayDifference.forEach(async (tag) => {
            tempTags = this.props.tagDbGlobal.query(doc => doc.tag === tag && doc.profile === profdburl)
            if (!_.isEmpty(tempTags)) {
                await this.props.tagDbGlobal.del(tempTags[0]._id)
            }
        })

        return Promise.resolve("success")
    }

    async handleTagSubmit(event) {
        tags = this.state.tagString.split(",").map((tag) => {
            return tag.trim()
        })
        if (!_.isEqual(_.sortBy(tags), _.sortBy(this.state.tags))) {
            this.state.profDb.set('tags', tags)
                        .then(() => {
                            return this.handleTags(tags)
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
        console.log(tags)
        if (tags !== null && tags !== undefined) {
            console.log("Inside loadtags")
            let tagString = tags.join(", ")
            console.log(tagString)
            return this.setStatePromise(({tags, tagString}))
        }
    }

    async fetchPosts() {
        let postDb
        postDb = this.state.postDb;
        let posts = postDb.query((doc) => true)
        posts.sort((a, b) => {
            return a._id - b._id
        })
        return this.setStatePromise({posts})
    }

    async loadFromBox(props) {
        let self = this;
        console.log(this.props)
        return this.props.box.public.get('profDb')
                    .then(async (dbAddress) => {
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

    handleUpvote(event) {
        let id = event.target.id;
        let address = this.state.profDb.address.toString();
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
        let address = this.state.profDb.address.toString();
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
        let profObjects = this.state.opProps.reduce((prevVal, currentVal) => {
            return {
                ...prevVal,
                [currentVal.prop]: profDb.get(currentVal.prop) 
            }
        }, {})
        return this.setStatePromise({
            loading: false,
            noAccount: false,
            profDb,
            ...profObjects
        })       
    }

    async loadPostDb() {
        let postDbUrl = this.state.profDb.get('postDBUrl')
        if (postDbUrl === undefined) {
            postDb = await this.props.orbitdb.docs(this.state.nick + "-posts", {write: ['*']})
            await this.state.profDb.set('postDBUrl', postDb.address.toString())
        } else {
            postDb = await this.props.orbitdb.docs(postDbUrl)
            await postDb.load()
        }
        return this.setStatePromise({postDb})
    }

    async loadGlobalDb(props) {
        let nick = props.match.params.nick
        this.setState({loading: true})
        if (nick === undefined) {
            return this.loadFromBox(props)
                        .then(() => {
                            return this.fetchPosts()
                        })
                        .then(() => {
                            return this.loadTags()
                        }).then(() => {
                            this.loadImage(this.state.profDb.get('imageHash'))
                        }).catch(err => {
                            console.log(err)
                        })
        } else {
            let dbAddress = this.props.globalDB.get(nick)
            return this.loadProfDb(dbAddress)
                        .then(() => {
                            return this.loadPostDb()
                        }).then(() => {
                            return this.fetchPosts()
                        })
        }

    }

    async editProp(prop) {
        let oldVal = this.state.profDb.get(prop)
        console.log(oldVal)
        if (oldVal === this.state[prop]) {
            return Promise.resolve()
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

    componentDidMount() {
        if (this.props.tagDbGlobal !== null) {
            this.loadGlobalDb(this.props)
        }
    }

    componentWillReceiveProps(nextProps) {
        if ((nextProps.tagDbGlobal !== null && this.props.tagDbGlobal !== nextProps.tagDbGlobal) || nextProps.isFriend !== this.props.isFriend) {
            console.log("Inside willreceiveprops")
            this.loadGlobalDb(nextProps)
        }
    }

    handleEdit(event) {
        this.setState({loading: true})
        this.state.opProps.map(async (opProp) => {
            await this.editProp(opProp.prop)
        })
        this.setState({loading: false})
        // propFind.show = false;   
    }

    renderPosts() {
        return (
        <div>
            {
                this.state.posts.map((post) => {
                    return (
                        <div>
                            <Card shadow={5} style={{width:700,marginLeft:20,marginTop:50}}>
                                <CardTitle style={{color: 'black', height: '100px'}} >1000 kg bombs</CardTitle>
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
                })
            }
        </div>

        )
    }

    renderEditProfile() {
        if (this.props.isFriend === true)
            return 
        return (
            <div>
                  <h2>Edit Your Profile </h2>
                  {this.state.opProps.map(opProp => {
                      return (<div>
                                <Textfield
                                onChange={this.handleChange.bind(this)}
                                label={"Edit Your " + opProp.name}
                                floatingLabel
                                name={opProp.prop}
                                style={{width: '200px'}}
                                value={this.state[opProp.prop]}
                                />
                            </div>)
                  })}
                  <Button raised colored onClick={this.handleEdit.bind(this)}>Submit</Button>
                  <hr style={{borderTop: '3px solid #e22947'}} />
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
        this.props.ipfs.files.cat(`/ipfs/${hash}`)
                        .then(file => {
                            let arrayBufferView = new Uint8Array(file);
                            var blob = new Blob( [ arrayBufferView ], { type:  imageType(file).mime} );
                            var urlCreator = window.URL || window.webkitURL;
                            var imageUrl = urlCreator.createObjectURL( blob );
                            this.imageElement.src = imageUrl
                            console.log(imageType(file))
                            // console.log(file.toString('utf8'))
                        })
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
                  <div style={{textAlign: 'center'}}>
                  
                    <img
                      src="https://www.shareicon.net/download/2015/09/18/103157_man_512x512.png"
                      alt="avatar"
                      ref={input => this.imageElement = input}
                      style={{height: '200px'}}
                       />
      
                  </div>
             
      
                <FABButton colored ripple onClick={this.clickInputElement.bind(this)}>
                    <Icon name="add" />
                    <input type="file" id="upload" style={{display: "none"}} ref={input => this.inputElement = input}
                        onChange={this.captureFile.bind(this)}
                    />
                </FABButton>
                  <h2 style={{paddingTop: '0em'}}>{this.state.fname}</h2>
                  <h4 style={{color: 'grey'}}>Programmer</h4>
                  <hr style={{borderTop: '3px solid #833fb2', width: '50%'}}/>
                  <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.</p>
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
                <ChipContact className="mdl-color--teal mdl-color-text--white">5</ChipContact>
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
        // return (
        //         <div>
        //             <DescComponent>
        //                 <UlComponent>
        //                     {this.state.opProps.map((opProp) => {
        //                         return (
        //                             <LiComponent><InnerDiv>{opProp.name}</InnerDiv>
        //                                 {opProp.show?<InnerDiv>{this.state[opProp.prop]}</InnerDiv>:<InnerDiv><input name={opProp.prop  } value={this.state[opProp.prop]} onChange={this.handleChange.bind(this)}/></InnerDiv>}
        //                                 <div><button id={opProp.prop} onClick={this.handleEdit.bind(this)}>Edit</button></div>
        //                             </LiComponent>
        //                         );
        //                     })}
        //                 </UlComponent>
        //             </DescComponent>
        //             <InputComponent name="tagString" id="tagString" value={this.state.tagString} onChange={this.handleChange.bind(this)} />
        //             <ButtonComponent onClick={this.handleTagSubmit.bind(this)}>Submit Tags</ButtonComponent>
        //             <br />
        //             <InputComponent name="postTagList" id="postTagList" value={this.state.postTagList} onChange={this.handleChange.bind(this)} />
        //             <br />
        //             <InputComponent name="post" id="post" value={this.state.post} onChange={this.handleChange.bind(this)} />
        //             <ButtonComponent onClick={this.handlePostSubmit.bind(this)}>Submit</ButtonComponent>

        //             <ButtonComponent onClick={this.deleteAccount.bind(this)}>Delete profile</ButtonComponent>
        //             <br />
        //             <PostsComponent>
        //             {
        //                 this.state.posts.map(post => {
        //                     return (<div>
        //                         <ParaComponent>{post.post}</ParaComponent>
        //                         <button id={post._id} onClick={this.handlePostDelete.bind(this)}>Delete</button>
        //                     </div>)
        //                 })
        //             }
        //             </PostsComponent>
        //         </div>
        //         )
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