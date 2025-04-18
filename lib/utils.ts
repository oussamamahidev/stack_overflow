import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import qs from "query-string";
import { BADGE_CRITERIA } from "@/constants";
import { format } from "date-fns";
import { BadgeCounts, Job } from "@/types";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatAndDivideNumber = (number: number): string => {
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + "M";
  } else if (number >= 1000) {
    return (number / 1000).toFixed(1) + "K";
  } else {
    return number?.toString();
  }
};

export const getTimestamp = (
  createdAt: Date | string | null | undefined
): string => {
  if (!createdAt) {
    return "Unknown time";
  }

  const now = new Date();
  // Convert createdAt to a Date object if it's a string
  const createdAtDate =
    typeof createdAt === "string" ? new Date(createdAt) : createdAt;

  // Check if the conversion resulted in a valid date
  if (!(createdAtDate instanceof Date) || isNaN(createdAtDate.getTime())) {
    return "Invalid date";
  }

  const timeDifference = now.getTime() - createdAtDate.getTime();

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  if (timeDifference < minute) {
    const seconds = Math.floor(timeDifference / 1000);
    return `${seconds} ${seconds === 1 ? "second" : "seconds"} ago`;
  } else if (timeDifference < hour) {
    const minutes = Math.floor(timeDifference / minute);
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  } else if (timeDifference < day) {
    const hours = Math.floor(timeDifference / hour);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  } else if (timeDifference < week) {
    const days = Math.floor(timeDifference / day);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  } else if (timeDifference < month) {
    const weeks = Math.floor(timeDifference / week);
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  } else if (timeDifference < year) {
    const months = Math.floor(timeDifference / month);
    return `${months} ${months === 1 ? "month" : "months"} ago`;
  } else {
    const years = Math.floor(timeDifference / year);
    return `${years} ${years === 1 ? "year" : "years"} ago`;
  }
};

export const getJoinedDate = (date: Date): string => {
  // Extract the month and year from the Date object
  const month = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();
  // Create the joined date string (e.g., "September 2023")
  const joinedDate = `${month} ${year}`;
  return joinedDate;
};

interface UrlQueryParams {
  params: string;
  Key: string;
  Value: string | null;
}

export const formUrlQuery = ({ params, Key, Value }: UrlQueryParams) => {
  const currentUrl = qs.parse(params);

  currentUrl[Key] = Value;
  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    {
      skipNull: true,
    }
  );
};

interface RemoveUrlQuery {
  params: string;
  Keys: string[];
}

export const removeKeysFromQuery = ({ params, Keys }: RemoveUrlQuery) => {
  const currentUrl = qs.parse(params);

  Keys.forEach((key) => {
    delete currentUrl[key];
  });
  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    {
      skipNull: true,
    }
  );
};

interface BadgeParam {
  criteria: {
    type: keyof typeof BADGE_CRITERIA;
    count: number;
  }[];
}
export const assignBadges = (params: BadgeParam) => {
  const badgeCounts: BadgeCounts = {
    GOLD: 0,
    SILVER: 0,
    BRONZE: 0,
  };
  const { criteria } = params;
  criteria.forEach((item) => {
    const { type, count } = item;
    const badgeLevels: any = BADGE_CRITERIA[type];

    Object.keys(badgeLevels).forEach((level: any) => {
      if (count >= badgeLevels[level]) {
        badgeCounts[level as keyof BadgeCounts] += 1;
      }
    });
  });
  return badgeCounts;
};

export function processJobTitle(title: string | undefined | null): string {
  if (title === undefined || title === null) {
    return "No Job Title";
  }
  // Split the title into words
  const words = title.split(" ");
  // Filter out undefined or null and other unwanted words
  const validWords = words.filter((word) => {
    return (
      word !== undefined &&
      word !== null &&
      word.toLowerCase() !== "undefined" &&
      word.toLowerCase() !== "null"
    );
  });
  // If no valid words are left, return the general title
  if (validWords.length === 0) {
    return "No Job Title";
  }
  // Join the valid words to create the processed title
  const processedTitle = validWords.join(" ");
  return processedTitle;
}

export function formatJobApiResponse(job: any): Job {
  return {
    id: job.job_id,
    employerName: job.employer_name,
    employerLogo: job.employer_logo,
    employerWebsite: job.employer_website,
    jobEmploymentType: job.job_employment_type,
    jobTitle: job.job_title,
    jobDescription: job.job_description,
    jobApplyLink: job.job_apply_link,
    jobCity: job.job_city,
    jobState: job.job_state,
    jobCountry: job.job_country,
  };
}

export function serialize<T>(obj: any): T {
  return JSON.parse(JSON.stringify(obj));
}

export function getUserBadge(reputation: number): string | undefined {
  if (reputation >= 5000) return "gold";
  if (reputation >= 1000) return "silver";
  if (reputation >= 500) return "bronze";
  return undefined;
}

export function formatDate(date: Date): string {
  return format(new Date(date), "MMM d, yyyy");
}

export async function generateSlug(title: string): Promise<string> {
  // Convert title to slug format
  const slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .trim();

  // Add a timestamp to ensure uniqueness
  const timestamp = Date.now().toString().slice(-4);
  return `${slug}-${timestamp}`;
}
