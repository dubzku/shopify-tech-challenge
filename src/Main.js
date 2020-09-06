import React, { Component } from 'react';
import axios from 'axios';
import firebase from './firebase';
import Nominations from './Nominations';

class Main extends Component {
    constructor (props) {
        super (props);
        this.state = {
            query: '',
            results: [],
            loading: false,
            message: '',
            nominatedMoviesFromChild: [],
            isButtonDisabled: [],
        }
    }

    // this is to do with when the user types into the Search Movie field
    handleOnInputChange = (event) => {
        const query = event.target.value;

        // if condition so that when the user deletes their input, the results will also disappear, rather than staying on the screen
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

    // API Call to get the movie results
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

    onNominate = (resultFromApi, indexOfNomination) => {

        if (this.state.nominatedMoviesFromChild.length < 5) {
            this.setState({
            isButtonDisabled: [...this.state.isButtonDisabled, resultFromApi.imdbID]
        }, () => this.checkNominationLimit(indexOfNomination) )
        } else {
            alert("You've reached your nomination limit! You can remove a nomination to make room for another one!")
        }
    }

    checkNominationLimit = (indexOfNomination) => {
        const dbRef = firebase.database().ref();

        if (this.state.nominatedMoviesFromChild.length < 5) {
            dbRef.push({
            movieName: this.state.results[indexOfNomination].Title,
            movieYear: this.state.results[indexOfNomination].Year,
            imdbID: this.state.results[indexOfNomination].imdbID
        });
        } else {
            alert('You have too many movies!');
        }
    }

    callbackToSendChild = (dataFromChild) => {
        this.setState({
            isButtonDisabled: dataFromChild
        })
    }

    callbackToSendChildTwo = (dataFromChild) => {
        this.setState({
            nominatedMoviesFromChild: dataFromChild
        })
    }

    render() {
        const { query, loading, message, isButtonDisabled } = this.state;

        return (
            <div className="App">

                {
                        this.state.nominatedMoviesFromChild.length >= 5
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
                        onChange={ this.handleOnInputChange }
                    />
                </label>
                

                <div className="flexContainer">
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

                    <Nominations passIsButtonDisabledInfo={isButtonDisabled} 
                                callbackFromParent={this.callbackToSendChild}
                                callbackFromParentTwo={this.callbackToSendChildTwo} />
                </div>
            </div>
        );
    }
}

export default Main;