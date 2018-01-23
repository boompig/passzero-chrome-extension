import React from "react";
import PropTypes from "prop-types";

export default class SearchResultsLink extends React.Component {
	constructor() {
		super();
		this.handleClick = this.handleClick.bind(this);
	}

	handleClick(event) {
		event.preventDefault();
		const entryID = this.props.entry.id;
		this.props.onEntryClick(entryID);
	}

	render() {
		return (
			<div className="search-result-entry">
				<a className="search-result-link" href="#"
					onClick={ this.handleClick }>{ this.props.entry.account }</a>
			</div>
		);
	}
}

SearchResultsLink.propTypes = {
	entry: PropTypes.object.isRequired,
	onEntryClick: PropTypes.function.isRequired
};
