const React = require('react')
const Search = require('./Search')

class SearchByUsername extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            search: ""
        }
        console.log("Props search")
        console.log(this.props)
    }

    handleChange(event) {
        const name = event.target.name
        this.setState({[name]: event.target.value});
    }

    handleSearch() {
        let match = this.props.match2

        let search = this.state.search;
        this.props.history.push(match.path + '/profile/' + search)
    }

    render() {
        return(
            <Search search={this.state.search} handleChange={this.handleChange.bind(this)} handleSearch={this.handleSearch.bind(this)}/>
        );
    }
}

module.exports = SearchByUsername