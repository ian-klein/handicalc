// Handicap calculations
'use strict';

export function computeCH(hi, slope, rating, par) {
    if (hi == null || slope == null || rating == null || par == null) return null;
    return (slope / 113) * hi + (rating - par);
}

export function calculatePH(fmt, rows) {

if (fmt === 'General play') {
    rows.forEach(r => r.ph = r.ch);
    return;
  }
  if (fmt === 'Individual') {
    rows.forEach(r => r.ph = r.ch == null ? null : 0.95 * r.ch);
    return;
  }
  if (fmt === '4B better-ball') {
    rows.forEach(r => r.ph = r.ch == null ? null : 0.85 * r.ch);
    return;
  }
  if (fmt === 'Foursomes') {
    // Pairs: (0,1), (2,3)
    for (let i = 0; i < rows.length; i += 2) {
      const a = rows[i];
      const b = rows[i + 1];
      if (!a || !b) { // odd player -> blank
        a.ph = null;
        b.ph = null;
        continue;
      }
      if (a.ch == null || b.ch == null) {
        a.ph = null; 
        b.ph = null;
        continue;
      }
      const th = 0.5 * (a.ch + b.ch);
      a.ph = th;
      b.ph = th;
    }
    return;
  }
  if (fmt === 'Greensomes') {
    // Pairs: (0,1), (2,3)
    for (let i = 0; i < rows.length; i += 2) {
      const a = rows[i];
      const b = rows[i + 1];
      if (!a || !b) { // odd player -> blank
        a.ph = null;
        b.ph = null;
        continue;
      }
      if (a.ch == null || b.ch == null) {
        a.ph = null; 
        b.ph = null;
        continue;
      }
      const lo = Math.min(a.ch, b.ch);
      const hi = Math.max(a.ch, b.ch);
      const th = 0.6 * lo + 0.4 * hi;
      a.ph = th;
      b.ph = th;
    }
    return;
  }
  if (fmt === '2B match-play') {
    // Pairs: (0,1), (2,3)
    for (let i = 0; i < rows.length; i += 2) {
      const a = rows[i];
      const b = rows[i + 1];
      if (!a || !b) { a.ph = null; b.ph = null; continue; }
      if (a.ch == null || b.ch == null) { a.ph = null; b.ph = null; continue; }
      if (a.ch <= b.ch) {
        a.ph = 0;
        b.ph = b.ch - a.ch;
      } else {
        b.ph = 0;
        a.ph = a.ch - b.ch;
      }
    }
    return;
  }
  if (fmt === '4B match-play') {
    // Consider all rows with CH; lowest gets 0, others get 0.9 * (CH - min)
    const valid = rows.filter(r => r.ch != null);
    if (valid.length === 0) { rows.forEach(r => r.ph = null); return; }
    const minCH = Math.min(...valid.map(r => r.ch));
    rows.forEach(r => {
      if (r.ch == null) { r.ph = null; return; }
      if (Math.abs(r.ch - minCH) < 1e-9) { r.ph = 0; }
      else { r.ph = 0.9 * (r.ch - minCH); }
    });
    return;
  }
  if (fmt === 'Foursomes match-play') {
    // Lowest team gets 0, others team gets 50% of the difference between the sum of course handicaps
    const valid = rows.filter(r => r.ch != null);
    if (valid.length < 4) { rows.forEach(r => r.ph = null); return; }
    const t1 = rows[0].ch + rows[1].ch;
    const t2 = rows[2].ch + rows[3].ch;
    
    if (t1 < t2) {
      rows[0].ph = 0;
      rows[1].ph = 0;
      rows[2].ph = 0.5 * (t2 - t1);
      rows[3].ph = 0.5 * (t2 - t1);
    } else if (t1 > t2) {
      rows[0].ph = 0.5 * (t1 - t2);
      rows[1].ph = 0.5 * (t1 - t2);
      rows[2].ph = 0;
      rows[3].ph = 0;
    }
    else {
      rows.forEach(r => r.ph = 0);
    }
    return;
  }
}