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
 * @since         3.7.3
 */
import SsoConfigurationService from "../../service/api/sso/ssoConfigurationService";
import SsoConfigurationEntity from "../entity/sso/ssoConfigurationEntity";

/**
 * Model related to the SSO configuration
 */
class SsoConfigurationModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.ssoConfigurationService = new SsoConfigurationService(apiClientOptions);
  }

  /**
   * Find the SSO configuration using Passbolt API
   *
   * @return {Promise<SsoConfigurationEntity|null>}
   */
  async findSsoConfiguration() {
    const ssoConfigurationDto = await this.ssoConfigurationService.find();
    if (!ssoConfigurationDto) {
      return null;
    }
    return new SsoConfigurationEntity(ssoConfigurationDto);
  }
}

export default SsoConfigurationModel;
