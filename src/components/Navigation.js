const React = require('react')
const {NavLink} = require('react-router-dom')

class Navigation extends React.Component {
    render() {
        return (
            <div>
                <NavLink to="/">SetNo </NavLink>
                <NavLink to="/profile">Profile</NavLink>
            </div>
        )
    }
}

module.exports = Navigation