// Minimal JSON Schema checker for the keywords schema/run-record.schema.json uses.
// Zero dependencies by design; it refuses any keyword it does not implement rather than skipping it.
'use strict';
const fs = require('fs');
const path = require('path');

const SCHEMA = path.join(__dirname, '..', '..', 'schema', 'run-record.schema.json');
const KNOWN = new Set(['$schema', '$id', 'title', 'description', 'type', 'additionalProperties', 'required', 'properties', 'const', 'enum', 'format', 'pattern', 'minLength', 'items', 'minItems', 'maxItems', 'uniqueItems', 'minimum']);

function typeOf(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  if (typeof v === 'number') return Number.isInteger(v) ? 'integer' : 'number';
  return typeof v;
}

function check(schema, v, at, errs) {
  for (const k of Object.keys(schema)) if (!KNOWN.has(k)) throw new Error(`schema keyword "${k}" not implemented`);
  if (schema.type) {
    const types = [].concat(schema.type);
    const t = typeOf(v);
    if (!types.includes(t) && !(t === 'integer' && types.includes('number'))) { errs.push(`${at}: expected ${types.join('|')}, got ${t}`); return; }
  }
  if ('const' in schema && JSON.stringify(v) !== JSON.stringify(schema.const)) errs.push(`${at}: must equal ${JSON.stringify(schema.const)}`);
  if (schema.enum && !schema.enum.some((e) => JSON.stringify(e) === JSON.stringify(v))) errs.push(`${at}: not one of ${schema.enum.join(', ')}`);
  if (typeof v === 'string') {
    if (schema.pattern && !new RegExp(schema.pattern).test(v)) errs.push(`${at}: does not match ${schema.pattern}`);
    if (schema.minLength != null && v.length < schema.minLength) errs.push(`${at}: too short`);
    if (schema.format === 'date-time' && !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(Z|[+-]\d\d:\d\d)$/.test(v)) errs.push(`${at}: not a date-time`);
  }
  if (typeof v === 'number' && schema.minimum != null && v < schema.minimum) errs.push(`${at}: below ${schema.minimum}`);
  if (Array.isArray(v)) {
    if (schema.minItems != null && v.length < schema.minItems) errs.push(`${at}: fewer than ${schema.minItems} items`);
    if (schema.maxItems != null && v.length > schema.maxItems) errs.push(`${at}: more than ${schema.maxItems} items`);
    if (schema.uniqueItems && new Set(v.map((x) => JSON.stringify(x))).size !== v.length) errs.push(`${at}: items not unique`);
    if (schema.items) v.forEach((x, i) => check(schema.items, x, `${at}[${i}]`, errs));
  }
  if (typeOf(v) === 'object') {
    for (const r of schema.required || []) if (!(r in v)) errs.push(`${at}: missing ${r}`);
    const props = schema.properties || {};
    for (const [k, x] of Object.entries(v)) {
      if (props[k]) check(props[k], x, `${at}.${k}`, errs);
      else if (schema.additionalProperties === false) errs.push(`${at}: unexpected property ${k}`);
    }
  }
}

function validate(record, schemaFile = SCHEMA) {
  const errs = [];
  check(JSON.parse(fs.readFileSync(schemaFile, 'utf8')), record, '$', errs);
  return errs;
}

module.exports = { validate };
