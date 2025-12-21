"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MethodType = void 0;
// Method type enum - generic operation types (not HTTP-specific)
var MethodType;
(function (MethodType) {
    MethodType["GET"] = "get";
    MethodType["CREATE"] = "create";
    MethodType["UPDATE"] = "update";
    MethodType["DELETE"] = "delete";
})(MethodType || (exports.MethodType = MethodType = {}));
