'use strict'

const React = require('react')
const { BrowserRouter, Route, Switch, HashRouter } = require('react-router-dom')
const { Layout, Header, Navigation, Drawer, Content } = require('react-mdl');
const MainProfile = require('./MainProfile')
const TempSession = require('./TempSession')
const Landing = require('./Landing')
const Readme = require('./Readme')

class App extends React.Component {
  constructor (props) {
    super(props)
  }
  
  setStatePromise(val){
    let self = this;
    return new Promise((resolve, reject) => {
      this.setState(val, (err) => {
        if (err)
          reject(err)
        else
          resolve(err) 
      })
    })
  }

  render () {
    
    return (
      <div>
        <div className="page-content" />
        <HashRouter>
            <Layout>
              <Switch>
                <Route 
                  path={`/main`}
                  render={(props) => <MainProfile {...props} setStatePromise={this.setStatePromise} />}
                />
                <Route
                  path={`/temp`}
                  render={(props) => <TempSession {...props} setStatePromise={this.setStatePromise} />}
                />
                <Route 
                  path="/readme"
                  component={Readme}
                />
                <Route 
                  path="/"
                  component={Landing}
                />
  

              </Switch>
            </Layout>


        </HashRouter>
      </div>

    )
  }
}
module.exports = App