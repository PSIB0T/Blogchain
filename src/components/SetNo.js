const React = require('react')

class SetNo extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            isLoading: true
        }
    }

    handleChange(e) {
        this.props.handleChange(e);
    }

    handleNoSubmit(e) {
        this.props.handleNoSubmit(e);
    }
    handleUrlSubmit(e) {
        this.props.handleUrlSubmit(e);
    }

    componentDidMount() {
        if (this.props.tagDb !== null) {
            this.setState({isLoading: false})
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.tagDb !== null && this.props.tagDb !== nextProps.tagDb) {
            this.setState({isLoading: false})
        } 
    }

    renderComponent() {
        if (this.props.metamaskOff) {
            return (<h1>Please sign into/download metamask and refresh the browser</h1>)
        }
        if (this.state.isLoading) {
            return (<h1>Loading...</h1>)
        } 
        return (<div>
            <h1>Welcome!</h1>
            <p>Your IPFS ID is <strong>{this.props.id}</strong></p>
        </div>)
    }

    render() {
        return (
        <div style={{ textAlign: 'center' }}>
            {this.renderComponent()}
          </div>
        );
    }
}

module.exports = SetNo
