import { Organization, OrganizationName } from "../types/Organization";

export const getUserFromLocalStorage = () => {
  const userJSON = localStorage.getItem("user");
  if (userJSON) {
    try {
      return JSON.parse(userJSON);
    } catch (error) {
      console.error("Error parsing user JSON:", error);
      return null;
    }
  }
  return null;
};

export const getTimeIntervalForOrganization = (): number | null => {
  const organizationId = localStorage.getItem("organization");
  const userJSON = localStorage.getItem("user");
  if (userJSON) {
    const user = JSON.parse(userJSON);
    const organization: Organization | undefined = user.organizations.find((org: Organization) => org.id === parseInt(organizationId));
    if (organization) {
      return organization.screenshot_interval;
    } else {
      console.error("Organization not found!");
      return null;
    }
  } else {
    console.error("User data not found in localStorage!");
    return null;
  }
}

export const getTimeZoneForOrganization = (): string | null => {
  const organizationId = localStorage.getItem("organization");
  const userJSON = localStorage.getItem("user");
  if (userJSON) {
    const user = JSON.parse(userJSON);
    const organization: Organization | undefined = user.organizations.find((org: Organization) => org.id === parseInt(organizationId));
    if (organization) {
      return organization.timezone;
    } else {
      console.error("Organization not found!");
      return null;
    }
  } else {
    console.error("User data not found in localStorage!");
    return null;
  }
}

export const getNameForOrganization = (): OrganizationName | null => {
  const organizationId = localStorage.getItem("organization");
  const userJSON = localStorage.getItem("user");
  if (userJSON) {
    const user = JSON.parse(userJSON);
    const organization: Organization | undefined = user.organizations.find((org: Organization) => org.id === parseInt(organizationId));
    if (organization) {
      return { name: organization.name, logo: organization.logo };
    } else {
      console.error("Organization not found!");
      return null;
    }
  } else {
    console.error("User data not found in localStorage!");
    return null;
  }
}
