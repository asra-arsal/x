(() => {
    const timesheetPageSwitch = document.getElementById('timesheet-type-switch');

    timesheetPageSwitch.addEventListener('change', () => {
        window.location.href = `/timesheet/${timesheetPageSwitch.value}`;
    });
})();
