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
            isButtonDisabled: [],
            isInputDisabled: false
        }
    }


    componentDidMount() {
        const dbRef = firebase.database().ref();

        dbRef.on('value', (snapshot) => {
            const data = snapshot.val();
            console.log('data', data)

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

    onNominate = (resultFromApi, indexOfNomination) => {

        if (this.state.nominatedMovies.length < 5) {
            this.setState({
            isButtonDisabled: [...this.state.isButtonDisabled, resultFromApi.imdbID]
        }, () => this.checkNominationLimit(indexOfNomination) )
        } else {
            alert("You've reached your nomination limit! You can remove a nomination to make room for another one!")
        }
    }

    checkNominationLimit = (indexOfNomination) => {
        const dbRef = firebase.database().ref();

        if (this.state.nominatedMovies.length < 5) {
            dbRef.push({
            movieName: this.state.results[indexOfNomination].Title,
            movieYear: this.state.results[indexOfNomination].Year,
            imdbID: this.state.results[indexOfNomination].imdbID
        });
        } else {
            alert('You have too many movies!');
        }
    }


    removeNomination = (nomination) => {
        const dbRef = firebase.database().ref();
        dbRef.child(nomination).remove();

        const copyOfNominations = [...this.state.nominatedMovies];

        const filteredResult = copyOfNominations.filter((item) => {
            return item.key === nomination
        })
        const filteredResultId = filteredResult[0].imdbID

        const copyIsButtonDisabled = [...this.state.isButtonDisabled];

        const index = copyIsButtonDisabled.indexOf(filteredResultId);
        if (index > -1 ) {
            copyIsButtonDisabled.splice(index, 1)
        }

        this.setState({
            isButtonDisabled: copyIsButtonDisabled
        })
        
        

    }


    render() {
        const { query, loading, message } = this.state;

        return (
            <div className="App">
                {/* Heading */}
                <h1>Shopify Presents: The Shoppies Movie Awards</h1>
                {
                        this.state.nominatedMovies.length >= 5
                        ? <p>You've reached your limit of 5 nominations!</p>
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
                                        onClick={() => this.onNominate(result, index)} 
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
