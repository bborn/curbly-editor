
function unwrapper(node){
    sel = rangy.saveSelection();
    jQuery(node).find("span:not(.rangySelectionBoundary)[style]").contents().unwrap();
    rangy.restoreSelection(sel);
}



