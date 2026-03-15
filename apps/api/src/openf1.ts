import axios from 'axios';

const OPENF1_BASE = process.env.OPENF1_BASE || 'https://api.openf1.org/v1';

export const openf1 = axios.create({
  baseURL: OPENF1_BASE,
  timeout: 10000,
});

export async function getMeetings(year: number) {
  const { data } = await openf1.get(`/meetings?year=${year}`);
  return data;
}

export async function getSessions(meetingKey: number) {
  const { data } = await openf1.get(`/sessions?meeting_key=${meetingKey}`);
  return data;
}

export async function getSessionResult(sessionKey: number) {
  const { data } = await openf1.get(`/session_result?session_key=${sessionKey}`);
  return data;
}

export async function getDrivers(sessionKey: number) {
  const { data } = await openf1.get(`/drivers?session_key=${sessionKey}`);
  return data;
}

export async function getStartingGrid(sessionKey: number) {
  const { data } = await openf1.get(`/starting_grid?session_key=${sessionKey}`);
  return data;
}
