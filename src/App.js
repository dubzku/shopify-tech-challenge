import React, { Component } from 'react';
import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import './styles/sass/styles.scss';

class App extends Component {
    render() {
        return (
            <div className="App wrapper">
                <Header />
                <Main />
                <Footer />
            </div>
        );
    }
}

export default App;
