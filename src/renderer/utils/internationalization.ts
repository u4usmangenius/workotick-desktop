import {DateTime} from "luxon"

export const getDateTimeInTimezone = (timezone:string) =>{
  const currentDate = DateTime.now().setZone(timezone);
  const formattedDate = currentDate.toLocaleString({
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZoneName: "short",
  });
  return formattedDate;
}