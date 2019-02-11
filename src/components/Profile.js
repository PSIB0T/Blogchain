const React = require('react')

class Profile extends React.Component {
    constructor(props) {
        super(props)
    }

    shouldComponentUpdate(nextProps, nextState) {
        console.log("orbitdb next prop")
        console.log(nextProps.orbitdb)
        if (nextProps.orbitdb === null || nextProps.box === null) {
            console.log("Undefined db")
            return false
        }
        let shouldUpdate = this.props.orbitdb !== nextProps.orbitdb;
        return shouldUpdate;
    }

    async componentDidUpdate(prevProps, prevState) {
        console.log("Inside didupdate")
        let globalDB = await this.props.orbitdb.keyvalue('/orbitdb/QmRhRBr34HBffHshmffGuFDpEYgt2t6m64V1AmmqRycwWd/globalDatabase')
        await globalDB.load()
        console.log("Address of globaldb is")
        console.log(globalDB.address.toString())
    }

    render(){
        return (
            <p>Profile loaded</p>
        )
    }
}

module.exports = Profile