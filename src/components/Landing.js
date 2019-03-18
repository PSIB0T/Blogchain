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
                        <NavLink to={`/main`}><button>Sign In using metamask</button></NavLink>
                        <NavLink to={`/temp`}><button>Sign In Anonymously!!</button></NavLink>

                    </div>
                    
                </Grid>
            </div>
        );
    }
}

module.exports = Landing;