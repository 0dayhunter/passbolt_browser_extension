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
 * @since         3.0.0
 */
const {FavoriteEntity} = require('../entity/favorite/favoriteEntity');
const {FavoriteService} = require('../../service/api/favorite/favoriteService');
const {ResourceModel} = require('../../model/resource/resourceModel');

class FavoriteModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.favoriteService = new FavoriteService(apiClientOptions);
    this.resourceModel = new ResourceModel(apiClientOptions);
  }

  /**
   * Create a favorite using Passbolt API
   *
   * @param {string} resourceId uuid
   * @returns {Promise<FavoriteEntity>}
   */
  async addResourceToFavorite(resourceId) {
    const foreignKey = 'Resource';
    const favoriteDto = await this.favoriteService.create(foreignKey, resourceId);
    const favoriteEntity = new FavoriteEntity(favoriteDto);
    await this.resourceModel.updateFavoriteLocally(resourceId, favoriteEntity);
    return favoriteEntity;
  }

  /**
   * Delete a favorite using Passbolt API
   *
   * @param {string} resourceId uuid
   * @returns {Promise<void>}
   */
  async removeResourceFromFavorite(resourceId) {
    const resourceEntity = await this.resourceModel.getById(resourceId);
    await this.favoriteService.delete(resourceEntity.favorite.id);
    await this.resourceModel.updateFavoriteLocally(resourceId, null);
  }
}

exports.FavoriteModel = FavoriteModel;
