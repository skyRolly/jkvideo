import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { VideoItem, Comment, PlayUrlResponse, QRCodeInfo } from './types';

const BASE = 'https://api.bilibili.com';
const PASSPORT = 'https://passport.bilibili.com';

const api = axios.create({
  baseURL: BASE,
  timeout: 10000,
  headers: {
    'Referer': 'https://www.bilibili.com',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 Chrome/91.0',
  },
});

api.interceptors.request.use(async (config) => {
  const sessdata = await AsyncStorage.getItem('SESSDATA');
  if (sessdata) {
    config.headers['Cookie'] = `SESSDATA=${sessdata}`;
  }
  return config;
});

export async function getPopularVideos(pn = 1): Promise<VideoItem[]> {
  const res = await api.get('/x/web-interface/popular', { params: { pn, ps: 20 } });
  return res.data.data.list as VideoItem[];
}

export async function getVideoDetail(bvid: string): Promise<VideoItem> {
  const res = await api.get('/x/web-interface/view', { params: { bvid } });
  return res.data.data as VideoItem;
}

export async function getPlayUrl(bvid: string, cid: number): Promise<PlayUrlResponse> {
  const res = await api.get('/x/player/playurl', {
    params: { bvid, cid, qn: 64, fnval: 1 },
  });
  return res.data.data as PlayUrlResponse;
}

export async function getComments(aid: number, pn = 1): Promise<Comment[]> {
  const res = await api.get('/x/v2/reply', {
    params: { oid: aid, type: 1, pn, ps: 20, sort: 2 },
  });
  return (res.data.data?.replies ?? []) as Comment[];
}

export async function generateQRCode(): Promise<QRCodeInfo> {
  const res = await axios.get(`${PASSPORT}/x/passport-login/web/qrcode/generate`, {
    headers: { 'Referer': 'https://www.bilibili.com' },
  });
  return res.data.data as QRCodeInfo;
}

export async function pollQRCode(qrcode_key: string): Promise<{ code: number; cookie?: string }> {
  const res = await axios.get(`${PASSPORT}/x/passport-login/web/qrcode/poll`, {
    params: { qrcode_key },
    headers: { 'Referer': 'https://www.bilibili.com' },
  });
  const { code } = res.data.data;
  let cookie: string | undefined;
  if (code === 0) {
    const setCookie = res.headers['set-cookie'];
    const match = setCookie?.find((c: string) => c.includes('SESSDATA'));
    if (match) {
      cookie = match.split(';')[0].replace('SESSDATA=', '');
    }
  }
  return { code, cookie };
}
