"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GUARD_METADATA = exports.DESCRIPTION_METADATA = exports.METHOD_METADATA = exports.CONTROLLER_PATH_METADATA = void 0;
/**
 * Metadata keys for controller decorators
 * Using symbols to avoid conflicts with user-defined properties
 */
exports.CONTROLLER_PATH_METADATA = Symbol("controller:path");
exports.METHOD_METADATA = Symbol("method:metadata");
exports.DESCRIPTION_METADATA = Symbol("method:description");
exports.GUARD_METADATA = Symbol("method:guard");
