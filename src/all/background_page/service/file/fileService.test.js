/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.9.0
 */

import FileService from "./fileService";
import {Worker} from "../../model/worker";

// Reset the modules before each test.
beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

describe("FileService", () => {
  describe("FileService::saveFile", () => {
    it("save file with chrome MV2", async() => {
      expect.assertions(3);
      // data mocked
      chrome.downloads = {
        download: jest.fn(() => Promise.resolve())
      };
      global.URL.createObjectURL = jest.fn();
      global.URL.revokeObjectURL = jest.fn();
      // mock function
      jest.spyOn(chrome.runtime, 'getManifest').mockImplementationOnce(() => ({manifest_version: 2}));
      // process
      await FileService.saveFile("filename", "Text", null, 1);
      // expectation
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
      expect(chrome.downloads.download).toHaveBeenCalledWith({filename: "filename", url: undefined});
    });

    it("save file with chrome MV3", async() => {
      expect.assertions(1);
      // data mocked
      chrome.downloads = {
        download: jest.fn()
      };
      // mock function
      jest.spyOn(chrome.runtime, 'getManifest').mockImplementationOnce(() => ({manifest_version: 3}));
      // process
      await FileService.saveFile("filename", "Text", null, 1);
      // expectation
      expect(chrome.downloads.download).toHaveBeenCalledWith({filename: "filename", url: "data:text/plain;base64,VGV4dA=="});
    });

    it("save file with firefox", async() => {
      expect.assertions(1);
      // data mocked
      const worker = {
        port: {
          emit: jest.fn()
        }
      };
      chrome.downloads = undefined;
      // function mocked
      jest.spyOn(Worker, "get").mockImplementationOnce(() => worker);
      // process
      await FileService.saveFile("filename", "Text", null, 1);
      // expectation
      expect(worker.port.emit).toHaveBeenCalledWith("passbolt.file-iframe.download", "filename", "data:text/plain;base64,VGV4dA==");
    });
  });
});
