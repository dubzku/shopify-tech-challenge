import React, { Component } from 'react';
import firebase from './firebase';

class Nominations extends Component {

    removeNomination = (nomination) => {
        const dbRef = firebase.database().ref();
        dbRef.child(nomination).remove();
    }

    render () {
        const { key, movieName, movieYear } = this.props.nomMovieInfo;

        return (
            <div key={key}>
                <p>{movieName} ({movieYear})</p>
                <button onClick={() => this.removeNomination(key)}>Remove</button>
            </div>
        )
    }
}

export default Nominations;
