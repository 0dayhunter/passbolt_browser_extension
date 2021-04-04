/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 */
const {AbstractService} = require('../abstract/abstractService');

const RESOURCE_SERVICE_RESOURCE_NAME = 'account/settings';

class AccountSettingsService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, AccountSettingsService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return RESOURCE_SERVICE_RESOURCE_NAME;
  }

  /**
   * Find all themes
   *
   * @returns {Promise<*>} response body
   * @throws {Error} if options are invalid or API error
   * @public
   */
  async findAllThemes() {
    const url = this.apiClient.buildUrl(`${this.apiClient.baseUrl}/themes`);
    const response = await this.apiClient.fetchAndHandleResponse('GET', url);
    return response.body;
  }

  /**
   * Change the current user theme
   *
   * @param {string} name The theme name to switch on
   * @returns {Promise<*>} response body
   * @throws {Error} if options are invalid or API error
   * @public
   */
  async change(name) {
    const data = {value: name};
    const bodyString = this.apiClient.buildBody(data);
    const url = this.apiClient.buildUrl(`${this.apiClient.baseUrl}/themes`);
    const response = await this.apiClient.fetchAndHandleResponse('POST', url, bodyString);
    return response.body;
  }

  /**
   * Update the current user locale language
   *
   * @param {string} locale The locale language to switch on
   * @returns {Promise<*>} response body
   * @throws {Error} if options are invalid or API error
   * @public
   */
  async updateLocale(locale) {
    const data = {value: locale};
    const bodyString = this.apiClient.buildBody(data);
    const url = this.apiClient.buildUrl(`${this.apiClient.baseUrl}/locale`);
    const response = await this.apiClient.fetchAndHandleResponse('POST', url, bodyString);
    return response.body;
  }
}

exports.AccountSettingsService = AccountSettingsService;
