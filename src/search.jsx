// @flow

import * as React from "react";

import SearchResults from "./search_results";
import type { T_DecEntry, T_EncEntry } from "./types";

type ISearchProps = {
	onEntryClick: (entryId: number, index: number) => void,
	entries: Array<(T_DecEntry | T_EncEntry)>,
	currentUrl: string,
	// if set to true, do not show this component
	hide: boolean
};

type ISearchState = {
	searchString: string
};

/**
 * Component for search
 * Includes searchresults and search string
 */
class Search extends React.Component<ISearchProps, ISearchState> {

	handleChange: (e: SyntheticEvent<HTMLElement>) => void;
	handleClearSearch: () => void;

	constructor(props: ISearchProps) {
		super(props);
		this.state = {
		};
		//if(this.props.currentUrl) {
			//this.state.searchString = `url: ${this.props.currentUrl}`;
		//} else {
		this.state.searchString = "";
		//}
		this.handleChange = this.handleChange.bind(this);
		this.handleClearSearch = this.handleClearSearch.bind(this);
	}

	componentWillUpdate(nextProps: ISearchProps, nextState: ISearchState) {
		//if(this.props.currentUrl === "" && nextProps.currentUrl !== "") {
			//console.log("setting the search string to the current URL");
			//// set the search string to query for the current URL
			//this.setState({
				//searchString: `url: ${nextProps.currentUrl}`,
			//});
		//}
	}

	handleClearSearch() {
		this.setState({
			searchString: "",
		});
	}

	handleChange(e: SyntheticEvent<HTMLElement>): void {
		if(e.target instanceof window.HTMLInputElement) {
			const searchString = e.target.value;
			this.setState({ "searchString": searchString });
		}
	}

	render() {
		if(this.props.hide) {
			return <div></div>;
		}
		const searchString = this.state.searchString.trim().toLowerCase();
		return (
			<div id="search-container">
				<form id="search-form" role="search">
					<div className="search-input-container form-group has-feedback">
						<input className="form-control"
							type="search"
							placeholder="search"
							name="search"
							onChange={ this.handleChange }
							tabIndex="1"
							value={ this.state.searchString } />
						<span role="button"
							className="clear-search-btn glyphicon glyphicon-remove-circle form-control-feedback"
							onClick={ this.handleClearSearch } ></span>
					</div>
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
