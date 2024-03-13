const createRetweet = async (index, type) => {
    const apiType = index === 0 ? 'create' : 'update';
    const apiEndpoint = type === 'publish' ? api.retweets.publish : api.retweets[apiType];

    const retweet = {
        id: getInputValue(0, 'id', index),
        link: getInputValue(0, 'link', index),
        time: getInputValue(0, 'time', index),
        priority: getInputValue(0, 'priority', index),
        type,
    };

    if (type === 'publish') {
        showLoadingAnimation();
    }

    const resp = await fetch(apiEndpoint, {
        method: type === 'publish' ? 'POST' : apiType === 'update' ? 'PUT' : 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(retweet),
    });
    const { success, error } = await resp.json();

    if (!success) {
        hideLoadingAnimation();
        return handleError('Error encountered when trying to create the Post.', error);
    } else {
        location.reload();
    }
};
