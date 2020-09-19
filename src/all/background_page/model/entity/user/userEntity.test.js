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
 * @since         2.13.0
 */
import {UserEntity} from "./userEntity";
import {UserEntityTestFixtures} from "./userEntity.test.fixtures";
import {EntitySchema} from "../abstract/entitySchema";
import {EntityValidationError} from '../abstract/entityValidationError';
import Validator from 'validator';

// Reset the modules before each test.
beforeEach(() => {
  window.Validator = Validator;
  jest.resetModules();
});

describe("User entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(UserEntity.ENTITY_NAME, UserEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = {
      "role_id": "a58de6d3-f52c-5080-b79b-a601a647ac85",
      "username": "dame@passbolt.com",
    };
    const entity = new UserEntity(dto);
    expect(entity.toDto()).toEqual(dto);
    expect(entity.username).toEqual('dame@passbolt.com');
    expect(entity.roleId).toEqual('a58de6d3-f52c-5080-b79b-a601a647ac85');
    expect(entity.created).toBe(null);
    expect(entity.modified).toBe(null);
    expect(entity.profile).toBe(null);
  });

  it("constructor works if valid DTO with associated entity data is provided", () => {
    const dto = UserEntityTestFixtures.default;
    const filtered = {
      "id": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
      "role_id": "0d51c3a8-5e67-5e3d-882f-e1868966d817",
      "username": "admin@passbolt.com",
      "active": true,
      "deleted": false,
      "created": "2020-04-20T11:32:16+00:00",
      "modified": "2020-04-20T11:32:16+00:00",
      "last_logged_in": "2012-07-04T13:39:25+00:00"
    };

    const entity = new UserEntity(dto);
    expect(entity.toDto()).toEqual(filtered);
    expect(entity.profile.firstName).toEqual('Admin');
    expect(entity.profile.lastName).toEqual('User');
    expect(entity.role).not.toBe(null);
    expect(entity.profile).not.toBe(null);
    expect(entity.gpgkey).not.toBe(null);
    expect(entity.role.name).toEqual('admin');
    expect(entity.gpgkey.armoredKey.startsWith('-----BEGIN PGP PUBLIC KEY BLOCK-----')).toBe(true);

    const dtoWithContain = entity.toDto({role: true, profile: true, gpgkey: true});
    expect(dtoWithContain.role.name).toEqual('admin');
    expect(dtoWithContain.profile.first_name).toEqual('Admin');
    expect(dtoWithContain.gpgkey.armored_key.startsWith('-----BEGIN PGP PUBLIC KEY BLOCK-----')).toBe(true);
  });

  it("constructor throws an exception if DTO is missing required field", () => {
    try {
      new UserEntity({"created": "2020-04-20T11:32:17+00:00"});
      expect(false).toBe(true);
    } catch(error) {
      expect((error instanceof EntityValidationError)).toBe(true);
      expect(error.hasError('username', 'required')).toBe(true);
      expect(error.hasError('role_id', 'required')).toBe(true);
    }
  });

  it("constructor throws an exception if DTO contains invalid field", () => {
    try {
      new UserEntity({
        "id": "🤷",
        "role_id": -0,
        "username": "(ノಠ益ಠ)ノ",
      });
      expect(false).toBe(true);
    } catch(error) {
      expect((error instanceof EntityValidationError)).toBe(true);
      expect(error.hasError('id', 'format')).toBe(true);
      expect(error.hasError('role_id', 'type')).toBe(true);
      expect(error.hasError('username', 'format')).toBe(true);
    }
  });

});
