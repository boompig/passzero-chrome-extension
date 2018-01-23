// @flow

import * as React from "react";

type ISearchResultsLinkProps = {
	entry: any,
	onEntryClick: Function
};

class SearchResultsLink extends React.Component<ISearchResultsLinkProps, {}> {
	handleClick: Function;

	constructor(props: ISearchResultsLinkProps) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
	}

	handleClick(event: SyntheticEvent<HTMLElement>) {
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

export default SearchResultsLink;
