'use strict'

const React = require('react')
let { Grid, Cell, Card, CardTitle, CardText,  CardMenu, IconButton, Textfield } = require('react-mdl');
let { matchPath } = require('react-router-dom')
let ReactSpoiler = require('react-spoiler')
let bayes = require('bayes')
const _ = require('lodash')
let jsonData = require('./../utils/test.json')
let {NotificationContainer, NotificationManager} = require('react-notifications');
let Captcha = require('./captcha')


class TempTagList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            errorLoading: false,
            orbitdb: null,
            ipfs: null,
            tag: "",
            post: "",
            captcha: "",
            notAuthorized: false,
            tagList: new Set(),
            postList: [],
            profiles: [],
            profDbList: [],
            postDbUrlList: [],
            knownPostObject: {}
        }
        this.setStatePromise = this.props.setStatePromise
        this.classifier = bayes.fromJson(JSON.stringify(jsonData))
        this.captchaRef = React.createRef();
        this.maxCharacters = 140;
    }

    loadAnonPosts(tagFilter) {
        if (this.props.metamaskOff === true) {
            return this.setStatePromise({isLoading: false})
        }
        this.setState({isLoading: true})
        let posts = this.props.posts
        let tags = new Set(posts.map(post => post.tag))
        if (tagFilter !== undefined && tagFilter !== null) {
            tagFilter = tagFilter.split(",").map(tag => tag.trim())
            tags = Array.from(tags).filter(tag => _.includes(tagFilter, tag))
            tags = new Set(tags)
        }
        let postByTag = posts.reduce((accumulator, currentvalue) => {
            accumulator[currentvalue.tag] = accumulator[currentvalue.tag] || []
            accumulator[currentvalue.tag].push({post: currentvalue.post, id: currentvalue._id, isSpam: currentvalue.isSpam})
            return accumulator
        }, {})
        return this.setStatePromise({
            tagList: tags,
            postList: postByTag,
            isLoading: false
        })
    }

    loadPosts(tagFilter) {
        if (tagFilter === undefined || tagFilter === null) {
            return Promise.resolve()
        }
        console.log("Inside loadposts")
        let profiles = this.props.tagDbGlobal.query(doc => doc.tag === tagFilter)
                                            .map(res => {
                                                return res.profile
                                            })
        console.log(profiles)
        profiles = _.difference(profiles, this.state.profiles)
        console.log(profiles)
        return this.setStatePromise({profiles})
                    .then(async () => {
                        let profDbList = this.state.profDbList;
                        await Promise.all(profiles.map(async profileAddress => {
                            let profDb = await this.props.orbitdb.keyvalue(profileAddress)
                            await profDb.load()
                            
                            profDb.events.on("replicated", () => {
                                console.log("Replicated temptag profdb")
                                this.loadPostsFromProfile(profDb)
                            })
                            profDbList.push(profDb)
                            return Promise.resolve()
                        }))
                        return this.setStatePromise({profDbList})
                    }).then(() => {
                        this.state.profDbList.map(profDb => {
                            this.loadPostsFromProfile(profDb, tagFilter)
                        })
                    })
    }

    async loadPostsFromProfile(profDb, tag) {
        console.log("Inside loadpostsfromprofile")
        let postDbUrl = profDb.get('postDBUrl'),
            nick = profDb.get('nick')
        if (postDbUrl === null || postDbUrl === undefined) {
            return Promise.resolve()
        }
        let postDb = await this.props.orbitdb.docs(postDbUrl)
        await postDb.load()
        if(_.includes(this.state.postDbUrlList, postDb.address.toString())) {
            return Promise.resolve()
        }
        this.state.postDbUrlList.push(postDb.address.toString())
        postDb.events.on("replicated", () => {
            console.log("Postdb replicated inside temptags")
            this.setPostsToProfile(postDb, tag, nick)
        })
        return this.setStatePromise({postDbUrlList: this.state.postDbUrlList})
                    .then(() => this.setPostsToProfile(postDb, tag, nick))
    }

    setPostsToProfile(postDb, tag, nick) {
        console.log("Inside setpoststoprofile")
        let posts = postDb.query(doc => true).filter(post => {
            return _.includes(post.tags, tag)
        }).map(post => {
            return {
                post: post.post,
                tag
            }
        })
        console.log(posts)
        let knownPostObject = this.state.knownPostObject
        knownPostObject[nick] = posts
        console.log(knownPostObject)
        return this.setStatePromise({knownPostObject})
    }

    loadAllTags(tagFilter) {
        this.loadAnonPosts(tagFilter)
            .then(() => {
                return this.loadPosts(tagFilter)
            })
    }

    componentDidMount() {
        if (this.props.posts.length !== 0) {
            this.loadAllTags(this.props.match.params.tag)
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.posts !== this.props.posts || prevProps.match.params.tag !== this.props.match.params.tag) {
            this.loadAllTags(this.props.match.params.tag)
        } 
    }


    handleChange(event) {
        const name = event.target.name
        this.setState({[name]: event.target.value});
    }

    async insertTags(tags, post, isSpam) {
        let randNo;
        try {
            for (let i = 0, p = Promise.resolve(); i < tags.length; i++) {
                p = p.then(_ => {
                    randNo = String(Date.now()) + String(Math.floor(Math.random() * 10000))
                    return this.props.tagDb.put({
                        _id: randNo,
                        tag: tags[i].toLowerCase(),
                        post,
                        isSpam
                    })
                });
            }
            return Promise.resolve("Success")
        } catch(err) {
            return Promise.reject(err)
        }

    } 

    handlePostSubmit() {
        this.captchaRef.current.validateCaptcha()
                        .then(() => {
                            if (this.captchaRef.current.state.isValid === false) {
                                return Promise.reject({status: "Error", message: "Invalid captcha"})
                            } else {
                                let tags = this.state.tag,
                                    post = this.state.post,
                                    isSpam
                                if (tags.length === 0 || post.length === 0) {
                                    return Promise.reject({status: "Error", message: "Post or tag field is empty"})
                                }
                                if (this.classifier.categorize(post.toLowerCase()) === "spam") {
                                    isSpam = true
                                } else {
                                    isSpam = false
                                }
                                tags = tags.split(",").map(tag => {
                                    return tag.trim()
                                })
                                return this.insertTags(tags, post, isSpam)
                            }
                        }).then(() => {
                            NotificationManager.success('Successfully submitted post!', 'Success');
                            return this.setStatePromise({tag: "", post: ""})
                        }).then(() => {
                            this.props.loadTags()
                            this.captchaRef.current.generateCaptcha()
                        }).catch(err => {
                            NotificationManager.error(err.message, err.status);
                        })
    }

    deletePost(event) {
        let id = event.target.id
        if (id !== null && id !== undefined && id !== '') {
            this.props.tagDb.del(id)
                      .then(() => {
                        NotificationManager.success('Successfully deleted post!', 'Success');
                          this.props.loadTags()
                      })
        }
    }

    renderPostCard(tag, post) {
        return(
            <div>
                <Card shadow={5} style={{width:800,marginLeft:20}}>
                    <CardTitle style={{color: 'black', height: '100px'}} >{tag}</CardTitle>
                    <CardText>
                        {post.post}
                    </CardText>

                    <CardMenu style={{color: 'black'}}>
                    </CardMenu>
                </Card>  
                <IconButton style={{marginLeft:20,marginTop:20,marginBottom:20 }} name="thumb_up" />
                <IconButton style={{marginLeft:10,marginTop:20,marginBottom:20 }} name="thumb_down" />
                <IconButton style={{marginLeft: 30,marginTop:20,marginBottom:20 }} id={post.id} name="delete" onClick={this.deletePost.bind(this)}/>
            </div>
        )
    }

    renderKnownPosts() {
        for (let key in this.state.knownPostObject) {
            let posts = this.state.knownPostObject[key]
            return (
                <div>
                    <h3>{key}</h3>
                    {posts.map(post => {
                        return (<div>{this.renderPostCard(post.tag, post)}</div>)
                    })}
                </div>
                

            )
        }
    }

    renderPosts() {
        let tagList = Array.from(this.state.tagList)
        return (
        <div>
            {this.renderKnownPosts()}
            <h3>Anonymous</h3>
            {tagList.map((tag) => {
                return (
                    <div>
                        {this.state.postList[tag].map(post => {
                            if (post.isSpam === true) {
                                return (<div>{this.renderPostCard(tag, post)}</div>)
                            }
                            

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
        } if (this.props.metamaskOff) {
            return (<p>Please turn on metamask</p>)
        } if (this.state.notAuthorized) {
            return (<p>Not authorized to view posts</p>)
        }
        return (
        <div>
            {/* <h4>Total number of posts {this.props.posts.length}</h4> */}
            <Grid>
                <Cell col={12}>
                <div className="content">{this.renderPosts()}</div>
                </Cell>
            </Grid>

        </div>)
    }

    render() {
        return (
          <div>
              <NotificationContainer />
              {this.loadComponent()}
              
          </div>  
        );
    }
}

module.exports = TempTagList