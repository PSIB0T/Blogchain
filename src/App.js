import React, { Component } from 'react';
import './App.css';
import { Layout, Header, Navigation, Drawer, Content } from 'react-mdl';
import Main from './components/main';
import { Link } from 'react-router-dom';
import {withRouter} from 'react-router-dom'

import FuzzySearch from './components/FuzzySearch';

class App extends Component {
  constructor(props){
    super(props)
    this.list = [{
      id: 1,
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald'
    }, {
      id: 2,
      title: 'The DaVinci Code',
      author: 'Dan Brown'
    }, {
      id: 3,
      title: 'Angels & Demons',
      author: 'Dan Brown'
    }];
    this.list2 = [{
      id: 1,
      title: 'The Great contraception',
      author: 'F. Scott Fitzgerald'
    }, {
      id: 2,
      title: 'The gg Code',
      author: 'Dan Brown'
    }, {
      id: 3,
      title: 'Angels & fucbois',
      author: 'Dan Brown'
    }];
  }
  action(event){
    console.log(event)
    this.props.history.push('/search/' + event.title)
  }
  render() {
    return (
      <div className="demo-big-content">
    <Layout>
        <Header className="header-color" title={<Link style={{textDecoration: 'none', color: 'white'}} to="/">Home</Link>} scroll>
            <Navigation>
              <FuzzySearch
                list={this.list}
                list2={this.list2}
                keys={['author', 'title']}
                width={430}
                onSelect={this.action.bind(this)}
              />           
                <Link to="/resume">Profile</Link>
                <Link to="/aboutme">About </Link>
                <Link to="/projects">SubCategories</Link>
                <Link to="/contact">Search</Link>
            </Navigation>
        </Header>
        <Drawer title={<Link style={{textDecoration: 'none', color: 'black'}} to="/">Home</Link>}>
            <Navigation>
              <Link to="/resume">Profile</Link>
              <Link to="/aboutme">About </Link>
              <Link to="/projects">SubCategories</Link>
              <Link to="/contact">Search</Link>
            </Navigation>
        </Drawer>
        <Content>
            <div className="page-content" />
            <Main/>
        </Content>
    </Layout>
</div>

    );
  }
}

export default withRouter(App);
