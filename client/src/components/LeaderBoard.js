import React from "react";
import './LeaderBoard.css'
import { withRouter } from 'react-router-dom'
import * as d3 from 'd3'

class LeaderBoard extends React.Component {

    async componentDidMount() {
        const rankData = await fetch('/lb');
        const rankJSON = await rankData.json();
        
        const leaderboard = rankJSON.map((item) => {
            return {
                name: item.user_id,
                team: 'mercedes',
                gap: item.total_wins,
                score: item.total_score,
                rank: item.rank,
            }
        })


        // array describing the color for each team
        // using camel case where the team names include a space
        const colors = [
            '#00D2BE',
            '#DC0000',
            '#1E41FF',
            '#FFF500',
            '#F596C8',
            '#9B0000',
            '#469BFF',
            '#BD9E57',
            '#FF8700',
            '#FFFFFF'
        ]

        // target the table element in which to add one div for each driver
        const main = d3
            .select('table')
        // .append('tbody')

        // for each driver add one table row
        // ! add a class to the row to differentiate the rows from the existing one
        // otherwise the select method would target the existing one and include one row less than the required amount
        const drivers = main
            .selectAll('tr.driver')
            .data(leaderboard)
            .enter()
            .append('tr')
            .attr('class', 'driver');

        // in each row add the information specified by the dataset in td elements
        // specify a class to style the elements differently with CSS

        // position using the index of the data points
        drivers
            .append('td')
            .text((d, i) => i + 1)
            .attr('class', 'position');


        // name followed by the team
        drivers
            .append('td')
            // include the last name in a separate element to style it differently
            // include the team also in another element for the same reason
            .html(({ name, team }) => `${name.split(' ').map((part, index) => index > 0 ? `<strong>${part}</strong>` : `${part}`).join(' ')} <span>${team}</span>`)
            // include a border with the color matching the team
            .style('border-left', ({ rank }) => {
                // find the color using the string value found in d.team
                // ! if the string value has a space, camelCase the value
                // const color = team.split(' ').map((word, index) => index > 0 ? `${word[0].toUpperCase()}${word.slice(1)}` : `${word}`).join('');
                return `4px solid ${colors[rank % colors.length]}`;
            })
            .attr('class', 'driver');

        // gap from the first driver
        drivers
            .append('td')
            .attr('class', 'gap')
            .append('span')
            .text(({ gap }) => gap);

        drivers
            .append('td')
            .attr('class', 'gap')
            .append('span')
            .text(({ score }) => score);
    }

    render() {
        return (
            <div className="leaderboard">
                <table>
                    <tbody>
                        <tr>
                            <th>Rank</th>
                            <th>Player</th>
                            <th>Wins</th>
                            <th>Points</th>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}

export default withRouter(LeaderBoard);