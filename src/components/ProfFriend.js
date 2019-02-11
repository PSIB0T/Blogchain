const React = require('react')

class ProfFriend extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            nick: ""
        }
    }

    render() {
        return (
            <div>ID: {this.props.match.params.nick}</div>
        )
    }
}

module.exports = ProfFriend