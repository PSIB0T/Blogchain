'use strict'

const React = require('react')
let { Grid, Cell, Card, CardTitle, CardText,  CardMenu, IconButton, Textfield } = require('react-mdl');
let { matchPath } = require('react-router-dom')
let ReactSpoiler = require('react-spoiler')
let bayes = require('bayes')
let jsonData = require('./../utils/test.json')
let _ = require('lodash')
let {NotificationContainer, NotificationManager} = require('react-notifications');


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
            tagList: new Set(),
            postList: []
        }
        this.setStatePromise = this.props.setStatePromise
        this.classifier = bayes.fromJson(JSON.stringify(jsonData))
    }

    loadPosts(tagFilter) {
        this.setState({isLoading: true})
        let posts = this.props.posts
        let tags = new Set(posts.map(post => post.tag))
        posts.sort((a, b) => {
            return a._id - b._id
        })
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

    componentWillReceiveProps(props) {
        // console.log("Inside receiveprops")
        // console.log(this.props)
    }

    componentDidUpdate(prevProps, prevState) {

        const match = matchPath(this.props.history.location.pathname, {
            path: '/temp/tag/:tagId',
            exact: true,
            strict: false
        })
        // console.log(match)
        if (prevProps.posts !== this.props.posts || prevProps.match.params.tagId !== this.props.match.params.tagId) {
            this.loadPosts(this.props.match.params.tagId)
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
        let tags = this.state.tag,
            post = this.state.post,
            isSpam
        if (this.classifier.categorize(post.toLowerCase()) === "spam") {
            isSpam = true
        } else {
            isSpam = false
        }
        tags = tags.split(",").map(tag => {
            return tag.trim()
        })
        console.log(tags)

        // console.log("Post is spam? " + isSpam)
        this.insertTags(tags, post, isSpam).then((res) => {
            NotificationManager.success('Successfully submitted post!', 'Success');
            this.props.loadTags()
        }).catch(err => {
            console.log(err)
        })
    }

    deletePost(event) {
        let id = event.target.id
        if (id !== null && id !== undefined && id !== '') {
            this.props.tagDb.del(id)
                      .then(() => {
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
                

                <div>
                    <input style={{marginLeft:20,marginBottom:20, height: 25 , width: 800,borderRadius:10,borderColor:'gray'}} type="text" placeholder="Comment..!!" className="form-control" />
                </div>
            </div>
        )
    }

    renderPosts() {
        let tagList = Array.from(this.state.tagList)
        return (
        <div>
            {tagList.map((tag) => {
                return (
                    <div>
                        {this.state.postList[tag].map(post => {
                            if (post.isSpam === true) {
                                return (
                                    <ReactSpoiler blur={7}>
                                        {this.renderPostCard(tag, post)}
                                    </ReactSpoiler>
                                )
                            } else {
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
        } 
        return (
        <div>
            <div class="text-styles">
                <Textfield
                    onChange={(event) => this.setState({tag: event.target.value})}
                    label="Name of person(s) Separated by , (Eg:- Elliot, Whiterose)"
                    floatingLabel
                    value={this.state.tag}
                    style={{width: '500px'}}
                />
                <Textfield
                    onChange={(event) => this.setState({post: event.target.value})}
                    label="Post"
                    floatingLabel
                    rows={3}
                    value={this.state.post}
                    style={{width: '500px'}}
                />
                <button onClick={this.handlePostSubmit.bind(this)}>Submit</button>
            </div>

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