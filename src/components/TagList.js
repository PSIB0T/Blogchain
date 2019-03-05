const React = require('react')
const styled = require('styled-components')
const _ = require('lodash')

class TagList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            profileUrls: [],
            postObject: {}
        }
        this.setStatePromise = props.setStatePromise
    }

    componentDidMount() {
        if (this.props.tagDbGlobal !== null) {
            this.loadTags(this.props)
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.tagDbGlobal !== null   && this.props.tagDbGlobal !== nextProps.tagDbGlobal) {
            console.log("Inside willreceiveprops")
            this.loadTags(nextProps)
        }
    }

    async loadPostsFromProfile(profDbUrl, tag, props=this.props) {
        let profDb = await props.orbitdb.keyvalue(profDbUrl)
        return profDb.load()
                    .then(() => {
                        console.log("dsdeibfi")
                        if (profDb.get('postDBUrl') === null || profDb.get('postDBUrl') === undefined) {
                            console.log("sdsdsdsdsd")
                            profDb.events.on('replicate', (address) => {
                                console.log("Replicating db!")
                            })
                            profDb.events.on('replicated', () => {
                                console.log("Profdb replicated")
                                return this.state.profDb.load()
                            })
                        } else {
                                return Promise.resolve("Replicated")
                        }
                    }).then(() => {
                            let postDbUrl = profDb.get('postDBUrl')
                            console.log("postdb url is")
                            console.log(postDbUrl)
                            return this.setPostsToProfile(postDbUrl, profDb.get('nick'), tag, props)
                    })
    }

    async setPostsToProfile(postDbUrl, nick, tag, props=this.props) {
        let postDb = await props.orbitdb.docs(postDbUrl)
        await postDb.load()
        let posts = postDb.query(doc => true)
        let postObject = this.state.postObject
        console.log(posts)
        postObject[nick] = posts.filter(post => {
            if (_.includes(post.tags, tag)) {
                return post.post
            }
        })
        console.log(postObject)
        return this.setStatePromise(postObject)
    }

    async loadTags(props) {
        let tags = props.tagDbGlobal.query(doc => doc.tag === this.props.match.params.tag)
        console.log(props.tagDbGlobal.query(doc => true))
        let profileUrls = tags = tags.map(tag => {
            return tag.profile
        })
        console.log(profileUrls)
        return this.setStatePromise({profileUrls})
                    .then(() => {
                        this.state.profileUrls.forEach(profileUrl => {
                            this.loadPostsFromProfile(profileUrl, this.props.match.params.tag, props)
                        })
                        this.setStatePromise({isLoading: false})
                    })
    }

    renderTags() {
        if (this.state.isLoading === true) {
            return (<p>Loading...</p>) 
        }
        return (
            <div>
                {_.map(this.state.postObject, (value, key) => {
                    return (
                        <div>
                            <h2>{key}</h2>
                            {value.map(post => {
                                return (<p>{post.post}</p>)
                            })}
                        </div>
                    )
                })
                }
            </div>
        )
    }

    render() {
        return (<div>
            {this.renderTags()}
        </div>)
    }
}

module.exports = TagList