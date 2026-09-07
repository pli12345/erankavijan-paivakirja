export type Profile = {
  id: string;
  display_name: string | null;
  hunting_club: string | null;
  created_at: string;
};

export type Trip = {
  id: string;
  user_id: string;
  title: string | null;
  area: string | null;
  started_at: string;
  ended_at: string | null;
  latitude: number | null;
  longitude: number | null;
  weather_temp: number | null;
  weather_code: number | null;
  wind_speed: number | null;
  companions: string[] | null;
  notes: string | null;
  created_at: string;
};

export type AgeClass = 'aikuinen' | 'nuori' | 'vasa' | 'tuntematon';
export type Sex = 'uros' | 'naaras' | 'tuntematon';

export type Catch = {
  id: string;
  user_id: string;
  trip_id: string | null;
  species: string;
  sex: Sex | null;
  age_class: AgeClass | null;
  weight_kg: number | null;
  antler_points: number | null;
  shot_at: string;
  latitude: number | null;
  longitude: number | null;
  photo_url: string | null;
  notes: string | null;
  created_at: string;
};

export type Observation = {
  id: string;
  user_id: string;
  trip_id: string | null;
  species: string;
  count: number;
  seen_at: string;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  created_at: string;
};

export type TripWithCounts = Trip & {
  catch_count: number;
  observation_count: number;
};
