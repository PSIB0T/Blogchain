const React = require('react')
const {NavLink} = require('react-router-dom')
const { Grid, Cell } = require('react-mdl');

class Landing extends React.Component {
    render() {
        return (

            <div style={{width: '100%', margin: 'auto'}}>
                <Grid className="landing-grid">
                    
                    

                    <div className="banner-text">
                        <h1>BlogChain</h1>
                        <button href="#"><NavLink to={`/temp`}>Sign In Anonymously!!</NavLink></button>
                        <button href="#"><NavLink to={`/readme`}>View docs</NavLink></button>

                    </div>
                    
                </Grid>
            </div>
        );
    }
}

module.exports = Landing;