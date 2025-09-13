// Handicap calculations
'use strict';

export function computeCH(hi, slope, rating, par) {
    if (hi == null || slope == null || rating == null || par == null) return null;
    return (slope / 113) * hi + (rating - par);
}

export function messageForCH(player, tee) {
  let msg = `${player.name} from the ${tee.tee_name} tees\n`;
  msg += `CH\t= ${tee.slope_rating} / 113 x ${player.hi} + (${tee.course_rating} - ${tee.par_total}) \n`;
  msg += `\t= ${computeCH(player.hi, tee.slope_rating, tee.course_rating, tee.par_total).toFixed(4)}\n`;
  return msg;
}

export function calculatePH(fmt, rows) {

  if (fmt === 'General play') {
    for (const r of rows) {
      if (!r.ch) {
        r.ph = null;
        continue;
      }

      r.ph = r.ch;

      let msg = r.msg + `PH\t= ${r.ch.toFixed(4)}\n`;
      msg += `\t= ${Math.round(r.ph)}`;
      r.msg = msg;
            
    }
    return;
  }
  if (fmt === 'Individual') {
    for (const r of rows) {
      if (!r.ch) {
        r.ph = null;
        continue;
      }
      r.ph = 0.95 * r.ch;

      let msg = r.msg + `PH\t= 95% of ${r.ch.toFixed(4)}\n`;
      msg += `\t= ${r.ph.toFixed(4)}\n`;
      msg += `\t= ${Math.round(r.ph)}`;
      r.msg = msg;
    }
    return;
  }
  if (fmt === '4B better-ball') {
    for (const r of rows) {
      if (!r.ch) {
        r.ph = null;
        continue;
      }
      r.ph = 0.85 * r.ch;

      let msg = r.msg + `PH\t= 85% of ${r.ch.toFixed(4)}\n`;
      msg += `\t= ${r.ph.toFixed(4)}\n`;
      msg += `\t= ${Math.round(r.ph)}`;
      r.msg = msg;
    }
    return;
  }
  if (fmt === 'Foursomes') {
    // Pairs: (0,1), (2,3)
    for (let i = 0; i < rows.length; i += 2) {
      const a = rows[i];
      const b = rows[i + 1];
      if (a.ch == null || b.ch == null) {
        a.ph = null; 
        b.ph = null;
        continue;
      }
      const th = 0.5 * (a.ch + b.ch);
      a.ph = th;
      b.ph = th;

      let msg = a.msg + `TH\t= 50% of (${a.ch.toFixed(4)} + ${b.ch.toFixed(4)})\n`;
      msg += `\t= ${th.toFixed(4)}\n`;
      msg += `\t= ${Math.round(th)}`;
      a.msg = msg;
      b.msg = msg;
    }
    return;
  }
  if (fmt === 'Greensomes') {
    // Pairs: (0,1), (2,3)
    for (let i = 0; i < rows.length; i += 2) {
      const a = rows[i];
      const b = rows[i + 1];
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

      let msg = a.msg + `TH\t= 60% of ${lo.toFixed(4)} + 40% of ${hi.toFixed(4)}\n`;
      msg += `\t= ${th.toFixed(4)}\n`;
      msg += `\t= ${Math.round(th)}`;
      a.msg = msg;
      b.msg = msg;
    }
    return;
  }
  if (fmt === '2B match-play') {
    // Pairs: (0,1), (2,3)
    for (let i = 0; i < rows.length; i += 2) {
      const a = rows[i];
      const b = rows[i + 1];
      if (a.ch == null || b.ch == null) {
        a.ph = null; 
        b.ph = null;
        continue;
      }

      if (Math.abs(a.ch - b.ch) < 1e-4) {
        a.ph = 0;
        b.ph = 0;
        let msg = a.msg + `PH\t= 0 (equal CH)`;
        a.msg = msg;
        msg = b.msg + `PH\t= 0 (equal CH)`;
        b.msg = msg;
      }
      else if (a.ch < b.ch) {
        a.ph = 0;
        let msg = a.msg + `PH\t= 0 (lowest CH)`;
        a.msg = msg;

        b.ph = b.ch - a.ch;
        msg = b.msg + `PH\t= ${b.ch.toFixed(4)} - ${a.ch.toFixed(4)}\n`
        msg += `\t= ${b.ph.toFixed(4)}\n`;
        msg += `\t= ${Math.round(b.ph)}`;
        b.msg = msg;
      } else { // a.ch > b.ch
        b.ph = 0;
        let msg = b.msg + `PH\t= 0 (lowest CH)`;
        b.msg = msg;

        a.ph = a.ch - b.ch;
        msg = a.msg + `PH\t= ${a.ch.toFixed(4)} - ${b.ch.toFixed(4)}\n`
        msg += `\t= ${a.ph.toFixed(4)}\n`;
        msg += `\t= ${Math.round(a.ph)}`;
        a.msg = msg;
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
      if (r.ch == null) {
        r.ph = null; 
        return;
      }

      if (Math.abs(r.ch - minCH) < 1e-4) { 
        r.ph = 0; 
        let msg = r.msg + `PH\t= 0 (lowest CH)`;
        r.msg = msg;
      }
      else { 
        r.ph = 0.9 * (r.ch - minCH);
        let msg = r.msg + `PH\t= 90% of (${r.ch.toFixed(4)} - ${minCH.toFixed(4)})\n`;
        msg += `\t= ${r.ph.toFixed(4)}\n`;
        msg += `\t= ${Math.round(r.ph)}`;
        r.msg = msg;
      }
    });
    return;
  }
  if (fmt === 'Foursomes match-play') {
    // Lowest team gets 0, others team gets 50% of the difference between the sum of course handicaps
    const valid = rows.filter(r => r.ch != null);
    if (valid.length < 4) { rows.forEach(r => r.ph = null); return; }

    const t1 = rows[0].ch + rows[1].ch;
    const t2 = rows[2].ch + rows[3].ch;
    
    if (Math.abs(t1 - t2) < 1e-4) {
      rows[0].ph = 0;
      rows[1].ph = 0;
      rows[2].ph = 0;
      rows[3].ph = 0;

      let msg = `TH\t= 0 (equal TH)`;
      rows[0].msg = rows[0].msg + msg;
      rows[1].msg = rows[1].msg + msg;
      rows[2].msg = rows[2].msg + msg;
      rows[3].msg = rows[3].msg + msg;
    }
    else if (t1 < t2) {
      rows[0].ph = 0;
      rows[1].ph = 0;
      rows[2].ph = 0.5 * (t2 - t1);
      rows[3].ph = 0.5 * (t2 - t1);

      let msg = `TH\t= 0 (lowest sum of CH)`;
      rows[0].msg = rows[0].msg + msg;
      rows[1].msg = rows[1].msg + msg;

      msg = `TH\t= 50% of ( (${rows[2].ch.toFixed(4)} + ${rows[3].ch.toFixed(4)}) - (${rows[0].ch.toFixed(4)} + ${rows[1].ch.toFixed(4)}))\n`;
      msg += `\t= 50% of (${t2.toFixed(4)} - ${t1.toFixed(4)})\n`;
      msg += `\t= 50% of ${(t2 - t1).toFixed(4)}\n`;
      msg += `\t= ${rows[2].ph.toFixed(4)}\n`;
      msg += `\t= ${Math.round(rows[2].ph)}`;
      rows[2].msg = rows[2].msg + msg;
      rows[3].msg = rows[3].msg + msg;
    } else { // t1 > t2
      rows[0].ph = 0.5 * (t1 - t2);
      rows[1].ph = 0.5 * (t1 - t2);
      rows[2].ph = 0;
      rows[3].ph = 0;

      let msg = `TH\t= 50% of ( (${rows[0].ch.toFixed(4)} + ${rows[1].ch.toFixed(4)}) - (${rows[2].ch.toFixed(4)} + ${rows[3].ch.toFixed(4)}))\n`;
      msg += `\t= 50% of (${t1.toFixed(4)} - ${t2.toFixed(4)})\n`;
      msg += `\t= 50% of ${(t1 - t2).toFixed(4)}\n`;
      msg += `\t= ${rows[0].ph.toFixed(4)}\n`;
      msg += `\t= ${Math.round(rows[0].ph)}`;
      rows[0].msg = rows[0].msg + msg;
      rows[1].msg = rows[1].msg + msg;

      msg = `TH\t= 0 (lowest sum of CH)`;
      rows[2].msg = rows[2].msg + msg;
      rows[3].msg = rows[3].msg + msg;
    }
    return;
  }
}