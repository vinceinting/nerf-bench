'use strict';
// Content checks for the methodology page, shared by its tests and prd-cells R-18, R-20, R-21.
const text = (html) => html.replace(/<[^>]+>/g, ' ').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/\s+/g, ' ');

const STATEMENTS = {
  'content-recognition limit (D-35)': /special handling based on a lab recognizing the tasks' content cannot be ruled out by any outside benchmark/i,
  'contributor can read current set (A1)': /a determined contributor can read the current task set/i,
  'signature prevents faked results (A1)': /the signature still prevents faked results/i,
  'deviation: commands auto-approved': /commands auto-approved/,
  'deviation: web access blocked': /web access blocked/,
  'subscription path has no cost figure': /subscription path[^.]*carry no cost figure/i,
  'statistical rule by reference': /stats\/RULE\.md/,
  'frozen schedule label': /frozen[\s\S]*build's choice, an operational default \(Amendment 14\)/i,
};

function checkPage(html, settings) {
  const t = text(html);
  const failures = [];
  for (const [name, re] of Object.entries(STATEMENTS)) if (!re.test(t)) failures.push(`missing: ${name}`);
  const m = html.match(/id="rotation-interval-days">(\d+)</);
  if (!m) failures.push('rotation interval value not shown');
  else if (Number(m[1]) !== settings.rotation.interval_days) failures.push(`rotation interval shown ${m[1]} but setting is ${settings.rotation.interval_days}`);
  const lab = html.match(/id="rotation-label">([^<]*)</);
  if (!lab || !/build's choice/i.test(text(lab[1]))) failures.push('rotation interval not labelled as the build\'s choice');
  if (new RegExp('[' + String.fromCharCode(0x2013, 0x2014) + ']').test(html)) failures.push('page contains an en or em dash');
  return { failures };
}

module.exports = { checkPage, STATEMENTS };
