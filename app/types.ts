export interface Schedule {
  [shift: string]: {
    [day: string]: string;
  };
}

export interface Availability {
  [employee: string]: {
    [day: string]: boolean;
  };
}
