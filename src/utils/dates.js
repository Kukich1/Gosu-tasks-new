import { endOfDay } from "date-fns";

export default function timestamp(date = new Date()) {
    const timestamp = new Date(date).valueOf();
    return timestamp.toString().length === 13 ? Math.round(timestamp / 1000) : timestamp;
}

export function getTimestampStart(date = new Date()) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0);
    return Math.floor(startOfDay.valueOf() / 1000);
}

export function getTimestampEnd(date = new Date()) {
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59);
    return Math.ceil(endOfDay.valueOf() / 1000);
}