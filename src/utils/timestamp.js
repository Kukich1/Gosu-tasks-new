
export default function timestamp(date = new Date()) {
    const timestamp = new Date(date).valueOf();
    return timestamp.toString().length === 13 ? Math.round(timestamp / 1000) : timestamp;
}