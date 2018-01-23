import React from "react";
import PropTypes from "prop-types";

import SearchResultsLink from "./search_results_link.jsx";

/**
 * Container for search results.
 */
class SearchResults extends React.Component {
	render() {
		const searchString = this.props.searchString;
		const results = [];
		for (let i = 0; i < this.props.entries.length; i++) {
			let entry = this.props.entries[i];
			if (entry.account.toLowerCase().indexOf(searchString) >= 0) {
				results.push(
					<SearchResultsLink key={ entry.id }
						entry={ entry }
						onEntryClick={ this.props.onEntryClick } />
				);
			}
		}

		return (
			<div className="searchResults">
				{results}
			</div>
		);
	}
}

SearchResults.propTypes = {
	searchString: PropTypes.string.isRequired,
	entries: PropTypes.object.isRequired,
	onEntryClick: PropTypes.function.isRequired
};

export default SearchResults;
