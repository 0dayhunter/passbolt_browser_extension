import './src/all/tests/matchers/extendExpect';
import MockStorage from './src/all/background_page/sdk/storage.test.mock';
import {OrganizationSettingsModel} from "./src/all/background_page/model/organizationSettings/organizationSettingsModel";
import Config from "./src/all/background_page/model/config";

global.chrome = {};
global.openpgp = require('openpgp');
global.Validator = require('validator');
global.Validator.isUtf8 = require('./src/all/background_page/utils/validatorRules').isUtf8;
global.TextEncoder = require('text-encoding-utf-8').TextEncoder;
global.TextDecoder = require('text-encoding-utf-8').TextDecoder;
global.setImmediate = typeof global.setImmediate === "function" ? global.setImmediate : () => {};
global.stripslashes = require('locutus/php/strings/stripslashes');
global.urldecode = require('locutus/php/url/urldecode');
global.jsSHA = require('jssha');
global.XRegExp = require('xregexp');

beforeEach(() => {
  // Before each test, reinitialise the local storages
  global.browser = Object.assign({}, {
    storage: new MockStorage(),
    runtime: {
      getManifest: jest.fn(() => ({
        version: "v3.6.0"
      }))
    }
  }); // Required by local storage
  global.chrome = global.browser;
  global.storage = require('./src/all/background_page/sdk/storage').storage
  // Flush caches
  OrganizationSettingsModel.flushCache();
  Config.flush()
});
