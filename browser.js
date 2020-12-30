import DbUtils from './utils.js'; // eslint-disable-line import/extensions

if (!window) throw new Error('Running in the wrong environment (Did not find window)');

class Db {
  constructor(path, settings = {}) {
    settings.soc = settings.soc ?? settings.saveOnChange ?? true;
    this.saveOnChange = settings.soc;
    this.saveSpace = settings.saveSpace;
    if (!settings.exportThis && !settings.soc) throw new Error('Cannot have saveOnChange disabled without exportThis enabled');

    if (!path) throw new Error('No path provided');
    if (typeof path !== 'string') throw new Error('Provided path is not a string');
    if ((path.includes('/') || path.includes('.')) && !settings.ack?.noFSPath) console.warn('You seem to want to use a file system.\nSadly, to keep this as lightweight as possible, we will not be using any filesystem library based on localstorage but we will however use the localstorage.\nPlease change your path or acknowledge this issue (by setting `settings.ack.noFSPath`) to dismiss this warning.'); // eslint-disable-line no-console
    this.path = path.toLowerCase();

    if (!localStorage.getItem(this.path) || localStorage.getItem(this.path) === '') localStorage.setItem(this.path, JSON.stringify(settings.defaultValue) ?? '{}', (e) => { if (e) throw e; });

    this.readOnlyValue = JSON.parse(localStorage.getItem(path));
    if (!settings.exportThis || settings.exportThis == null) return this.value;
  }

  /**
   * async Updates the file/db from this.readOnlyValue
   * @returns {any}  - The json file
   */
  update() {
    localStorage.setItem(this.path, JSON.stringify(this.readOnlyValue, null, this.saveSpace ? null : '\t'));
    return this.readOnlyValue;
  }

  /**
   * @type {any}
   * @returns {true}
   */
  set value(setTo) {
    this.readOnlyValue = setTo;
    if (this.saveOnChange) {
      this.update();
    }
    return true;
  }

  /**
   * @type {any}
   * @returns {true}
   */
  get value() {
    return DbUtils.genProxy(this.readOnlyValue, this.saveOnChange, this.update);
  }
}

export { Db, DbUtils };
