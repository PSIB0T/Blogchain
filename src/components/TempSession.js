'use strict'

const React = require('react')
const OrbitDB = require('orbit-db');

let {createIPFSobj} = require('./../utils/IpfsUtil')


class TempSession extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            errorLoading: false,
            orbitdb: null,
            ipfs: null
        }
        this.setStatePromise = this.props.setStatePromise
    }

    async create(pubString) {

        return createIPFSobj(pubString)
                        .then(({ipfs}) => {
                            return this.setStatePromise({ipfs})
                        })
    }

    async loadTagDb() {
        let tagDb = await this.state.orbitdb.docs('/orbitdb/QmTTmfEZwHcD35Mojh468qp5iJS3Dv8QdYoGU3r6Xf3Fsv/tagdb')
        await tagDb.load()
        tagDb.events.on('replicated', () => {
            console.log("Replicated!")
        })
        console.log(tagDb.address.toString())
    }

    componentDidMount() {
        this.create("")
            .then(() => {
                return new Promise((resolve, reject) => {
                    this.state.ipfs.once('ready', () => {
                        let orbitdb = new OrbitDB(this.state.ipfs)
                        this.setStatePromise({orbitdb, isLoading: false})
                            .then(() => {
                                resolve("Success")
                            }).catch((err) => {
                                reject(err)
                            })
                    })
                })

            }).then((res) => {
                this.loadTagDb()
                console.log(res)
            }).catch((err) => {
                this.setStatePromise({isLoading: false, errorLoading: true})
                console.log(err)
            })
    }

    loadComponent() {
        if (this.state.isLoading) {
            return (<p>Loading...</p>)
        } if (this.state.err) {
            return (<p>Error loading...</p>)
        } 
        return (<p>Success!</p>)
    }

    render() {
        return (
          <div>
              {this.loadComponent()}
          </div>  
        );
    }
}

module.exports = TempSession