const React = require('react')

const styled = require('styled-components')

const PostsComponent = styled.default('div')`
                            font-size: 20px;
                            resize: none;
                        `
const ParaComponent = styled.default('p')`
                            margin-top: 10px;
                            margin-bottom: 10px;
                            padding: 15px;
                            box-shadow: 1px 2px 8px #888888;

                        `

class ProfFriend extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: true,
            nick: "",
            posts: [],
            postDb: null,
            globalDB: null,
            profDb: null
        }
    }
    componentDidMount() {
        if (this.props.orbitdb !== null) {
            this.loadGlobalDb(this.props)
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.orbitdb !== null && this.props.orbitdb !== nextProps.orbitdb) {
            console.log("Inside willreceiveprops")
            this.loadGlobalDb(nextProps)
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

    async loadGlobalDb(props) {
        let globalDB = await props.orbitdb.keyvalue(`/orbitdb/QmeuGQ4KdmdFD8WTN5r5mvF3s6pk1sXG5nXdYxP1dorW7K/globalDatabase`)
        return globalDB.load()
                        .then(() => {
                            console.log(globalDB.address.toString())
                            return this.setStatePromise({globalDB})
                        }).then(async () => {
                            let profDbUrl = await this.state.globalDB.get(this.props.match.params.nick)
                            let profDb = await this.props.orbitdb.keyvalue(profDbUrl)
                            await profDb.load()
                            return this.setStatePromise({profDb})
                        }).then(() => {
                            return this.fetchPosts()
                        })
    }

    async fetchPosts() {
        let postDb
        if (this.state.postDb === null) {
            let postDbUrl = this.state.profDb.get('postDBUrl')
            console.log("postdb url is")
            console.log(postDbUrl)
            postDb = await this.props.orbitdb.docs(postDbUrl)
            await postDb.load()
            this.setState({postDb})
        } else {
            postDb = this.state.postDb
        }
        let posts = postDb.query((doc) => true)
        posts.sort((a, b) => {
            return a._id - b._id
        })
        this.setState({posts, loading: false, nick: this.state.profDb.get('nick')})
    }

    renderProfile() {
        if (this.state.loading === true ) {
            return (<p>Loading...</p>)
        } 
        return (
                <div>
                    <p>Name:- {this.state.nick}</p>
                    <br />
                    <PostsComponent>
                    {
                        this.state.posts.map(post => {
                            return (<ParaComponent>{post.post}</ParaComponent>)
                        })
                    }
                    </PostsComponent>
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

module.exports = ProfFriend