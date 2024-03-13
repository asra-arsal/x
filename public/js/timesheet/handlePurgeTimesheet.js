const purgeTimesheet = async () => {
    const apiEndpoint = `${api.timesheet.delete}/all`;

    const typeInput = document.getElementById('modal-purge-type');
    const timeslot = { type: typeInput.value };

    const resp = await fetch(apiEndpoint, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(timeslot),
    });
    const { success, error } = await resp.json();

    if (!success) return handleError('There was an error when purging the timesheet from the database.', error);

    window.location.href = `/timesheet/${typeInput.value}`;
};
