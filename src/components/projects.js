import React, { Component } from 'react';
import { Tabs, Tab, Grid, Cell, Card, CardTitle, CardText, CardActions, Button, CardMenu, IconButton } from 'react-mdl';


class Projects extends Component {
  constructor(props) {
    super(props);
    this.state = { activeTab: 0 };
  }

  toggleCategories() {

    if(this.state.activeTab === 0){
      return(
        <div>
          {/* Project 1 */}
          <Card shadow={5} style={{width:800,marginLeft:20}}>
            <CardTitle style={{color: 'black', height: '100px'}} >1000 kg bombs, Mirage 2000 jets: India attacks Pakistan, what we know so far</CardTitle>
            <CardText>
            Indian Air Force (IAF) jets crossed the Line of Control (LoC) and destroyed terror camps in Pakistan, sources said. The air strike was carried out in Balakot sector at 3.30 am.            
            Sources said ten Mirage 2000 aircraft dropped 1,000 kg bombs on terrorist camps across the LoC. As per sources, three control rooms of Jaish-e-Mohammed (JeM) were destroyed in Balakot, Chakoti and Muzzafarabad.
            </CardText>

            <CardMenu style={{color: 'black'}}>
              <IconButton name="share" />
            </CardMenu>
          </Card>  
         <IconButton style={{marginLeft:20,marginTop:20,marginBottom:20 }} name="thumb_up" />
         <IconButton style={{marginLeft:10,marginTop:20,marginBottom:20 }} name="thumb_down" />
         

        <div>
           <input style={{marginLeft:20,marginBottom:20, height: 25 , width: 800,borderRadius:10,borderColor:'gray'}} type="text" placeholder="Comment..!!" className="form-control" />
        </div>
        

         <Card shadow={5} style={{width:800,marginLeft:20}}>
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
          <IconButton style={{marginLeft:20,marginTop:20,marginBottom:20 }} name="thumb_up" />
         <IconButton style={{marginLeft:10,marginTop:20,marginBottom:20 }} name="thumb_down" />

        <div>
           <input style={{marginLeft:20,marginBottom:20, height: 25 , width: 800,borderRadius:10,borderColor:'gray'}} type="text" placeholder="Comment..!!" className="form-control" />
        </div>

          <Card shadow={5} style={{width:800,marginLeft:20}}>
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
         <IconButton style={{marginLeft:20,marginTop:20,marginBottom:20 }} name="thumb_up" />
         <IconButton style={{marginLeft:10,marginTop:20,marginBottom:20 }} name="thumb_down" />

        <div>
           <input style={{marginLeft:20,marginBottom:20, height: 25 , width: 800,borderRadius:10,borderColor:'gray'}} type="text" placeholder="Comment..!!" className="form-control" />
        </div>
          
        </div>
      )
      
    } else if(this.state.activeTab === 1) {
      return (
        <div><h1>This is about Music</h1>
        <Card shadow={5} style={{width:800,marginLeft:20}}>
            <CardTitle style={{color: 'black', height: '100px'}} >Ranveer Singh to rap in a concert to launch Gully Boy's music album</CardTitle>
            <CardText>
            Zoya Akhtar has decided to launch Gully Boy's music album by organising a concert where Ranveer Singh will perform, along with other rappers Divine and Naezy. </CardText>

            <CardMenu style={{color: 'black'}}>
              <IconButton name="share" />
            </CardMenu>
          </Card>  
         <IconButton style={{marginLeft:20,marginTop:20,marginBottom:20 }} name="thumb_up" />
         <IconButton style={{marginLeft:10,marginTop:20,marginBottom:20 }} name="thumb_down" />
         

        <div>
           <input style={{marginLeft:20,marginBottom:20, height: 25 , width: 800,borderRadius:10,borderColor:'gray'}} type="text" placeholder="Comment..!!" className="form-control" />
        </div>
         </div>
        
      )
    } else if(this.state.activeTab === 2) {
      return (
        <div><h1>This is about politics</h1></div>
      )
    } else if(this.state.activeTab === 3) {
      return (
        <div><h1>This is about Colleges</h1></div>
      )
    }

  }



  render() {
    return(
      <div>
        <Tabs activeTab={this.state.activeTab} onChange={(tabId) => this.setState({ activeTab: tabId })} ripple>
        <Tab>Blogs</Tab>
          <Tab>Music</Tab>
          <Tab>Politics</Tab>
          <Tab>Colleges</Tab>
        </Tabs>


          <Grid>
            <Cell col={12}>
              <div className="content">{this.toggleCategories()}</div>
            </Cell>
          </Grid>


      </div>
    )
  }
}

export default Projects;
