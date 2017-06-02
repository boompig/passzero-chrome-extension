interface HTMLInputElement {
    createTextRange?(): Range;
}

var PassZeroUtils = {
    /**
    * From this SOF thread:
    * https://stackoverflow.com/questions/985272/selecting-text-in-an-element-ak
    in-to-highlighting-with-your-mouse
    */
    selectText: function selectText(element: HTMLInputElement) {
        "use strict";
        var doc = document;
        var text = element;
        var range, selection;
        if (window.getSelection) {
            selection = window.getSelection();
            range = document.createRange();
            range.selectNodeContents(text);
            selection.removeAllRanges();
            selection.addRange(range);
        } else if ((<HTMLInputElement>document.body).createTextRange) {
            range = (<HTMLInputElement>document.body).createTextRange();
            range.moveToElementText(text);
            range.select();
        }
    },
    deselectText: function deselectText() {
        var doc = document;
        var range, selection;
        if ((<HTMLInputElement>doc.body).createTextRange) {
            range = (<HTMLInputElement>document.body).createTextRange();
            range.select();
        } else if (window.getSelection) {
            selection = window.getSelection();
            selection.removeAllRanges();
        }
    }
};

export default PassZeroUtils;

