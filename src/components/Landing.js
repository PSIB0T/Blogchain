const React = require('react')
const {NavLink} = require('react-router-dom')

class Landing extends React.Component {
    render() {
        return (
            <div>
              <NavLink to={`/main`}>Login using metamask and 3box</NavLink>
              <br />
              <NavLink to={`/temp`}>Login without metamask</NavLink>
            </div>
        );
    }
}

module.exports = Landing;