import { BACKEND_URL } from "./apis";

const SIGN_UP_URL = `${BACKEND_URL}/api/v1/signup`;

const SIGN_IN_URL = `${BACKEND_URL}/api/v1/signin`;

const MAP_URL = `${BACKEND_URL}/api/v1/admin/map`;

const SPACE_URL = `${BACKEND_URL}/api/v1/space`;

const SPACE_ALL_URL = `${SPACE_URL}/all`;

const SPACE_ELEMENT_URL = `${SPACE_URL}/element`;

const AVATAR_ADMIN_URL = `${BACKEND_URL}/api/v1/admin/avatar`;

const METADATA_URL = `${BACKEND_URL}/api/v1/user/metadata`;

const METADATA_BULK_URL = `${BACKEND_URL}/api/v1/user/metadata/bulk`;

const AVATAR_URL = `${BACKEND_URL}/api/v1/avatars`;

const ELEMENT_URL = `${BACKEND_URL}/api/v1/admin/element`;

export {
  SIGN_UP_URL,
  SIGN_IN_URL,
  MAP_URL,
  SPACE_URL,
  SPACE_ALL_URL,
  SPACE_ELEMENT_URL,
  AVATAR_ADMIN_URL,
  METADATA_URL,
  METADATA_BULK_URL,
  AVATAR_URL,
  ELEMENT_URL,
};
