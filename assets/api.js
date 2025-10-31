// Thin API layer in case you swap to a real backend later
import { StateDB } from './model.js';
export const api = {
  init: () => StateDB.ensureSeed(),
  list: () => StateDB.getAll(),
  get: (id) => StateDB.findById(id),
  upsert: (s) => StateDB.upsert(s),
  remove: (id) => StateDB.removeById(id),
  fmtNumber: StateDB.fmtNumber,
  fmtMoney:  StateDB.fmtMoney
};
