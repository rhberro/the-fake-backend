import ProxyManager from '../source/interfaces/ProxyManager';
import ProxyProperties from '../source/interfaces/ProxyProperties';
import { createProxyManager } from '../source/proxy';

describe('source/proxy.ts', () => {
  let proxyManager: ProxyManager;

  const proxies: Array<ProxyProperties> = [
    { name: 'First', host: 'firsthost.com', },
    { name: 'Second', host: 'secondhost.com' },
    { name: 'Third', host: 'thirdhost.com' },
  ];

  beforeEach(() => {
    proxyManager = createProxyManager(proxies);
  });

  describe('createProxyManager', () => {
    it('returns an instance of ProxyManager', () => {
      expect(proxyManager).toMatchObject<ProxyManager>(proxyManager);
    });
  });

  describe('getAll', () => {
    it('returns the proxies with an additional proxy property', () => {
      expect(proxyManager.getAll()).toEqual([
        { name: 'First', host: 'firsthost.com', proxy: 'proxy' },
        { name: 'Second', host: 'secondhost.com', proxy: 'proxy' },
        { name: 'Third', host: 'thirdhost.com', proxy: 'proxy' },
      ]);
    });
  });

  describe('getCurrent', () => {
    it('returns null as the initial proxy', () => {
      expect(proxyManager.getCurrent()).toEqual(null);
    });

    it('returns the first proxy after a toggle', () => {
      proxyManager.toggleCurrent();
      expect(proxyManager.getCurrent()).toEqual({
        name: 'First',
        host: 'firsthost.com',
        proxy: 'proxy',
      });
    });
  });

  describe('toggleCurrent', () => {
    it('returns null as the initial proxy', () => {
      expect(proxyManager.getCurrent()).toEqual(null);
    });

    it('returns null after toggling from last proxy', () => {
      proxyManager.toggleCurrent();
      proxyManager.toggleCurrent();
      proxyManager.toggleCurrent();
      proxyManager.toggleCurrent()
      expect(proxyManager.getCurrent()).toEqual(null);
    });
  });
});
