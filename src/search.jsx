// @flow

import * as React from "react";

import SearchResults from "./search_results";
import type { T_DecEntry, T_EncEntry } from "./types";

const Console = console;

type ISearchProps = {
	onEntryClick: (entryId: number, index: number) => void,
	entries: Array<(T_DecEntry | T_EncEntry)>,
	currentUrl: string,
	// if set to true, do not show this component
	hide: boolean
};

type ISearchState = {
	searchString: string,
	service: ?string,
};

/**
 * Parse the given URL and return the service from it
 * The intension is not for this to work *all the time*
 * But should work in the most common cases
 */
function serviceFromUrl(url: string) {
	if(url === "") {
		return null;
	}
	// remove the protocol
	let i = url.indexOf("://");
	let protocol;
	if(i === -1) {
		Console.log(url);
		console.error("Could not detect protocol");
		return null;
	}
	protocol = url.substr(0, i);
	//console.log("protocol is " + protocol);
	url = url.substr(i + 3);
	if(protocol === "chrome") {
		// this is an internal chrome settings page
		// no service is relevant in this context
		return null;
	}
	if(url.startsWith("www.")) {
		// URL includes www.
		url = url.substr(4);
	}

	// now get rid of anything after the hostname
	i = url.indexOf("/");
	if(i !== -1) {
		url = url.substr(0, i);
	}
	i = url.indexOf("?");
	if(i !== -1) {
		url = url.substr(0, i);
	}

	// remove the TLD
	i = url.lastIndexOf(".");
	if(i === -1) {
		// TODO
		console.error("This domain has no TLD. Possibly localhost?");
		return null;
	} else {
		url = url.substr(0, i);
	}

	// the remaining part should be the service
	// only return it if it "looks like" a service: a plain word
	if(url.search(/[a-z]+$/) === 0) {
		return url;
	} else {
		return null;
	}
}

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
			searchString: "",
			// this is best-practice in props-mirroring
			service: null,
		};

		this.handleChange = this.handleChange.bind(this);
		this.handleClearSearch = this.handleClearSearch.bind(this);
	}

	/**
	 * Called each time this component receives new props
	 */
	static getDerivedStateFromProps(nextProps: ISearchProps, prevState: ISearchState) {
		const service = serviceFromUrl(nextProps.currentUrl);
		// service has changed
		if(prevState.service !== service) {
			if(service && prevState.searchString === "") {
				Console.log("Updating searchString with respect to service...");
				// return the object to update the state
				return {
					searchString: service,
					// this is best-practice in props-mirroring
					service: service,
				};
			} else {
				// just update the service
				return {
					service: service,
				};
			}
		}
		return null;
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
