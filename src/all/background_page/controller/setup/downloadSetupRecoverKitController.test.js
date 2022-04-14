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
 * @since         3.6.0
 */

import {DownloadSetupRecoveryKitController} from "./downloadSetupRecoverKitController";
import {
  startAccountSetupDto,
  withUserKeyAccountSetupDto
} from "../../model/entity/account/accountSetupEntity.test.data";
import {AccountSetupEntity} from "../../model/entity/account/accountSetupEntity";

const FileController = require("../../controller/fileController");

jest.mock("../../controller/fileController");

describe("DownloadSetupRecoveryKitController", () => {
  describe("DownloadSetupRecoveryKitController::exec", () => {
    it("Should throw an exception if the account does have a defined user armored private key.", async() => {
      const account = new AccountSetupEntity(startAccountSetupDto());
      const controller = new DownloadSetupRecoveryKitController(null, null, account);

      expect.assertions(1);
      const promise = controller.exec();
      await expect(promise).rejects.toThrowError("An account user private armored key is required.");
    });

    it("Should trigger the recovery kit download.", async() => {
      FileController.saveFile = jest.fn();
      const mockedWorker = {
        tab: {
          id: "id"
        }
      };

      const account = new AccountSetupEntity(withUserKeyAccountSetupDto());
      const controller = new DownloadSetupRecoveryKitController(mockedWorker, null, account);

      expect.assertions(1);
      await controller.exec();
      expect(FileController.saveFile).toHaveBeenCalledWith(
        "passbolt-recovery-kit.asc",
        account.userPrivateArmoredKey,
        "text/plain",
        mockedWorker.tab.id
      );
    });
  });
});
