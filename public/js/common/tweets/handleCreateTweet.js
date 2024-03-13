const createTweet = async (index, type) => {
    const apiType = index === 0 ? 'create' : 'update';
    const apiEndpoint = type === 'publish' ? api.tweets.publish : api.tweets[apiType];

    const tweet = {
        id: getInputValue(1, 'id', index),
        message: getInputValue(1, 'message', index),
        tags: getInputValue(1, 'tags', index),
        media: getInputValue(1, 'media', index),
        images: getInputValue(1, 'images', index),
        // link: getInputValue(1, 'link', index),
        time: getInputValue(1, 'time', index),
        priority: getInputValue(1, 'priority', index),
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
        body: JSON.stringify(tweet),
    });
    const { success, error } = await resp.json();

    if (!success) {
        hideLoadingAnimation();
        return handleError('Error encountered when trying to create the Post.', error);
    } else {
        location.reload();
    }
};
