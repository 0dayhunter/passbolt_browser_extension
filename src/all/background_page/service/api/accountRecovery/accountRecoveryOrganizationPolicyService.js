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
 * @since         3.4.0
 */
const {AbstractService} = require('../abstract/abstractService');
const {ExternalGpgKeyEntity} = require("../../../model/entity/gpgkey/external/externalGpgKeyEntity");
const {GpgKeyInfoService} = require("../../crypto/gpgKeyInfoService");
const {GpgAuth} = require('../../../model/gpgauth');
const {Keyring} = require('../../../model/keyring');

const ACCOUNT_RECOVERY_ORGANIZATION_POLICY_SERVICE_RESOURCE_NAME = '/account-recovery/organization-policies';

class AccountRecoveryOrganizationPolicyService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, AccountRecoveryOrganizationPolicyService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return ACCOUNT_RECOVERY_ORGANIZATION_POLICY_SERVICE_RESOURCE_NAME;
  }

  /**
   * Save organization settings of a accountRecovery using Passbolt API
   *
   * @param {Object} accountRecoveryOrganizationPolicyDto
   * @returns {Promise<*>} Response body
   * @throw {TypeError} if account recovery organization policy dto is null
   * @public
   */
  async saveOrganizationSettings(accountRecoveryOrganizationPolicyDto) {
    this.assertNonEmptyData(accountRecoveryOrganizationPolicyDto);
    const response = await this.apiClient.create(accountRecoveryOrganizationPolicyDto);
    return response.body;
  }

  /**
   * Validate the new ORK by checking that the key:
   * - uses the right algorithm
   * - is public
   * - is not revoked
   * - is not expired
   * - size/length is at least 4096
   * - it's not the server key
   * - it's not already used by a user
   * - it's not the previous ORK
   *
   * @param {AccountRecoveryOrganizationPublicKeyDto} newAccountRecoveryOrganizationPublicKeyDto
   * @param {AccountRecoveryOrganizationPublicKeyDto} currentAccountRecoveryOrganizationPublicKeyDto
   * @throws {Error} if any of the checks are wrong
   */
  static async validatePublicKey(newAccountRecoveryOrganizationPublicKeyDto, currentAccountRecoveryOrganizationPublicKeyDto) {
    const keyEntity = new ExternalGpgKeyEntity(newAccountRecoveryOrganizationPublicKeyDto);
    const keyInfo = await GpgKeyInfoService.getKeyInfo(keyEntity);

    if (keyInfo.algorithm !== "RSA") {
      throw new Error(`The algorithm used for the key is ${keyInfo.algorithm} but, must be RSA.`);
    }

    if (keyInfo.private) {
      throw new Error(`The key must be a public key.`);
    }

    if (keyInfo.revoked) {
      throw new Error(`The key is revoked.`);
    }

    if (keyInfo.expires !== "Never") {
      const now = Date.now();
      const expirationDate = new Date(keyInfo.expires);

      if (expirationDate < now) {
        throw new Error(`The key is expired.`);
      }
    }

    if (keyInfo.length < 4096) {
      throw new Error(`The key size is of ${keyInfo.length} bits but, must be at least of 4096 bits.`);
    }

    const keyring = new Keyring();
    const gpgAuth = new GpgAuth(keyring);

    const serverKey = await gpgAuth.getServerKey();

    if (serverKey.fingerprint.toLowerCase() === keyInfo.fingerprint) {
      throw new Error("The key is the current server key, the organization recovery key must be a new one.");
    }

    await keyring.sync();
    const publicKeys = keyring.getPublicKeysFromStorage();
    for (const id in publicKeys) {
      const publicKey = publicKeys[id];
      if (publicKey.fingerprint === keyInfo.fingerprint) {
        throw new Error("The key is already being used, the organization recovery key must be a new one.");
      }
    }

    if (!currentAccountRecoveryOrganizationPublicKeyDto) {
      return;
    }

    const currentOrkEntity = new ExternalGpgKeyEntity(currentAccountRecoveryOrganizationPublicKeyDto);
    const currentOrkInfo = await GpgKeyInfoService.getKeyInfo(currentOrkEntity);
    if (currentOrkInfo.fingerprint === keyInfo.fingerprint) {
      throw new Error("The key is the current organization recovery key, you must provide a new one.");
    }
  }
}

exports.AccountRecoveryOrganizationPolicyService = AccountRecoveryOrganizationPolicyService;
