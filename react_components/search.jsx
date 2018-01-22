import React from "react";
import PropTypes from "prop-types";

import SearchResults from "./search_results.jsx";

/**
 * Component for search
 * Includes searchresults and search string
 */
class Search extends React.Component {
	constructor() {
		super();
		this.state = { searchString: "" };
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(e) {
		this.setState({ searchString: e.target.value });
	}

	render() {
		var searchString = this.state.searchString.trim().toLowerCase();
		return (
			<div id="search-container">
				<form id="search-form" role="search">
					<input className="form-control" type="search" placeholder="search"
						onChange={ this.handleChange } tabIndex="1" />
				</form>
				<SearchResults entries={ this.props.entries } searchString={searchString}
					onEntryClick={ this.props.onEntryClick } />
			</div>
		);
	}
}

Search.propTypes = {
	onEntryClick: PropTypes.function.isRequired,
	entries: PropTypes.arrayOf(PropTypes.object)
};

export default Search;
