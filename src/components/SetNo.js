const React = require('react')
const { Grid, Cell, Card, CardTitle, CardText, Button, CardMenu, IconButton , Textfield} = require('react-mdl');
let {NotificationContainer, NotificationManager} = require('react-notifications');

const options = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' }
  ];

class SetNo extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            profDb: null,
            postDb: null,
            noAccount: false,
            post: "",
            postTagList: "",
            title: "",
            selectedOption: null,
            age: 10
        }
        this.setStatePromise = this.props.setStatePromise
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

    async loadProfDb(dbAddress) {
        let profDb = await this.props.orbitdb.keyvalue(dbAddress)
        await profDb.load()
        return this.setStatePromise({
            isLoading: false,
            noAccount: false,
            profDb
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

    renderFeed() {
        return(
            <div>
               <Card shadow={5} style={{width:800,marginLeft:200,marginBottom:20}}>
                <CardTitle style={{color: 'black', height: '100px',marginLeft:200}} >Lets Post Something New!!</CardTitle>
                <div>
                    <Textfield
                    onChange={this.handleChange.bind(this)}
                    value={this.state.postTagList}
                    label="Enter Your #Tags..!!"
                    floatingLabel
                    name="postTagList"
                    style={{width: '700px',marginLeft:20}}
                    />
                    </div>
                    <div>
                    <Textfield
                    onChange={this.handleChange.bind(this)}
                    value={this.state.title}
                    label="Enter title of post!!"
                    floatingLabel
                    name="title"
                    style={{width: '700px',marginLeft:20}}
                    />
                    </div>
                    <div>
                    <Textfield
                    onChange={this.handleChange.bind(this)}
                    value={this.state.post}
                    label="Whats On your Mind??"
                    floatingLabel
                    name="post"
                    style={{width: '700px',marginLeft:20}}
                    />
                
                </div> 
                <div style={{marginLeft:280,paddingBottom:30}}><Button raised colored onClick={this.handlePostSubmit.bind(this)}>Post</Button></div>
    
                <CardMenu style={{color: 'black'}}>
                  
                </CardMenu>
              </Card> 
            
    
             <Card shadow={5} style={{width:800,marginLeft:200}}>
                <CardTitle style={{color: 'black', height: '100px'}} >What is a decentralized platform in blockchain and how does it work?</CardTitle>
                <CardText>
                Decentralised platform in the Blockchain context means that there is no centralised data storage mechanism
    The information is available with all the participants in the network
    Hence from a system design perspective, you will have nodes instead of client server
    As to how it works… this requires a bit of understanding of peer to peer programming and information theory (noise, conflict and consensus)
    As of now, there is no standard way of implementation, which can be applied across all the industries
    Most of the designs are in context of the industry (SCM, Finance etc)
                </CardText>
    
                <CardMenu style={{color: 'black'}}>
                  <IconButton name="share" />
                </CardMenu>
              </Card>  
              <IconButton style={{marginLeft:200,marginTop:20,marginBottom:20 }} name="thumb_up" />
             <IconButton style={{marginLeft:10,marginTop:20,marginBottom:20 }} name="thumb_down" />
    
             <div>
            <Textfield 
            onChange={() => {}}
            label="Comment..!!"
            floatingLabel
            style={{width: '800px',marginLeft:200}}
            />
            </div>
              <Card shadow={5} style={{width:800,marginLeft:200}}>
                <CardTitle style={{color: 'black', height: '100px'}} >3. 20% of Earth’s oxygen is produced by the Amazon rainforest</CardTitle>
                <CardText>
                Our atmosphere is made up of roughly 78 per cent nitrogen and 21 per cent oxygen, 
                with various other gases present in small amounts. 
                The vast majority of living organisms on Earth need oxygen to survive, 
                converting it into carbon dioxide as they breathe. 
                Thankfully, plants continually replenish our planet’s oxygen levels through photosynthesis.
                 During this process, carbon dioxide and water are converted into energy, releasing oxygen as a by-product. Covering 5.5 million square kilometres (2.1 million square miles), the Amazon rainforest cycles a significant proportion of the Earth’s oxygen, 
                absorbing large quantities of carbon dioxide at the same time.
                </CardText>
    
                <CardMenu style={{color: 'black'}}>
                  <IconButton name="share" />
                </CardMenu>
              </Card>  
             <IconButton style={{marginLeft:200,marginTop:20,marginBottom:20 }} name="thumb_up" />
             <IconButton style={{marginLeft:10,marginTop:20,marginBottom:20 }} name="thumb_down" />
    
             <div>
            <Textfield
            onChange={() => {}}
            label="Comment..!!"
            floatingLabel
            style={{width: '800px',marginLeft:200}}
            />
            </div>       
             </div>
          )
    }

    componentDidMount() {
        if (this.props.tagDb !== null) {
            this.loadFromBox()
                .then(() => {
                    this.setStatePromise({isLoading: false})
                })
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.tagDb !== null && this.props.tagDb !== nextProps.tagDb) {
            this.loadFromBox()
                .then(() => {
                    this.setStatePromise({isLoading: false})
                })
        } 
    }

    async handlePostSubmit(event) {
        let post = this.state.post,
            postDb = this.state.postDb,
            tags = this.state.postTagList.split(",").map(tag => {
                return tag.trim()
            }),
            title = this.state.title
        let inputObject = [{
            name: 'post',
            variable: post
        }, {
            name: 'title',
            variable: title
        }]

        for (let i = 0; i < inputObject.length; i++) {
            console.log(inputObject[i])
            if (inputObject[i].variable.length === 0) {
                NotificationManager.error(`Please enter ${inputObject[i].name}`, 'Error');
                return
            }
        }
        
        postDb.put({_id: Date.now(), post, tags, title, upvotes: [], downvotes: []})
                .then((res) => {
                    console.log("Successfully inserted posts")
                    NotificationManager.success('Successfully submitted post!', 'Success');
                })  
    }

    handleChange(event) {
        const name = event.target.name
        this.setState({[name]: event.target.value});
    }

    renderComponent() {
        if (this.props.metamaskOff) {
            return (<h1>Please sign into/download metamask and refresh the browser</h1>)
        }
        if (this.state.isLoading) {
            return (<h1>Loading...</h1>)
        } 
        return (      
        <div>
            <Grid>
              
              <Cell col={6}>
                <div className="content">{this.renderFeed()}</div>
              </Cell>
            </Grid>
        </div>)
    }

    render() {
        return (
        <div>
            <NotificationContainer />
            {this.renderComponent()}
          </div>
        );
    }
}

module.exports = SetNo
