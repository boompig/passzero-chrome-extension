var PassZeroUtils = {
    /**
    * From this SOF thread:
    * https://stackoverflow.com/questions/985272/selecting-text-in-an-element-ak
    in-to-highlighting-with-your-mouse
    */
    selectText: function selectText(element) {
        "use strict";
        var doc = document;
        var text = element;
        var range, selection;
        if (doc.body.createTextRange) {
            range = document.body.createTextRange();
            range.moveToElementText(text);
            range.select();
        } else if (window.getSelection) {
            selection = window.getSelection();
            range = document.createRange();
            range.selectNodeContents(text);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    },
    deselectText: function deselectText () {
        var doc = document, range, selection;
        if (doc.body.createTextRange) {
            range = document.body.createTextRange();
            range.select();
        } else if (window.getSelection) {
            selection = window.getSelection();
            selection.removeAllRanges();
        }
    }
};

if (module && module.exports) {
    module.exports = PassZeroUtils;
}
