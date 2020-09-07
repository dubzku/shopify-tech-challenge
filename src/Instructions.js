import React, { Fragment } from 'react';

const Instructions =(props) => {
    return (
        <Fragment>
            <div className="instructions">
                <p>It's that time of year again...cast your votes for the 2020 Shoppies Movie Awards! You can nominate up to 5 movies. Happy nominating!</p>
            </div>
            <div className="limitReached">
                { 
                    props.nominatedMoviesLength >= 5 
                    ? <p>You've reached your nomination limit!</p> 
                    : '' 
                }
            </div>
        </Fragment>
    );
}

export default Instructions;