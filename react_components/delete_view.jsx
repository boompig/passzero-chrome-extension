import React from "react";
import PropTypes from "prop-types";

class DeleteView extends React.Component {
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

DeleteView.propTypes = {
	onBack: PropTypes.function.isRequired,
	onDeleteClick: PropTypes.function.isRequired,
	entry: PropTypes.object.isRequired
};

export default DeleteView;
