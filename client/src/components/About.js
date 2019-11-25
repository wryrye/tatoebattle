import React from "react";
import './About.css'
import { withRouter } from 'react-router-dom'

class About extends React.Component {

    render() {

        return (
            <div id='about' className='container my-4'>
                <h1>What is TatoeBattle?</h1>
                <p>TatoeBattle is a language learning game that aims to teach students the meaning and usage of words through the context of complete sentences.
                Once in a game, the app provides random sentences in English and contestants are pitted against each other in trying to come up with the most
                accurate translation for a specified language. This provides users a good opppurtunity to draw upon what they already know as well as see how
                unknown words are used and in what contexts - all in a stimulating, gamified environment!</p>
                <p>Sentences are sourced from <b>Tatoeba</b>, a free collaborative online database of example sentences geared towards foreign language learners. </p>

                <h1>How do I play?</h1>
                <p> Click "Profile" in the top right corner and choose a username, a language to learn, and an avatar. After saving, navigate to the lobby
                (landing page) and click the "Play" button that appears when hovering over the desired game variant. Once the game starts, a random English
                sentence is displayed and your goal is to translate it to the best of your abilities into the specified language. When you submit your guess,
                you will receive visual feedback that indicates which words/characters you guessed correctly and those you missed. You will receive points based
                on your performance. Earn enough points and you will triumph over your opponent in this exhilarating reverse tug-of-war! </p>
                
                <h4>Scoring</h4>
                <ul>
                    <li><b>Correctness: </b>+1 point for each word/character translated correctly</li>
                    <li><b>First Strike: </b>+1 point for the player that submits first</li>
                    <li><b>Streak: </b>+1 point if the player won the previous round <i>(Coming soon!)</i></li>
                </ul>

                <h4>Modes</h4>
                <ul>
                    <li><b>Random: </b>Play against another random netizen (must wait for other user to join before game begins).</li>
                    <li><b>Company: </b>Put your skills to the test against established translation services.</li>
                    <li><b>Practice: </b>No points, no score, just practice. <i>(Coming soon!)</i></li> 
                </ul>


                <h1>What do we do with your data?</h1>
                A username is requested merely to track score history and populate the leaderboards!
            </div>
        );
    }
}

export default withRouter(About);