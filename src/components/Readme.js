const React = require('react')
const { Grid, Cell } = require('react-mdl');
const flowchart = require('./../resources/flowchart.jpg')


const figureStyle = {
    margin: '0',
    width: '100%',
    maxWidth: '500px',
    height: '830px',
    backgroundImage: `url(${flowchart})`,
    backgroundSize: 'cover'

}

const divStyle={
    position: 'absolute',
    width: '100%',
    height: '150vh',
    background: '#1a1029'
}

class Readme extends React.Component {
    render() {
        return (
            <div style={divStyle}>
                <Grid style={{width: '80%', margin: 'auto', display: 'flex', justifyContent: 'center'}}>
                    <figure style={figureStyle}></figure>
                </Grid>
            </div>

        )
    }
}

module.exports = Readme