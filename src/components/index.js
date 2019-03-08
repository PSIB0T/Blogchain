'use strict'

const React = require('react')
const ReactDOM = require('react-dom')
const App = require('./app')
import 'react-mdl/extra/material.css';
import 'react-mdl/extra/material.js';
import 'react-notifications/lib/notifications.css';

ReactDOM.render(<App />, document.getElementById('root'))