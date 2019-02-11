const React = require('react')
const {NavLink} = require('react-router-dom')

const styled = require('styled-components')

console.log(styled)

const Button = styled.default('button')``

const UlComponent = styled.default('ul')`
                    list-style-type: none;
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                    background-color: #333;
                `;
const LiComponent = styled.default('li')`
                    float: left;    
                `;
const AnchorComponent = styled.default('a')`
                            display: block;
                            color: white;
                            text-align: center;
                            padding: 14px 16px;
                            text-decoration: none;
                        `

class Navigation extends React.Component {
    render() {
        return (
            <div>
                <UlComponent>
                    <LiComponent><AnchorComponent><NavLink to="/" className="navLink">SetNo </NavLink></AnchorComponent></LiComponent>
                    <LiComponent><AnchorComponent><NavLink to="/profile" className="navLink">Profile</NavLink></AnchorComponent></LiComponent>
                </UlComponent>
            </div>
        )
    }
}

module.exports = Navigation