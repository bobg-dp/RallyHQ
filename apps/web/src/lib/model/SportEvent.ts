export interface SportEvent {
  title: string;
  short: string;
  organizer: string;
  date: string;
  registrationDate: string;
  category: string;
  image: string;
  places: { all: number; occupied: number };
}
