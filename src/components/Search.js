const React = require('react')
const {withRouter} = require('react-router-dom')


class Search extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            search: ""
        }
    }

    handleChange(event) {
        const name = event.target.name
        this.setState({[name]: event.target.value});
    }

    handleSearch() {
        let search = this.state.search;
        this.props.history.push('/profile/' + search)
    }

    render() {
        return(
            <div>
                <input name="search" id="search" onChange={this.handleChange.bind(this)}/>
                <button onClick={this.handleSearch.bind(this)}>Search</button>
            </div>
        );
    }
}

module.exports = withRouter(Search) 