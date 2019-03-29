const React = require('react')
const { Tabs, Tab, Grid, Cell, Card, CardTitle, CardText, CardActions, Button, CardMenu, IconButton , Textfield} = require('react-mdl');

class SetNo extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            profDb: null,
            postDb: null,
            noAccount: false,
            post: "",
            postTagList: ""
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
    
              {/* Project 1 */}
              <Card shadow={5} style={{width:800,marginLeft:200}}>
                <CardTitle style={{color: 'black', height: '100px'}} >1000 kg bombs, Mirage 2000 jets: India attacks Pakistan, what we know so far</CardTitle>
                <CardText>
                Indian Air Force (IAF) jets crossed the Line of Control (LoC) and destroyed terror camps in Pakistan, sources said. The air strike was carried out in Balakot sector at 3.30 am.            
                Sources said ten Mirage 2000 aircraft dropped 1,000 kg bombs on terrorist camps across the LoC. As per sources, three control rooms of Jaish-e-Mohammed (JeM) were destroyed in Balakot, Chakoti and Muzzafarabad.
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
            postDb = this.state.postDb;
            tags = this.state.postTagList.split(",").map(tag => {
                return tag.trim()
            })
        
        postDb.put({_id: Date.now(), post, tags, upvotes: [], downvotes: []})
                .then((res) => {
                    console.log("Successfully inserted posts")
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
            {this.renderComponent()}
          </div>
        );
    }
}

module.exports = SetNo
