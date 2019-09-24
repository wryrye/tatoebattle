import React from "react";
import './About.css'
import { withRouter } from 'react-router-dom'

class About extends React.Component {

    render() {

        return (
            <div>
                This is a Chinese language learning tool that can help students better understand the meaning and usage of words through context.
                As a Chinese language student myself, there are so many words for which I know the dictionary definition but am unsure how to
                use naturally in a sentence. Fear of improper usage and mangled grammar makes me reluctant to try these words or phrases
                out in conversation, slowing my overall progress. This web app seeks to eliminate these qualms by allowing users to search
                for characters/ words/ phrases and providing actual Chinese sentences that include the specified input in context. Studying
                these example sentences will teach users the most frequent and appropriate usages, hopefully making the user sound
                more natural and authentic. The sentences are from a collection of 35,000+ crowd-sourced Chinese-English translations from
                Tatoeba.com (I used python scripts to link and merge the various datasets they provide on their site). Therefore, I cannot
                vouch for the quality and correctness of every translation, but presume the vast majority are reasonably translated by native speakers.
            </div>
        );
    }
}

export default withRouter(About);