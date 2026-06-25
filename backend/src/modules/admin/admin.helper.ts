export const getMonthRanges = () => {
    const startOfMonth = new Date();

    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const startOfPrevMonth =
        new Date(
            startOfMonth.getFullYear(),
            startOfMonth.getMonth() - 1,
            1
        );

    return {
        startOfMonth,
        startOfPrevMonth,
    };
};