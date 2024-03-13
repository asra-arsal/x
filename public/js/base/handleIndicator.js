(async () => {
    const apiEndpoint = api.misc.indicator;
    const resp = await fetch(apiEndpoint);
    const { success, data, error } = await resp.json();

    if (success) {
        const indicator = document.getElementById('indicator');
        const indicatorLink = document.getElementById('indicator-link');

        indicator.innerText = data.name;
        indicatorLink.setAttribute('href', data.link);
    } else {
        handleError('Server did not respond with the requested indicator data!', error);
    }
})();
