// @flow

import * as React from "react";

import SearchResults from "./search_results";
import type { T_DecEntry, T_EncEntry } from "./types";

type ISearchProps = {
	onEntryClick: (entryId: number, index: number) => void,
	entries: Array<(T_DecEntry | T_EncEntry)>
};

type ISearchState = {
	searchString: string,
};

/**
 * Component for search
 * Includes searchresults and search string
 */
class Search extends React.Component<ISearchProps, ISearchState> {

	handleChange: (e: SyntheticEvent<HTMLElement>) => void;

	constructor(props: ISearchProps) {
		super(props);
		this.state = { searchString: "" };
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(e: SyntheticEvent<HTMLElement>) {
		if(e.target instanceof window.HTMLInputElement) {
			this.setState({ searchString: e.target.value });
		}
	}

	render() {
		const searchString = this.state.searchString.trim().toLowerCase();
		return (
			<div id="search-container">
				<form id="search-form" role="search">
					<input className="form-control"
						type="search"
						placeholder="search"
						name="search"
						onChange={ this.handleChange }
						tabIndex="1" />
				</form>
				<SearchResults
					entries={ this.props.entries }
					searchString={searchString}
					onEntryClick={ this.props.onEntryClick } />
			</div>
		);
	}
}

export default Search;