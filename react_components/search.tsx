import * as React from "react";

interface Entry {
    id: number;
    account: string;
}

interface SearchResultsLinkProps {
    onEntryClick: any;
    entry: Entry;
}

/**
 * Expected props:
 *      - entry -> entry object which has ID and account
 *          so can be encrypted or decrypted
 *      - onEntryClick -> callback when entry selected
 */
class SearchResultsLink extends React.Component<SearchResultsLinkProps, any> {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(event) {
        event.preventDefault();
        let entryID = this.props.entry.id;
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
};

interface SearchResultsProps {
    onEntryClick: any;
    entries: Array<Entry>;
    searchString: string;
}

/**
 * Container for search results.
 */
class SearchResults extends React.Component<SearchResultsProps, any> {
    render() {
        const searchString = this.props.searchString;
        let results = [];
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
};

interface SearchProps {
    onEntryClick: any;
    entries: Array<Entry>;
}

/**
 * Component for search
 * Includes searchresults and search string
 */
class Search extends React.Component<SearchProps, any> {
    constructor(props) {
        super(props);
        this.state = { "searchString": "" };
    }
    handleChange(e) {
        this.setState({ searchString: e.target.value });
    }
    render() {
        const searchString = this.state.searchString.trim().toLowerCase();
        return (
            <div id="search-container">
                <form id="search-form" role="search">
                    <input className="form-control" type="search"
                        placeholder="search"
                        onChange={ this.handleChange } tabIndex={ 1 } />
                </form>
                <SearchResults entries={ this.props.entries }
                    searchString={searchString}
                    onEntryClick={ this.props.onEntryClick } />
            </div>
        );
    }
};

export default Search;

