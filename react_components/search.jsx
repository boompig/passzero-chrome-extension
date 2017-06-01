var React = require("react");

/**
 * Expected props:
 *      - entry -> entry object which has ID and account
 *          so can be encrypted or decrypted
 *      - onEntryClick -> callback when entry selected
 */
class SearchResultsLink extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(event) {
        event.preventDefault();
        var entryID = this.props.entry.id;
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

/**
 * Container for search results.
 */
class SearchResults extends React.Component {
    render() {
        var searchString = this.props.searchString;
        var results = [];
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

/**
 * Component for search
 * Includes searchresults and search string
 */
class Search extends React.Component {
    constructor(props) {
        super(props);
        this.state = { "searchString": "" };
    }
    handleChange(e) {
        this.setState({ searchString: e.target.value });
    }
    render() {
        var searchString = this.state.searchString.trim().toLowerCase();
        return (
            <div id="search-container">
                <form id="search-form" role="search">
                    <input className="form-control" type="search"
                        placeholder="search"
                        onChange={ this.handleChange } tabIndex="1" />
                </form>
                <SearchResults entries={ this.props.entries }
                    searchString={searchString}
                    onEntryClick={ this.props.onEntryClick } />
            </div>
        );
    }
};

module.exports = {
    Search: Search
};
