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
                this.props.callbackFromParentTwo(this.state.nominatedMovies);
            })
        })
    }

    removeNomination = (nomination) => {
        const dbRef = firebase.database().ref();
        dbRef.child(nomination).remove();

        const copyOfNominations = [...this.state.nominatedMovies];

        const filteredResult = copyOfNominations.filter((item) => {
            return item.key === nomination
        })
        const filteredResultId = filteredResult[0].imdbID

        // need props from parent (Main)
        const copyIsButtonDisabled = [...this.props.passIsButtonDisabledInfo]

        const index = copyIsButtonDisabled.indexOf(filteredResultId);
        if (index > -1 ) {
            copyIsButtonDisabled.splice(index, 1)
        }

        // need to pass this info back up to Main.js from Nominations.js
        this.props.callbackFromParent(copyIsButtonDisabled);
    }

    render () {
        const { nominatedMovies } = this.state;
        return (
            <div className="nominationsContainer">
                {/* { this.renderNominations()} */}
                
                    <h2>Movie Nominations</h2>
                    {
                        nominatedMovies.map((nominatedMovie) => {
                            return (
                                <div key={nominatedMovie.imdbID}>
                                    <p>{nominatedMovie.movieName} ({nominatedMovie.movieYear})</p>
                                    <button onClick={() => this.removeNomination(nominatedMovie.key)}>Remove</button>
                                </div>
                            )
                        }) 
                    }

                
                
            </div>
        )
    }
}

export default Nominations;
