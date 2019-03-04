const React = require('react')
const {NavLink} = require('react-router-dom')

const styled = require('styled-components')

const SideNavStyle = styled.default('div')`
                        height: 100%;
                        width: 250px;
                        position: fixed;
                        z-index: 1;
                        top: 0;
                        left: 0;
                        background-color: #333;
                        overflow-x: hidden;
                        padding-top: 20px;

                    `;
const SideNavAnchor = styled.default('a')`
                        padding: 6px 6px 6px 32px;
                        text-decoration: none;
                        font-size: 20px;
                        color: white;
                        display: block;
                        :hover {
                            color: #f1f1f1 !important;
                        }
                        :hover:not(.active) {
                            background-color: rgb(27, 165, 207);
                        }

                    `;

class Sidenav extends React.Component {
    render() {
        let match = this.props.match
        return (
            <div>
                <SideNavStyle>
                    <SideNavAnchor><NavLink to={`${match.url}`} className="navLink">Home</NavLink></SideNavAnchor>
                    <SideNavAnchor><NavLink to={`${match.url}/profile`} className="navLink">Profile</NavLink></SideNavAnchor>
                    <SideNavAnchor><NavLink to={`${match.url}/search`} className="navLink">Search</NavLink></SideNavAnchor>
                    <SideNavAnchor><NavLink to={`${match.url}/searchbytag`} className="navLink">Search by tag</NavLink></SideNavAnchor>
                </SideNavStyle>
            </div>
        )
    }
}

module.exports = Sidenav