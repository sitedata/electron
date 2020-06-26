import { expect } from 'chai';
import * as path from 'path';
import { BrowserWindow, ipcMain } from 'electron/main';
import { closeAllWindows } from './window-helpers';
import { emittedOnce } from './events-helpers';

describe('asar package', () => {
  const fixtures = path.join(__dirname, '..', 'spec', 'fixtures');
  const asarDir = path.join(fixtures, 'test.asar');

  afterEach(closeAllWindows);

  describe('asar protocol', () => {
    it('sets __dirname correctly', async function () {
      after(function () {
        ipcMain.removeAllListeners('dirname');
      });

      const w = new BrowserWindow({
        show: false,
        width: 400,
        height: 400,
        webPreferences: {
          nodeIntegration: true
        }
      });
      const p = path.resolve(asarDir, 'web.asar', 'index.html');
      const dirnameEvent = emittedOnce(ipcMain, 'dirname');
      w.loadFile(p);
      const [, dirname] = await dirnameEvent;
      expect(dirname).to.equal(path.dirname(p));
    });

    it('loads script tag in html', async function () {
      after(function () {
        ipcMain.removeAllListeners('ping');
      });

      const w = new BrowserWindow({
        show: false,
        width: 400,
        height: 400,
        webPreferences: {
          nodeIntegration: true
        }
      });
      const p = path.resolve(asarDir, 'script.asar', 'index.html');
      const ping = emittedOnce(ipcMain, 'ping');
      w.loadFile(p);
      const [, message] = await ping;
      expect(message).to.equal('pong');
    });

    it('loads video tag in html', function (done) {
      this.timeout(60000);

      after(function () {
        ipcMain.removeAllListeners('asar-video');
      });

      const w = new BrowserWindow({
        show: false,
        width: 400,
        height: 400,
        webPreferences: {
          nodeIntegration: true
        }
      });
      const p = path.resolve(asarDir, 'video.asar', 'index.html');
      w.loadFile(p);
      ipcMain.on('asar-video', function (event, message, error) {
        try {
          if (message === 'ended') {
            expect(error).to.be.null();
            done();
          } else if (message === 'error') {
            done(error);
          }
        } catch (e) {
          done(e);
        }
      });
    });
  });
});
