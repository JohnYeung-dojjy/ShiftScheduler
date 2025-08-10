export interface Schedule {
  [location: string]: {
    [day: string]: string;
  };
}

export interface Availability {
  [employee: string]: {
    [day: string]: boolean;
  };
}
