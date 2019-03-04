const React = require('react')
const styled = require('styled-components')

class TagList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            profileUrls: []
        }
        this.setStatePromise = props.setStatePromise
    }

    componentDidMount() {
        if (this.props.tagDbGlobal !== null) {
            this.loadTags(this.props)
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.tagDbGlobal !== null   && this.props.tagDbGlobal !== nextProps.tagDbGlobal) {
            console.log("Inside willreceiveprops")
            this.loadTags(nextProps)
        }
    }

    async loadTags(props) {
        let tags = props.tagDbGlobal.query(doc => doc.tag === this.props.match.params.tag)
        let profileUrls = tags = tags.map(tag => {
            return tag.profile
        })
        console.log(profileUrls)
        return this.setStatePromise({isLoading: false,  profileUrls})

    }

    renderTags() {
        if (this.state.isLoading === true) {
            return (<p>Loading...</p>) 
        }
        return (
            <div>
                {this.state.profileUrls.map((profileUrl) => {
                    return (<p>{profileUrl}</p>);
                })}
            </div>
        )
    }

    render() {
        return (<div>
            {this.renderTags()}
        </div>)
    }
}

module.exports = TagList