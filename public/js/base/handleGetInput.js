const getInput = (type, name, index) => {
    const kind = type === 0 ? 'retweet' : 'tweet';
    return document.querySelector(`[name="${name}"][data-${kind}-id="${index}"]`);
};

const getInputValue = (type, name, index) => {
    const kind = type === 0 ? 'retweet' : 'tweet';
    return document.querySelector(`[name="${name}"][data-${kind}-id="${index}"]`).value;
};
