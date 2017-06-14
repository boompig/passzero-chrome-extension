import * as React from "react";
import Utils from "./passzero_utils";
import * as CopyToClipboard from "react-copy-to-clipboard";
import * as ReactTooltip from "react-tooltip";
import { findDOMNode } from "react-dom";


interface DecEntry {
    id: number;
    username: string;
    account: string;
    password: string;
}

/**
 * Expected props:
 *      - entry -> decrypted entry
 *      - onBack -> callback for when back button clicked
 *      - onDeleteClick -> callback for when delete button clicked
 */
interface EntryProps {
    onBack: any;
    onDeleteClick: any;
    entry: DecEntry;
}

/**
 * The decrypted entry view
 */
class Entry extends React.Component<EntryProps, any> {
    constructor(props) {
        super(props);
        this.handlePasswordClick = this.handlePasswordClick.bind(this);
    }

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
                    <CopyToClipboard text={ this.props.entry.password }
                        onCopy={ () => ReactTooltip.show(findDOMNode(this.refs.foo)) }>
                        <button type="button" className="btn btn-success form-control entry-password-copy-btn"
                            >Copy Password</button>
                    </CopyToClipboard>
                    <p ref="foo" data-tip="Copied to clipboard"></p>
                    <ReactTooltip place="bottom" />
                </div>
            </div>
        );
    }
};

export default Entry;
