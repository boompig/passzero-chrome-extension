// @flow

import * as React from "react";
import type { T_DecEntry, T_EncEntry } from "./types";

type ISearchResultsLinkProps = {
	entry: (T_DecEntry | T_EncEntry),
	index: number,
	onEntryClick: (entryId: number, index: number) => void;
};

class SearchResultsLink extends React.Component<ISearchResultsLinkProps, {}> {
	handleClick: (event: SyntheticEvent<HTMLElement>) => void;

	constructor(props: ISearchResultsLinkProps) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
	}

	handleClick(event: SyntheticEvent<HTMLElement>) {
		event.preventDefault();
		const entryID = this.props.entry.id;
		this.props.onEntryClick(entryID, this.props.index);
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
