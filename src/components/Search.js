const React = require('react')
const styled = require('styled-components')

const InputComponent = styled.default('input')`
                            width: 50%;
                            height:100px;
                            padding: 12px 20px;
                            font-size:20px;
                            box-sizing: border-box;
                            border: 2px solid #ccc;
                            border-radius: 4px;
                            background-color: #f8f8f8;
                        `
const ButtonComponent = styled.default('button')`
                            background-color: rgb(27, 165, 207); /* Green */
                            border: none;
                            color: white;
                            padding: 20px;
                            text-align: center;
                            text-decoration: none;
                            display: inline-block;
                            font-size: 20px;
                            margin: 10px;
                            cursor: pointer;

                        `

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
                <InputComponent name="search" id="search" onChange={this.handleChange.bind(this)}/>
                <ButtonComponent onClick={this.handleSearch.bind(this)}>Search</ButtonComponent>
            </div>
        );
    }
}

module.exports = Search