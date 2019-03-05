'use strict'

const React = require('react')
const OrbitDB = require('orbit-db');
let { Grid, Cell, Card, CardTitle, CardText,  CardMenu, IconButton, Textfield } = require('react-mdl');
let {createIPFSobj} = require('./../utils/IpfsUtil')
let { matchPath } = require('react-router-dom')
let _ = require('lodash')


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
            accumulator[currentvalue.tag].push(currentvalue.post)
            return accumulator
        }, {})
        return this.setStatePromise({
            tagList: tags,
            postList: postByTag,
            isLoading: false
        })
    }

    componentWillReceiveProps(props) {
        console.log("Inside receiveprops")
        console.log(this.props)
    }

    componentDidUpdate(prevProps, prevState) {
        console.log(this.props)
        const match = matchPath(this.props.history.location.pathname, {
            path: '/temp/tag/:tagId',
            exact: true,
            strict: false
        })
        console.log(match)
        if (prevProps.posts !== this.props.posts || prevProps.match.params.tagId !== this.props.match.params.tagId) {
            this.loadPosts(this.props.match.params.tagId)
        } 
    }

    handleChange(event) {
        const name = event.target.name
        this.setState({[name]: event.target.value});
    }

    handlePostSubmit() {
        let tag = this.state.tag,
            post = this.state.post;
        this.props.tagDb.put({
            _id: Date.now(),
            tag,
            post
        }).then((res) => {
            this.props.loadTags()
        })
    }

    renderPosts() {
        let tagList = Array.from(this.state.tagList)
        return (
        <div>
            {tagList.map((tag) => {
                return (
                    <div>
                        {this.state.postList[tag].map(post => {
                            return (
                                <div>
                                    <Card shadow={5} style={{width:800,marginLeft:20}}>
                                        <CardTitle style={{color: 'black', height: '100px'}} >{tag}</CardTitle>
                                        <CardText>
                                            {post}
                                        </CardText>

                                        <CardMenu style={{color: 'black'}}>
                                        </CardMenu>
                                    </Card>  
                                    <IconButton style={{marginLeft:20,marginTop:20,marginBottom:20 }} name="thumb_up" />
                                    <IconButton style={{marginLeft:10,marginTop:20,marginBottom:20 }} name="thumb_down" />
                                    

                                    <div>
                                        <input style={{marginLeft:20,marginBottom:20, height: 25 , width: 800,borderRadius:10,borderColor:'gray'}} type="text" placeholder="Comment..!!" className="form-control" />
                                    </div>
                                </div>
                            )
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
                    label="Tag"
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
              {this.loadComponent()}
          </div>  
        );
    }
}

module.exports = TempTagList