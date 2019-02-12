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
const DescComponent = styled.default('div')`
                            width: 50%;
                            height:auto;
                            padding: 12px 20px;
                            font-size:20px;
                            margin: 8px 0;
                            box-sizing: border-box;
                            border: 2px solid #ccc;
                            border-radius: 4px;
                            background-color: #f8f8f8;
                        `
const UlComponent = styled.default('ul')`
                            margin: 0;
                            padding: 0;
                            display: flex;
                            flex-direction: column;
                        `
const LiComponent = styled.default('li')`
                            margin: 5px;
                            list-style-type: none;
                            display: flex;
                            justify-content: space-around
                        `
const InnerDiv = styled.default('div')`
                            min-width: 100px;
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
        if (this.props.globalDB !== null) {
            this.loadGlobalDb(this.props)
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.orbitdb !== null   && nextProps.globalDB !== null && this.props.globalDB !== nextProps.globalDB) {
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
        return props.globalDB.load()
                        .then(async () => {
                            let profDbUrl = props.globalDB.get(this.props.match.params.nick)
                            let profDb = await props.orbitdb.keyvalue(profDbUrl)
                            return this.setStatePromise({profDb})
                        }).then(() => {
                            return this.state.profDb.load()
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
                    <DescComponent>
                        <UlComponent>
                            <LiComponent><InnerDiv>Name:</InnerDiv><InnerDiv>{this.state.nick}</InnerDiv></LiComponent>
                            <LiComponent><InnerDiv>Born:</InnerDiv><InnerDiv>{this.state.dob}</InnerDiv></LiComponent>
                        </UlComponent>
                    </DescComponent>
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