export const formatDate = (dateString: string) => {
    try {
        return new Date(dateString).toLocaleString();
    } catch {
        return dateString;
    }
};
