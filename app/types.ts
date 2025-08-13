export interface Schedule {
  [shift: string]: {
    [day: string]: string;
  };
}

export interface Availability {
  [employee: string]: {
    [shift: string]: { [day: string]: boolean };
  };
}
