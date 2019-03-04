import React, { Component } from 'react';
import { Grid, Cell } from 'react-mdl';



class Landing extends Component {
  render() {
    return(
      <div style={{width: '100%', margin: 'auto'}}>
        <Grid className="landing-grid">
          
            

            <div className="banner-text">
              <h1>BlogChain</h1>
              <button href="#"> Sign In Using 3Box!!</button>
              <button href="#"> Sign In Anonymously!!</button>

            </div>
          
        </Grid>
      </div>
    )
  }
}

export default Landing;
