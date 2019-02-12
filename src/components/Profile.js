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

class Profile extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            loading: true,
            noAccount: null,
            globalDB: null,
            nick: "",
            post: "",
            profDb: null,
            postDb: null,
            dob: null,
            posts: [],
            opProps: [
                {
                    name: 'Name',
                    prop: 'nick',
                    show: true
                },
                {
                    name: 'Born',
                    prop: 'dob',
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
                                nick: profDb.get('nick'),
                                dob: profDb.get('dob')
                            }).then(() => {
                                this.fetchPosts()
                            })
                        }
                    })
    }

    async loadGlobalDb(props) {
        return props.globalDB.load()
                    .then(() => {
                        return this.loadFromBox(props)
                    })
    }

    async editProp(prop) {
        let oldVal = this.state.profDb.get(prop)
        console.log(oldVal)
        return this.setStatePromise({loading: true})
                    .then(() => {
                        return this.state.profDb.set(prop, this.state[prop])
                    }).then(() => {
                        console.log("Edit made successfully")
                        return this.setStatePromise({loading: false})
                    }).catch((err) => {
                        console.log(err)
                        return this.setStatePromise({loading: false})
                    })
    }

    componentDidMount() {
        if (this.props.globalDB !== null) {
            this.loadGlobalDb(this.props)
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.orbitdb !== null && nextProps.box !== null && nextProps.globalDB !== null && this.props.globalDB !== nextProps.globalDB) {
            console.log("Inside willreceiveprops")
            this.loadGlobalDb(nextProps)
        }
    }

    handleEdit(event) {
        const propName = event.target.id;
        let opProps = this.state.opProps.reduce((accumulator, currentProp) => {
            if(currentProp.prop === propName) {
                if (currentProp.show === false) {
                    this.editProp(propName)
                }
                currentProp.show = currentProp.show === true?false:true;
            }
            accumulator.push(currentProp)
            return accumulator;
        }, [])
        this.setState({
            opProps 
        })
        // propFind.show = false;   
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
                    <DescComponent>
                        <UlComponent>
                            {this.state.opProps.map((opProp) => {
                                return (
                                    <LiComponent><InnerDiv>{opProp.name}</InnerDiv>
                                        {opProp.show?<InnerDiv>{this.state[opProp.prop]}</InnerDiv>:<InnerDiv><input name={opProp.prop  } value={this.state[opProp.prop]} onChange={this.handleChange.bind(this)}/></InnerDiv>}
                                        <div><button id={opProp.prop} onClick={this.handleEdit.bind(this)}>Edit</button></div>
                                    </LiComponent>
                                );
                            })}
                        </UlComponent>
                    </DescComponent>
                    <InputComponent name="post" id="post" value={this.props.receiveurl} onChange={this.handleChange.bind(this)} />
                    <ButtonComponent onClick={this.handlePostSubmit.bind(this)}>Submit</ButtonComponent>
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

module.exports = Profile