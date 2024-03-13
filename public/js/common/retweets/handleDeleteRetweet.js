const deleteRetweet = async (id) => {
    const resp = await fetch(api.retweets.delete, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({ id: id }),
    });
    const { success, error } = await resp.json();

    if (!success) return handleError('There was an error when deleting the retweet!', error);

    window.location.href = '/retweets';
};
