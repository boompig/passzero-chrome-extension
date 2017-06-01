var React = require("react");
var Utils = require("./passzero_utils.js");

/**
 * Expected props:
 *      - entry -> decrypted entry
 *      - onBack -> callback for when back button clicked
 *      - onDeleteClick -> callback for when delete button clicked
 */
class Entry extends React.Component {
    handlePasswordClick(event) {
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
};

module.exports = {
    Entry: Entry
};