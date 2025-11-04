import { DB } from './model.js';
export const api = {
  init:   () => DB.ensureSeed(),
  list:   () => DB.all(),
  get:    (id) => DB.byId(id),
  upsert: (s) => DB.upsert(s),
  remove: (id) => DB.remove(id),
  fmtNumber: DB.fmtNumber,
  fmtMoney:  DB.fmtMoney
};
