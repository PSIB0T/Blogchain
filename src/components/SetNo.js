const React = require('react')

class SetNo extends React.Component {

    constructor(props) {
        super(props)
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

    render() {
        return (
        <div style={{ textAlign: 'center' }}>
            <h1>Everything is working!</h1>
            <p>Your ID is <strong>{this.props.id}</strong></p>
            <hr />
            <p>Value of value is {this.props.value}</p>
            <div>
              <label for="setno">Set number</label>
              <input name="setno" id="setno" value={this.props.setno} onChange={this.handleChange.bind(this)}/>          
              <button onClick={this.handleNoSubmit.bind(this)}>Submit</button>
            </div>
            <div>
              <label for="receiveurl">Enter receiver url</label>
              <input name="receiveurl" id="receiveurl" value={this.props.receiveurl} onChange={this.handleChange.bind(this)}/>
              <button onClick={this.handleUrlSubmit.bind(this)}>Submit</button>
            </div>
          </div>
        );
    }
}

module.exports = SetNo
