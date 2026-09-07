import { supabase } from './supabase';
import type { Catch, Observation, Profile, Trip } from './types';

async function userId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error('Et ole kirjautunut sisään');
  return data.user.id;
}

/* ---------- Profile ---------- */

export async function getProfile(): Promise<Profile | null> {
  const id = await userId();
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateProfile(patch: Partial<Pick<Profile, 'display_name' | 'hunting_club'>>) {
  const id = await userId();
  const { error } = await supabase.from('profiles').update(patch).eq('id', id);
  if (error) throw error;
}

/* ---------- Trips ---------- */

export async function listTrips(): Promise<Trip[]> {
  const { data, error } = await supabase.from('trips').select('*').order('started_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getTrip(id: string): Promise<Trip | null> {
  const { data, error } = await supabase.from('trips').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export type TripInput = Omit<Trip, 'id' | 'user_id' | 'created_at'>;

export async function createTrip(input: TripInput): Promise<Trip> {
  const user_id = await userId();
  const { data, error } = await supabase.from('trips').insert({ ...input, user_id }).select().single();
  if (error) throw error;
  return data;
}

export async function updateTrip(id: string, patch: Partial<TripInput>) {
  const { error } = await supabase.from('trips').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteTrip(id: string) {
  const { error } = await supabase.from('trips').delete().eq('id', id);
  if (error) throw error;
}

/* ---------- Catches ---------- */

export async function listCatches(tripId?: string): Promise<Catch[]> {
  let q = supabase.from('catches').select('*').order('shot_at', { ascending: false });
  if (tripId) q = q.eq('trip_id', tripId);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getCatch(id: string): Promise<Catch | null> {
  const { data, error } = await supabase.from('catches').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export type CatchInput = Omit<Catch, 'id' | 'user_id' | 'created_at'>;

export async function createCatch(input: CatchInput): Promise<Catch> {
  const user_id = await userId();
  const { data, error } = await supabase.from('catches').insert({ ...input, user_id }).select().single();
  if (error) throw error;
  return data;
}

export async function updateCatch(id: string, patch: Partial<CatchInput>) {
  const { error } = await supabase.from('catches').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteCatch(id: string) {
  const { error } = await supabase.from('catches').delete().eq('id', id);
  if (error) throw error;
}

/* ---------- Observations ---------- */

export async function listObservations(tripId?: string): Promise<Observation[]> {
  let q = supabase.from('observations').select('*').order('seen_at', { ascending: false });
  if (tripId) q = q.eq('trip_id', tripId);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export type ObservationInput = Omit<Observation, 'id' | 'user_id' | 'created_at'>;

export async function createObservation(input: ObservationInput): Promise<Observation> {
  const user_id = await userId();
  const { data, error } = await supabase.from('observations').insert({ ...input, user_id }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteObservation(id: string) {
  const { error } = await supabase.from('observations').delete().eq('id', id);
  if (error) throw error;
}

/* ---------- Photos ---------- */

export async function uploadCatchPhoto(localUri: string): Promise<string> {
  const id = await userId();
  const ext = localUri.split('.').pop()?.split('?')[0] ?? 'jpg';
  const path = `${id}/${Date.now()}.${ext}`;
  const res = await fetch(localUri);
  const bytes = await res.arrayBuffer();
  const { error } = await supabase.storage
    .from('catch-photos')
    .upload(path, bytes, { contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}` });
  if (error) throw error;
  const { data } = supabase.storage.from('catch-photos').getPublicUrl(path);
  return data.publicUrl;
}
