const React = require('react')

const styled = require('styled-components')

const InputComponent = styled.default('input')`
                            width: 50%;
                            height:100px;
                            padding: 12px 20px;
                            font-size:20px;
                            box-sizing: border-box;
                            border: 2px solid #ccc;
                            border-radius: 4px;
                            background-color: #f8f8f8;
                        `
const ButtonComponent = styled.default('button')`
                            background-color: rgb(27, 165, 207); /* Green */
                            border: none;
                            color: white;
                            padding: 20px;
                            text-align: center;
                            text-decoration: none;
                            display: inline-block;
                            font-size: 20px;
                            margin: 10px;
                            cursor: pointer;

                        `
const DivComponent = styled.default('div')`
                            margin:10px 0px 0px 258px;
                        `

class Profile extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            loading: true,
            noAccount: null,
            globalDB: null,
            nick: "",
            post: "",
            postDb: null,
            posts: []
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
                return this.state.globalDB.set(nick, profDb.address.toString())
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

    async handlePostSubmit(event) {
        console.log(this.state.post)
        let postDb
        let post = this.state.post;
        if (this.state.postDb === null) {
            let postDbUrl = this.state.profDb.get('postDBUrl')
            if (postDbUrl === undefined) {
                postDb = await this.props.orbitdb.docs(this.state.nick + "-posts", {write: ['*']})
                await this.state.profDb.set('postDBUrl', postDb.address.toString())
            } else {
                postDb = await this.props.orbitdb.docs(postDbUrl)
                await postDb.load()
            }
            this.setState({postDb})
        } else {
            postDb = this.state.postDb
        }
        postDb.put({_id: Date.now(), post})
                .then((res) => {
                    console.log("Successfully inserted posts")
                    this.fetchPosts()
                })  
    }

    async fetchPosts() {
        let postDb
        let post = this.state.post;
        if (this.state.postDb === null) {
            let postDbUrl = this.state.profDb.get('postDBUrl')
            console.log(postDbUrl)
            if (postDbUrl === undefined) {
                postDb = await this.props.orbitdb.docs(this.state.nick + "-posts", {write: ['*']})
                await this.state.profDb.set('postDBUrl', postDb.address.toString())
            } else {
                postDb = await this.props.orbitdb.docs(postDbUrl)
                await postDb.load()
            }
            this.setState({postDb})
        } else {
            postDb = this.state.postDb
        }
        let posts = postDb.query((doc) => true)
        posts.sort((a, b) => {
            return a._id - b._id
        })
        this.setState({posts})
    }

    async loadFromBox(props) {
        let self = this;
        console.log(this.props)
        return this.props.box.public.get('profDb')
                    .then(async (dbAddress) => {
                        if (dbAddress === null || dbAddress === undefined) {
                            this.setState({
                                loading: false,
                                noAccount: true
                            })
                        } else {
                            let profDb = await this.props.orbitdb.keyvalue(dbAddress)
                            await profDb.load()
                            this.setStatePromise({
                                loading: false,
                                noAccount: false,
                                profDb,
                                nick: profDb.get('nick')
                            }).then(() => {
                                this.fetchPosts()
                            })
                        }
                    })
    }

    async loadGlobalDb(props) {
        let globalDB = await props.orbitdb.keyvalue(`/orbitdb/QmeuGQ4KdmdFD8WTN5r5mvF3s6pk1sXG5nXdYxP1dorW7K/globalDatabase`)
        return globalDB.load()
                        .then(() => {
                            console.log(globalDB.address.toString())
                            return this.setStatePromise({globalDB})
                        }).then(() => {
                            return this.loadFromBox(props)
                        })
    }

    componentDidMount() {
        if (this.props.orbitdb !== null) {
            this.loadGlobalDb(this.props)
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.orbitdb !== null && nextProps.box !== null && this.props.orbitdb !== nextProps.orbitdb) {
            console.log("Inside willreceiveprops")
            this.loadGlobalDb(nextProps)
        }
    }

    renderProfile() {
        if (this.state.loading === true ) {
            return (<p>Loading...</p>)
        } else if (this.state.noAccount === true) {
            return (
                <div>
                    <p>Welcome user! please enter your nick</p>
                    <input name="nick" id="nick" value={this.props.receiveurl} onChange={this.handleChange.bind(this)}/>
                    <button onClick={this.handleNickSubmit.bind(this)}>Submit</button>
                </div>
            )
        } 
        return (
                <div>
                    <p>Welcome back, {this.state.nick}</p>
                    <InputComponent name="post" id="post" value={this.props.receiveurl} onChange={this.handleChange.bind(this)} />
                    <ButtonComponent onClick={this.handlePostSubmit.bind(this)}>Submit</ButtonComponent>
                    <br />
                    <div>
                    {
                        this.state.posts.map(post => {
                            return (<p>{post.post}</p>)
                        })
                    }
                    </div>
                </div>
                )
    }

    render(){
        return (
            <DivComponent>
                {this.renderProfile()}
            </DivComponent>
        );
    }
}

module.exports = Profile