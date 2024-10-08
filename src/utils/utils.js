export function clearInput(selector) {
    const input = document.querySelector(selector);
    if (input) {
        input.value = "";
    }
}

export function getInputValue(selector) {
    return document.querySelector(selector).value;
}