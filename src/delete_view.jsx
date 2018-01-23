// @flow

import React from "react";

type IDeleteViewProps = {
	onBack: Function,
	onDeleteClick: Function,
	entry: any
};

class DeleteView extends React.Component<IDeleteViewProps, {}> {

	render() {
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

export default DeleteView;
