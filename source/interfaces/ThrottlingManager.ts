export default interface ThrottlingManager {
  getAll: Function;
  getCurrent: Function;
  getCurrentDelay: Function;
  toggleCurrent: Function;
}
