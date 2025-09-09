// Library functions for managing the UI
'use strict';

export function clearNode(node) { 
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

export function optionFor(value, textContent) { 
    const opt = document.createElement('option');
    opt.textContent = textContent;
    opt.value = value; 
    return opt;
}
