// @flow

import * as React from "react";
// doing this because Clipboard is already a reserved keyword in extensions
import MyClipboard from "clipboard";
import ReactTooltip from "react-tooltip";

import Utils from "./passzero_utils.js";
import type { T_DecEntry, T_EncEntry } from "./types";

type IEntryState = {};

type IEntryProps = {
	onBack: Function,
	onDeleteClick: Function,
	// the entry is being decrypted asynchronously
	entry: (T_DecEntry | T_EncEntry),
};

class Entry extends React.Component<IEntryProps, IEntryState> {
	handlePasswordClick: Function;
	copyButtonEnabled: boolean;
	initClipboard: Function;
	copyButton: any;

	clipboard: any;

	constructor(props: IEntryProps) {
		super(props);
		this.clipboard = null;
		this.copyButtonEnabled = false;
		this.handlePasswordClick = this.handlePasswordClick.bind(this);
		this.initClipboard = this.initClipboard.bind(this);
	}

	initClipboard() {
		this.clipboard = new MyClipboard(this.copyButton, {
			target: () => {
				// select the element dynamically
				return document.getElementById("password-" + this.props.entry.id);
			},
		});
		this.copyButtonEnabled = true;
	}

	componentDidMount() {
		if(!this.props.entry.is_encrypted) {
			this.initClipboard();
		}
	}

	/**
	 * Not called on initial render
	 */
	componentDidUpdate() {
		if(!this.copyButtonEnabled && !this.props.entry.is_encrypted) {
			this.initClipboard();
		}
	}

	componentWillUnmount() {
		if(this.clipboard) {
			this.clipboard.destroy();
		}
	}

	handlePasswordClick(event: SyntheticEvent<HTMLElement>) {
		Utils.selectText(event.target);
	}

	render() {
		let entryContents;
		if(this.props.entry.is_encrypted) {
			entryContents = (<p>The entry is being decrypted...</p>);
		} else {
			entryContents = (
				<div className="entry">
					<div className="entry-account">
						<span>{ this.props.entry.account }</span>
						<span id="entry-delete-btn" role="button"
							className="glyphicon glyphicon-remove"
							onClick={ this.props.onDeleteClick }></span>
					</div>
					<div className="entry-username">{ this.props.entry.username }</div>
					<div className="entry-password password-hidden"
						id={ "password-" + this.props.entry.id }
						onClick={ this.handlePasswordClick }>
						{ this.props.entry.password }
					</div>
					<button className="form-control btn btn-success copy-password-btn"
						data-tip="Copied to clipboard!"
						data-event="click"
						ref={ (elem) => this.copyButton = elem }
						data-event-off="mouseout blur">Copy Password</button>
					<ReactTooltip
						type="dark"
						place="top"
						effect="solid"
						delayHide={ 2000 } />
				</div>
			);
		}
		return (
			<div id="entry-container">
				<span className="back-button glyphicon glyphicon-chevron-left" role="button"
					onClick={ this.props.onBack }></span>
				{ entryContents }
			</div>
		);
	}
}

export default Entry;
