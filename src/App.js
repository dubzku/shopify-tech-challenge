import React, { Component } from 'react';
import './App.css';
import firebase from './firebase';
import axios from 'axios';

class App extends Component {
    constructor() {
        super();
        this.state = {
            query: '',
            results: [],
            loading: false,
            message: '',
            nominatedMovies: [],
            isButtonDisabled: []
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
                    movieYear: data[key].movieYear
                })
            }

            this.setState({
                nominatedMovies: newNominations
            })

        })
    }

    handleOnInputChange = (event) => {
        const query = event.target.value;

        if ( ! query ) {
            this.setState({
                query,
                results: [],
                message: ''
            })
        } else {
            this.setState({
                query: query,
                loading: true,
                message: ''
            }, () => {
                this.fetchSearchResults(query);
            })
        }
    }

    fetchSearchResults = (query) => {
        const searchUrl = `http://www.omdbapi.com/?apikey=2e09b2c3&type=movie&s=${query}`

        if ( this.cancel ) {
            this.cancel.cancel();
        }
        this.cancel = axios.CancelToken.source();
        axios.get(searchUrl, {
            cancelToken: this.cancel.token
        })
        .then(res => {
            const resultNotFoundMsg = ! res.data.Search.length
                                    ? 'There are no results for this title. Please try another movie title.' 
                                    : '';
            
            this.setState ({
                results: res.data.Search,
                message: resultNotFoundMsg,
                loading: false
            })
        })
        .catch(error => {
            if (axios.isCancel(error) || error ) {
                this.setState({
                    loading: false,
                    message: 'Sorry, something went wrong! Please try again.'
                })
            }
        })
    }

    // renderSearchResults = () => {
    //     const { results } = this.state;

    //     if (Object.keys( results ).length && results.length ) {
    //         return (
    //             <div className="resultsContainer">
    //                 <h2>Movie Results</h2>
    //                 {
    //                     results.map((result, index) => {
    //                         return (
    //                             <div key={result.imdbID}>
    //                                 <p>{result.Title} ({result.Year})</p>
    //                                 <button onClick={() => this.onNominate(index)}>Nominate</button>
    //                             </div>
    //                         )
    //                     })
    //                 }
    //             </div>
    //         )
    //     }
    // }

    renderNominations = () => {
        const { nominatedMovies } = this.state;

        if(Object.keys(nominatedMovies).length && nominatedMovies.length) {
            return (
                <div className="nominationsContainer">
                    <h2>Movie Nominations</h2>
                    {
                        nominatedMovies.map((nominatedMovie) => {
                            return (
                                <div key={nominatedMovie.key}>
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

    onNominate = (indexOfNomination) => {

        const dbRef = firebase.database().ref();

        dbRef.push({
            movieName: this.state.results[indexOfNomination].Title,
            movieYear: this.state.results[indexOfNomination].Year
        });

    }


    removeNomination = (nomination) => {
        const dbRef = firebase.database().ref();
        dbRef.child(nomination).remove();

    }


    render() {
        const { query, loading, message } = this.state;

        return (
            <div className="App">
                {/* Heading */}
                <h1>Shopify Presents: The Shoppies Movie Awards</h1>
                {
                        this.state.nominatedMovies.length >= 5
                        ? <p>You've got 5 nominations! Maximum reached!</p>
                        : ''
                }

                {/* Search Input */}
                <label htmlFor="searchInput">
                    <input 
                        type="text"
                        id="searchInput"
                        name="query"
                        value={query}
                        placeholder="Enter movie name"
                        disabled={this.state.isInputDisabled}
                        onChange={ this.handleOnInputChange }
                    />
                </label>

                <div className="flexContainer">
                    {/* Result */}
                    {/* { this.renderSearchResults() } */}
                    <div className="resultsContainer">
                        <h2>Movie Results for {this.state.query}</h2>
                        {
                            this.state.results.map((result, index) => {
                                return (
                                    <div key={result.imdbID}>
                                        <p>{result.Title} ({result.Year})</p>
                                        <button id={result.imdbID} 
                                        onClick={() => this.setState({isButtonDisabled: [...this.state.isButtonDisabled, result.imdbID]}, () => {this.onNominate(index) })} 
                                        disabled={this.state.isButtonDisabled.indexOf(result.imdbID)!==-1}>Nominate</button>
                                    </div>
                                )
                            })
                        }
                    </div>

                    {/* Nominations */}
                    { this.renderNominations()}
                </div>


                

            </div>
        );
    }
}

export default App;
