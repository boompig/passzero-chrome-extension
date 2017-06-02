import * as React from "react";

/**
 * This file is responsible for the UI aspects of the PassZero Chrome extension
 * Each element
 */
class DeleteView extends React.Component<any, any> {
    render() {
        return (
            <div id="confirm-delete-container">
                <span className="back-button glyphicon glyphicon-chevron-left"
                    role="button"
                    onClick={ this.props.onBack }>
                </span>
                <p>Delete record for account '{ this.props.entry.account }'?</p>
                <button type="button"
                    className="btn btn-danger"
                    onClick={ this.props.onDeleteClick }>Confirm Delete</button>
            </div>
        );
    }
};

export default DeleteView;

