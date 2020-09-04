import React, { Component } from 'react';

class MovieResults extends Component {
    render () {
        return (
            <div key={this.props.resultMovieInfo.imdbID}>
                <p>{this.props.resultMovieInfo.Title} ({this.props.resultMovieInfo.Year})</p>
                <button onClick={() => this.props.onNominate}>Nominate</button>
            </div>
        )
    }
}

export default MovieResults;