import React, { Component } from 'react';
import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import './styles/sass/styles.scss';
import AOS from 'aos';
import 'aos/dist/aos.css';

class App extends Component {
    render() {
        AOS.init();
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
