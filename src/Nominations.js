import React, { Component } from 'react';
import firebase from './firebase';

class Nominations extends Component {
    constructor (props) {
        super (props);
        this.state = {
            nominatedMovies: []
        }
    }

    componentDidMount() {
        const dbRef = firebase.database().ref();

        // grabbing sotred data from Firebase 
        dbRef.on('value', (snapshot) => {
            const data = snapshot.val();

            const newNominations = [];

            for (let key in data) {
                newNominations.push({
                    key: key,
                    movieName: data[key].movieName,
                    movieYear: data[key].movieYear,
                    imdbID: data[key].imdbID
                })
            }

            this.setState({
                nominatedMovies: newNominations
            }, () => {
                // send nominatedMovies data up to parent (Main.js)
                this.props.callbackFromMainTwo(this.state.nominatedMovies);
            })
        })
    }

    removeNomination = (nomination) => {
        const dbRef = firebase.database().ref();
        dbRef.child(nomination).remove();

        const copyOfNominations = [...this.state.nominatedMovies];

        const filteredResult = copyOfNominations.filter((item) => {
            return item.key === nomination
        });

        const filteredResultId = filteredResult[0].imdbID;

        // Get isButtonDisabled info from parent (Main.js)
        const copyIsButtonDisabled = [...this.props.passIsButtonDisabledInfo];

        const index = copyIsButtonDisabled.indexOf(filteredResultId);

        // Check if the ID of the disabled button is in the isButtonDisabled array; if yes, remove it from the array so that the button becomes re-enabled 
        if (index > -1 ) {
            copyIsButtonDisabled.splice(index, 1)
        }

        // Pass this updated info back up to Main.js from Nominations.js
        this.props.callbackFromMain(copyIsButtonDisabled);
    }

    render () {
        const { nominatedMovies } = this.state;
        return (
            <div className="nominationsContainer">
                <h3>Movie Nominations</h3>
                {
                    nominatedMovies.map((nominatedMovie) => {
                        return (
                            <div key={nominatedMovie.imdbID} className="nominationChoice">
                                <p>{nominatedMovie.movieName} ({nominatedMovie.movieYear})</p>
                                <button 
                                    className="removeButton"
                                    onClick={ () => this.removeNomination(nominatedMovie.key) }>
                                    Remove
                                </button>
                            </div>
                        )
                    }) 
                }
            </div>
        )
    }
}

export default Nominations;
