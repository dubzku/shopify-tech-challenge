import React, { Component } from 'react';
import axios from 'axios';
import firebase from './firebase';
import Instructions from './Instructions';
import Nominations from './Nominations';
import Loader from './assets/loader.gif'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import swal from 'sweetalert';

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
        this.cancel = '';
    }

    // Event Handler for when the user types into the search field
    handleOnInputChange = (event) => {
        const query = event.target.value;

        // If there is nothing in the user input field (i.e. if user deletes their input) clear the previous movie results from the DOM
        if ( ! query ) {
            this.setState({
                query,
                results: [],
                message: ''
            })
        } else {
            // Otherwise, set state with their search query, and make the API call with that query
            this.setState({
                query,
                loading: true,
                message: ''
            }, () => {
                this.fetchSearchResults(query);
            })
        }
    }

    // API Call to OMDb to get the movie results
    fetchSearchResults = (query) => {
        const searchUrl = `http://www.omdbapi.com/?apikey=eb2d65bb&type=movie&s=${query}`

        // Because this is a live search, need to cancel previous API requests before making a new one (otherwise requests will be firing each time user types a letter)
        // Before making request, first check if this.cancel token is already available; if so, then cancel that previous request before making new one
        if ( this.cancel ) {
            this.cancel.cancel();
        }

        // if it is not available, create a new token
        this.cancel = axios.CancelToken.source();

        // axios.get(searchUrl, {
        //     cancelToken: this.cancel.token
        // })
        axios({
            url: searchUrl,
            method: `GET`,
            responseType: `json`
        }, {
            cancelToken: this.cancel.token
        })
        .then( (res) => {
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
                    message: "Hmm, we don't have that exact title. Please try another title."
                })
            }
        })
    }

    // Event Handler for when nominate button is clicked 
    onNominate = (resultFromApi, indexOfResult) => {
        if (this.state.nominatedMoviesFromChild.length < 5) {
            this.setState({
                // add the clicked nominate button ID to a copy of the isButtonDisabled array in state, and setState for isButtonDisabled
                isButtonDisabled: [...this.state.isButtonDisabled, resultFromApi.imdbID]
            }, () => this.checkNominationLimit(indexOfResult) )
        } else {
            swal("You've reached your nomination limit", "You can remove a nomination to make room for another one!", "warning", { button: "Got it" })
        }
    }

    // To check whether or not to push nominated movie data to Firebase 
    checkNominationLimit = (indexOfResult) => {
        const dbRef = firebase.database().ref();

        if (this.state.nominatedMoviesFromChild.length < 5) {
            dbRef.push({
                movieName: this.state.results[indexOfResult].Title,
                movieYear: this.state.results[indexOfResult].Year,
                imdbID: this.state.results[indexOfResult].imdbID
            });
        } 
    }

    // Callback function to get updated isButtonDisabled info from child (Nominations.js), so we know which buttons should be disabled/not 
    callbackToSendNomination = (dataFromChild) => {
        this.setState({
            isButtonDisabled: dataFromChild
        })
    }

    // Callback function to get nominated movies data from child (Nominations.js)
    callbackToSendNominationTwo = (dataFromChild) => {
        this.setState({
            nominatedMoviesFromChild: dataFromChild
        })
    }

    render() {
        const { query, loading, message, isButtonDisabled, results } = this.state;

        return (
            <main>

                <Instructions 
                    nominatedMoviesLength={ this.state.nominatedMoviesFromChild.length } 
                />
                
                <div className="searchBar">
                    <label htmlFor="searchInput" className="srOnly">Enter movie name</label>   
                    <input 
                        type="text"
                        id="searchInput"
                        name="query"
                        value={ query }
                        placeholder="Enter movie name"
                        maxLength="30"
                        onChange={ this.handleOnInputChange }
                    />
                    <span className="srOnly">Search icon from Font Awesome</span>
                    <FontAwesomeIcon icon={ faSearch } className="magnifyingGlass" />
                </div>
            
                <div className="errorMessage">
                    { message && <p>{ message }</p> }
                </div>
                
                <div className="flexContainer">
                    <div className="resultsContainer">
                        <h3>Search Results { query ? `for "${query}"` :'' }</h3>

                        <img src={ Loader } className={ `search-loading ${loading ? 'show' : 'hide'}` } alt="loader"/>

                        {
                            results.map( (result, index) => {
                                return (
                                    <div key={ result.imdbID } className="resultOption">
                                        <p>{ result.Title } ({ result.Year })</p>
                                        <button 
                                            className="nominateButton"
                                            id={ result.imdbID } 
                                            onClick={ () => this.onNominate(result, index) } 
                                            // check whether current button exists in the isButtonDisabled array
                                            disabled={ isButtonDisabled.indexOf(result.imdbID) !== -1 }>
                                            Nominate
                                        </button>
                                    </div>
                                )
                            })
                        }
                    </div>

                    <Nominations passIsButtonDisabledInfo={ isButtonDisabled } 
                                callbackFromMain={ this.callbackToSendNomination }
                                callbackFromMainTwo={ this.callbackToSendNominationTwo } />
                </div>
            </main>
        );
    }
}

export default Main;