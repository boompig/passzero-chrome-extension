// @flow

import * as React from "react";

import Utils from "./passzero_utils.js";

type Props = {
	onBack: Function,
	onDeleteClick: Function,
	entry: any
};

class Entry extends React.Component<Props, {}> {
	handlePasswordClick: Function;

	constructor(props: Props) {
		super(props);
		this.handlePasswordClick = this.handlePasswordClick.bind(this);
	}

	handlePasswordClick(event: SyntheticEvent<HTMLElement>) {
		Utils.selectText(event.target);
	}

	render() {
		return (
			<div id="entry-container">
				<span className="back-button glyphicon glyphicon-chevron-left" role="button"
					onClick={ this.props.onBack }></span>
				<div className="entry">
					<div className="entry-account">
						<span>{ this.props.entry.account }</span>
						<span id="entry-delete-btn" role="button"
							className="glyphicon glyphicon-remove"
							onClick={ this.props.onDeleteClick }></span>
					</div>
					<div className="entry-username">{ this.props.entry.username }</div>
					<div className="entry-password password-hidden"
						onClick={ this.handlePasswordClick }>
						{ this.props.entry.password }
					</div>
				</div>
			</div>
		);
	}
}

export default Entry;
