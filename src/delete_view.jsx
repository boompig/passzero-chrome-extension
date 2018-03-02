// @flow

import React from "react";
import type { T_EncEntry, T_DecEntry } from "./types";

type IDeleteViewProps = {
	onBack: Function,
	onDeleteClick: Function,
	// the entry is being decrypted asynchronously
	entry: (T_EncEntry | T_DecEntry),
};

class DeleteView extends React.Component<IDeleteViewProps, {}> {

	render() {
		if (this.props.entry.is_encrypted) {
			return (<p>The entry is being decrypted...</p>);
		} else {
			return (
				<div id="confirm-delete-container">
					<span className="back-button glyphicon glyphicon-chevron-left"
						role="button"
						onClick={ this.props.onBack }></span>
					<p>Delete record for account &#34;{ this.props.entry.account }&#34;?</p>
					<button type="button"
						className="btn btn-danger"
						onClick={ this.props.onDeleteClick }>Confirm Delete</button>
				</div>
			);
		}
	}
}

export default DeleteView;
