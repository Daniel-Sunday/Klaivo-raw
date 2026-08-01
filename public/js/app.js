"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __commonJS = (cb, mod) => function __require2() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/lodash/_listCacheClear.js
  var require_listCacheClear = __commonJS({
    "node_modules/lodash/_listCacheClear.js"(exports, module) {
      function listCacheClear() {
        this.__data__ = [];
        this.size = 0;
      }
      module.exports = listCacheClear;
    }
  });

  // node_modules/lodash/eq.js
  var require_eq = __commonJS({
    "node_modules/lodash/eq.js"(exports, module) {
      function eq(value, other) {
        return value === other || value !== value && other !== other;
      }
      module.exports = eq;
    }
  });

  // node_modules/lodash/_assocIndexOf.js
  var require_assocIndexOf = __commonJS({
    "node_modules/lodash/_assocIndexOf.js"(exports, module) {
      var eq = require_eq();
      function assocIndexOf(array, key) {
        var length = array.length;
        while (length--) {
          if (eq(array[length][0], key)) {
            return length;
          }
        }
        return -1;
      }
      module.exports = assocIndexOf;
    }
  });

  // node_modules/lodash/_listCacheDelete.js
  var require_listCacheDelete = __commonJS({
    "node_modules/lodash/_listCacheDelete.js"(exports, module) {
      var assocIndexOf = require_assocIndexOf();
      var arrayProto = Array.prototype;
      var splice = arrayProto.splice;
      function listCacheDelete(key) {
        var data = this.__data__, index = assocIndexOf(data, key);
        if (index < 0) {
          return false;
        }
        var lastIndex = data.length - 1;
        if (index == lastIndex) {
          data.pop();
        } else {
          splice.call(data, index, 1);
        }
        --this.size;
        return true;
      }
      module.exports = listCacheDelete;
    }
  });

  // node_modules/lodash/_listCacheGet.js
  var require_listCacheGet = __commonJS({
    "node_modules/lodash/_listCacheGet.js"(exports, module) {
      var assocIndexOf = require_assocIndexOf();
      function listCacheGet(key) {
        var data = this.__data__, index = assocIndexOf(data, key);
        return index < 0 ? void 0 : data[index][1];
      }
      module.exports = listCacheGet;
    }
  });

  // node_modules/lodash/_listCacheHas.js
  var require_listCacheHas = __commonJS({
    "node_modules/lodash/_listCacheHas.js"(exports, module) {
      var assocIndexOf = require_assocIndexOf();
      function listCacheHas(key) {
        return assocIndexOf(this.__data__, key) > -1;
      }
      module.exports = listCacheHas;
    }
  });

  // node_modules/lodash/_listCacheSet.js
  var require_listCacheSet = __commonJS({
    "node_modules/lodash/_listCacheSet.js"(exports, module) {
      var assocIndexOf = require_assocIndexOf();
      function listCacheSet(key, value) {
        var data = this.__data__, index = assocIndexOf(data, key);
        if (index < 0) {
          ++this.size;
          data.push([key, value]);
        } else {
          data[index][1] = value;
        }
        return this;
      }
      module.exports = listCacheSet;
    }
  });

  // node_modules/lodash/_ListCache.js
  var require_ListCache = __commonJS({
    "node_modules/lodash/_ListCache.js"(exports, module) {
      var listCacheClear = require_listCacheClear();
      var listCacheDelete = require_listCacheDelete();
      var listCacheGet = require_listCacheGet();
      var listCacheHas = require_listCacheHas();
      var listCacheSet = require_listCacheSet();
      function ListCache(entries) {
        var index = -1, length = entries == null ? 0 : entries.length;
        this.clear();
        while (++index < length) {
          var entry = entries[index];
          this.set(entry[0], entry[1]);
        }
      }
      ListCache.prototype.clear = listCacheClear;
      ListCache.prototype["delete"] = listCacheDelete;
      ListCache.prototype.get = listCacheGet;
      ListCache.prototype.has = listCacheHas;
      ListCache.prototype.set = listCacheSet;
      module.exports = ListCache;
    }
  });

  // node_modules/lodash/_stackClear.js
  var require_stackClear = __commonJS({
    "node_modules/lodash/_stackClear.js"(exports, module) {
      var ListCache = require_ListCache();
      function stackClear() {
        this.__data__ = new ListCache();
        this.size = 0;
      }
      module.exports = stackClear;
    }
  });

  // node_modules/lodash/_stackDelete.js
  var require_stackDelete = __commonJS({
    "node_modules/lodash/_stackDelete.js"(exports, module) {
      function stackDelete(key) {
        var data = this.__data__, result = data["delete"](key);
        this.size = data.size;
        return result;
      }
      module.exports = stackDelete;
    }
  });

  // node_modules/lodash/_stackGet.js
  var require_stackGet = __commonJS({
    "node_modules/lodash/_stackGet.js"(exports, module) {
      function stackGet(key) {
        return this.__data__.get(key);
      }
      module.exports = stackGet;
    }
  });

  // node_modules/lodash/_stackHas.js
  var require_stackHas = __commonJS({
    "node_modules/lodash/_stackHas.js"(exports, module) {
      function stackHas(key) {
        return this.__data__.has(key);
      }
      module.exports = stackHas;
    }
  });

  // node_modules/lodash/_freeGlobal.js
  var require_freeGlobal = __commonJS({
    "node_modules/lodash/_freeGlobal.js"(exports, module) {
      var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
      module.exports = freeGlobal;
    }
  });

  // node_modules/lodash/_root.js
  var require_root = __commonJS({
    "node_modules/lodash/_root.js"(exports, module) {
      var freeGlobal = require_freeGlobal();
      var freeSelf = typeof self == "object" && self && self.Object === Object && self;
      var root = freeGlobal || freeSelf || Function("return this")();
      module.exports = root;
    }
  });

  // node_modules/lodash/_Symbol.js
  var require_Symbol = __commonJS({
    "node_modules/lodash/_Symbol.js"(exports, module) {
      var root = require_root();
      var Symbol2 = root.Symbol;
      module.exports = Symbol2;
    }
  });

  // node_modules/lodash/_getRawTag.js
  var require_getRawTag = __commonJS({
    "node_modules/lodash/_getRawTag.js"(exports, module) {
      var Symbol2 = require_Symbol();
      var objectProto = Object.prototype;
      var hasOwnProperty = objectProto.hasOwnProperty;
      var nativeObjectToString = objectProto.toString;
      var symToStringTag = Symbol2 ? Symbol2.toStringTag : void 0;
      function getRawTag(value) {
        var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
        try {
          value[symToStringTag] = void 0;
          var unmasked = true;
        } catch (e) {
        }
        var result = nativeObjectToString.call(value);
        if (unmasked) {
          if (isOwn) {
            value[symToStringTag] = tag;
          } else {
            delete value[symToStringTag];
          }
        }
        return result;
      }
      module.exports = getRawTag;
    }
  });

  // node_modules/lodash/_objectToString.js
  var require_objectToString = __commonJS({
    "node_modules/lodash/_objectToString.js"(exports, module) {
      var objectProto = Object.prototype;
      var nativeObjectToString = objectProto.toString;
      function objectToString(value) {
        return nativeObjectToString.call(value);
      }
      module.exports = objectToString;
    }
  });

  // node_modules/lodash/_baseGetTag.js
  var require_baseGetTag = __commonJS({
    "node_modules/lodash/_baseGetTag.js"(exports, module) {
      var Symbol2 = require_Symbol();
      var getRawTag = require_getRawTag();
      var objectToString = require_objectToString();
      var nullTag = "[object Null]";
      var undefinedTag = "[object Undefined]";
      var symToStringTag = Symbol2 ? Symbol2.toStringTag : void 0;
      function baseGetTag(value) {
        if (value == null) {
          return value === void 0 ? undefinedTag : nullTag;
        }
        return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
      }
      module.exports = baseGetTag;
    }
  });

  // node_modules/lodash/isObject.js
  var require_isObject = __commonJS({
    "node_modules/lodash/isObject.js"(exports, module) {
      function isObject(value) {
        var type = typeof value;
        return value != null && (type == "object" || type == "function");
      }
      module.exports = isObject;
    }
  });

  // node_modules/lodash/isFunction.js
  var require_isFunction = __commonJS({
    "node_modules/lodash/isFunction.js"(exports, module) {
      var baseGetTag = require_baseGetTag();
      var isObject = require_isObject();
      var asyncTag = "[object AsyncFunction]";
      var funcTag = "[object Function]";
      var genTag = "[object GeneratorFunction]";
      var proxyTag = "[object Proxy]";
      function isFunction(value) {
        if (!isObject(value)) {
          return false;
        }
        var tag = baseGetTag(value);
        return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
      }
      module.exports = isFunction;
    }
  });

  // node_modules/lodash/_coreJsData.js
  var require_coreJsData = __commonJS({
    "node_modules/lodash/_coreJsData.js"(exports, module) {
      var root = require_root();
      var coreJsData = root["__core-js_shared__"];
      module.exports = coreJsData;
    }
  });

  // node_modules/lodash/_isMasked.js
  var require_isMasked = __commonJS({
    "node_modules/lodash/_isMasked.js"(exports, module) {
      var coreJsData = require_coreJsData();
      var maskSrcKey = (function() {
        var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
        return uid ? "Symbol(src)_1." + uid : "";
      })();
      function isMasked(func) {
        return !!maskSrcKey && maskSrcKey in func;
      }
      module.exports = isMasked;
    }
  });

  // node_modules/lodash/_toSource.js
  var require_toSource = __commonJS({
    "node_modules/lodash/_toSource.js"(exports, module) {
      var funcProto = Function.prototype;
      var funcToString = funcProto.toString;
      function toSource(func) {
        if (func != null) {
          try {
            return funcToString.call(func);
          } catch (e) {
          }
          try {
            return func + "";
          } catch (e) {
          }
        }
        return "";
      }
      module.exports = toSource;
    }
  });

  // node_modules/lodash/_baseIsNative.js
  var require_baseIsNative = __commonJS({
    "node_modules/lodash/_baseIsNative.js"(exports, module) {
      var isFunction = require_isFunction();
      var isMasked = require_isMasked();
      var isObject = require_isObject();
      var toSource = require_toSource();
      var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
      var reIsHostCtor = /^\[object .+?Constructor\]$/;
      var funcProto = Function.prototype;
      var objectProto = Object.prototype;
      var funcToString = funcProto.toString;
      var hasOwnProperty = objectProto.hasOwnProperty;
      var reIsNative = RegExp(
        "^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
      );
      function baseIsNative(value) {
        if (!isObject(value) || isMasked(value)) {
          return false;
        }
        var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
        return pattern.test(toSource(value));
      }
      module.exports = baseIsNative;
    }
  });

  // node_modules/lodash/_getValue.js
  var require_getValue = __commonJS({
    "node_modules/lodash/_getValue.js"(exports, module) {
      function getValue(object, key) {
        return object == null ? void 0 : object[key];
      }
      module.exports = getValue;
    }
  });

  // node_modules/lodash/_getNative.js
  var require_getNative = __commonJS({
    "node_modules/lodash/_getNative.js"(exports, module) {
      var baseIsNative = require_baseIsNative();
      var getValue = require_getValue();
      function getNative(object, key) {
        var value = getValue(object, key);
        return baseIsNative(value) ? value : void 0;
      }
      module.exports = getNative;
    }
  });

  // node_modules/lodash/_Map.js
  var require_Map = __commonJS({
    "node_modules/lodash/_Map.js"(exports, module) {
      var getNative = require_getNative();
      var root = require_root();
      var Map = getNative(root, "Map");
      module.exports = Map;
    }
  });

  // node_modules/lodash/_nativeCreate.js
  var require_nativeCreate = __commonJS({
    "node_modules/lodash/_nativeCreate.js"(exports, module) {
      var getNative = require_getNative();
      var nativeCreate = getNative(Object, "create");
      module.exports = nativeCreate;
    }
  });

  // node_modules/lodash/_hashClear.js
  var require_hashClear = __commonJS({
    "node_modules/lodash/_hashClear.js"(exports, module) {
      var nativeCreate = require_nativeCreate();
      function hashClear() {
        this.__data__ = nativeCreate ? nativeCreate(null) : {};
        this.size = 0;
      }
      module.exports = hashClear;
    }
  });

  // node_modules/lodash/_hashDelete.js
  var require_hashDelete = __commonJS({
    "node_modules/lodash/_hashDelete.js"(exports, module) {
      function hashDelete(key) {
        var result = this.has(key) && delete this.__data__[key];
        this.size -= result ? 1 : 0;
        return result;
      }
      module.exports = hashDelete;
    }
  });

  // node_modules/lodash/_hashGet.js
  var require_hashGet = __commonJS({
    "node_modules/lodash/_hashGet.js"(exports, module) {
      var nativeCreate = require_nativeCreate();
      var HASH_UNDEFINED = "__lodash_hash_undefined__";
      var objectProto = Object.prototype;
      var hasOwnProperty = objectProto.hasOwnProperty;
      function hashGet(key) {
        var data = this.__data__;
        if (nativeCreate) {
          var result = data[key];
          return result === HASH_UNDEFINED ? void 0 : result;
        }
        return hasOwnProperty.call(data, key) ? data[key] : void 0;
      }
      module.exports = hashGet;
    }
  });

  // node_modules/lodash/_hashHas.js
  var require_hashHas = __commonJS({
    "node_modules/lodash/_hashHas.js"(exports, module) {
      var nativeCreate = require_nativeCreate();
      var objectProto = Object.prototype;
      var hasOwnProperty = objectProto.hasOwnProperty;
      function hashHas(key) {
        var data = this.__data__;
        return nativeCreate ? data[key] !== void 0 : hasOwnProperty.call(data, key);
      }
      module.exports = hashHas;
    }
  });

  // node_modules/lodash/_hashSet.js
  var require_hashSet = __commonJS({
    "node_modules/lodash/_hashSet.js"(exports, module) {
      var nativeCreate = require_nativeCreate();
      var HASH_UNDEFINED = "__lodash_hash_undefined__";
      function hashSet(key, value) {
        var data = this.__data__;
        this.size += this.has(key) ? 0 : 1;
        data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value;
        return this;
      }
      module.exports = hashSet;
    }
  });

  // node_modules/lodash/_Hash.js
  var require_Hash = __commonJS({
    "node_modules/lodash/_Hash.js"(exports, module) {
      var hashClear = require_hashClear();
      var hashDelete = require_hashDelete();
      var hashGet = require_hashGet();
      var hashHas = require_hashHas();
      var hashSet = require_hashSet();
      function Hash(entries) {
        var index = -1, length = entries == null ? 0 : entries.length;
        this.clear();
        while (++index < length) {
          var entry = entries[index];
          this.set(entry[0], entry[1]);
        }
      }
      Hash.prototype.clear = hashClear;
      Hash.prototype["delete"] = hashDelete;
      Hash.prototype.get = hashGet;
      Hash.prototype.has = hashHas;
      Hash.prototype.set = hashSet;
      module.exports = Hash;
    }
  });

  // node_modules/lodash/_mapCacheClear.js
  var require_mapCacheClear = __commonJS({
    "node_modules/lodash/_mapCacheClear.js"(exports, module) {
      var Hash = require_Hash();
      var ListCache = require_ListCache();
      var Map = require_Map();
      function mapCacheClear() {
        this.size = 0;
        this.__data__ = {
          "hash": new Hash(),
          "map": new (Map || ListCache)(),
          "string": new Hash()
        };
      }
      module.exports = mapCacheClear;
    }
  });

  // node_modules/lodash/_isKeyable.js
  var require_isKeyable = __commonJS({
    "node_modules/lodash/_isKeyable.js"(exports, module) {
      function isKeyable(value) {
        var type = typeof value;
        return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
      }
      module.exports = isKeyable;
    }
  });

  // node_modules/lodash/_getMapData.js
  var require_getMapData = __commonJS({
    "node_modules/lodash/_getMapData.js"(exports, module) {
      var isKeyable = require_isKeyable();
      function getMapData(map, key) {
        var data = map.__data__;
        return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
      }
      module.exports = getMapData;
    }
  });

  // node_modules/lodash/_mapCacheDelete.js
  var require_mapCacheDelete = __commonJS({
    "node_modules/lodash/_mapCacheDelete.js"(exports, module) {
      var getMapData = require_getMapData();
      function mapCacheDelete(key) {
        var result = getMapData(this, key)["delete"](key);
        this.size -= result ? 1 : 0;
        return result;
      }
      module.exports = mapCacheDelete;
    }
  });

  // node_modules/lodash/_mapCacheGet.js
  var require_mapCacheGet = __commonJS({
    "node_modules/lodash/_mapCacheGet.js"(exports, module) {
      var getMapData = require_getMapData();
      function mapCacheGet(key) {
        return getMapData(this, key).get(key);
      }
      module.exports = mapCacheGet;
    }
  });

  // node_modules/lodash/_mapCacheHas.js
  var require_mapCacheHas = __commonJS({
    "node_modules/lodash/_mapCacheHas.js"(exports, module) {
      var getMapData = require_getMapData();
      function mapCacheHas(key) {
        return getMapData(this, key).has(key);
      }
      module.exports = mapCacheHas;
    }
  });

  // node_modules/lodash/_mapCacheSet.js
  var require_mapCacheSet = __commonJS({
    "node_modules/lodash/_mapCacheSet.js"(exports, module) {
      var getMapData = require_getMapData();
      function mapCacheSet(key, value) {
        var data = getMapData(this, key), size = data.size;
        data.set(key, value);
        this.size += data.size == size ? 0 : 1;
        return this;
      }
      module.exports = mapCacheSet;
    }
  });

  // node_modules/lodash/_MapCache.js
  var require_MapCache = __commonJS({
    "node_modules/lodash/_MapCache.js"(exports, module) {
      var mapCacheClear = require_mapCacheClear();
      var mapCacheDelete = require_mapCacheDelete();
      var mapCacheGet = require_mapCacheGet();
      var mapCacheHas = require_mapCacheHas();
      var mapCacheSet = require_mapCacheSet();
      function MapCache(entries) {
        var index = -1, length = entries == null ? 0 : entries.length;
        this.clear();
        while (++index < length) {
          var entry = entries[index];
          this.set(entry[0], entry[1]);
        }
      }
      MapCache.prototype.clear = mapCacheClear;
      MapCache.prototype["delete"] = mapCacheDelete;
      MapCache.prototype.get = mapCacheGet;
      MapCache.prototype.has = mapCacheHas;
      MapCache.prototype.set = mapCacheSet;
      module.exports = MapCache;
    }
  });

  // node_modules/lodash/_stackSet.js
  var require_stackSet = __commonJS({
    "node_modules/lodash/_stackSet.js"(exports, module) {
      var ListCache = require_ListCache();
      var Map = require_Map();
      var MapCache = require_MapCache();
      var LARGE_ARRAY_SIZE = 200;
      function stackSet(key, value) {
        var data = this.__data__;
        if (data instanceof ListCache) {
          var pairs = data.__data__;
          if (!Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
            pairs.push([key, value]);
            this.size = ++data.size;
            return this;
          }
          data = this.__data__ = new MapCache(pairs);
        }
        data.set(key, value);
        this.size = data.size;
        return this;
      }
      module.exports = stackSet;
    }
  });

  // node_modules/lodash/_Stack.js
  var require_Stack = __commonJS({
    "node_modules/lodash/_Stack.js"(exports, module) {
      var ListCache = require_ListCache();
      var stackClear = require_stackClear();
      var stackDelete = require_stackDelete();
      var stackGet = require_stackGet();
      var stackHas = require_stackHas();
      var stackSet = require_stackSet();
      function Stack(entries) {
        var data = this.__data__ = new ListCache(entries);
        this.size = data.size;
      }
      Stack.prototype.clear = stackClear;
      Stack.prototype["delete"] = stackDelete;
      Stack.prototype.get = stackGet;
      Stack.prototype.has = stackHas;
      Stack.prototype.set = stackSet;
      module.exports = Stack;
    }
  });

  // node_modules/lodash/_arrayEach.js
  var require_arrayEach = __commonJS({
    "node_modules/lodash/_arrayEach.js"(exports, module) {
      function arrayEach(array, iteratee) {
        var index = -1, length = array == null ? 0 : array.length;
        while (++index < length) {
          if (iteratee(array[index], index, array) === false) {
            break;
          }
        }
        return array;
      }
      module.exports = arrayEach;
    }
  });

  // node_modules/lodash/_defineProperty.js
  var require_defineProperty = __commonJS({
    "node_modules/lodash/_defineProperty.js"(exports, module) {
      var getNative = require_getNative();
      var defineProperty = (function() {
        try {
          var func = getNative(Object, "defineProperty");
          func({}, "", {});
          return func;
        } catch (e) {
        }
      })();
      module.exports = defineProperty;
    }
  });

  // node_modules/lodash/_baseAssignValue.js
  var require_baseAssignValue = __commonJS({
    "node_modules/lodash/_baseAssignValue.js"(exports, module) {
      var defineProperty = require_defineProperty();
      function baseAssignValue(object, key, value) {
        if (key == "__proto__" && defineProperty) {
          defineProperty(object, key, {
            "configurable": true,
            "enumerable": true,
            "value": value,
            "writable": true
          });
        } else {
          object[key] = value;
        }
      }
      module.exports = baseAssignValue;
    }
  });

  // node_modules/lodash/_assignValue.js
  var require_assignValue = __commonJS({
    "node_modules/lodash/_assignValue.js"(exports, module) {
      var baseAssignValue = require_baseAssignValue();
      var eq = require_eq();
      var objectProto = Object.prototype;
      var hasOwnProperty = objectProto.hasOwnProperty;
      function assignValue(object, key, value) {
        var objValue = object[key];
        if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) || value === void 0 && !(key in object)) {
          baseAssignValue(object, key, value);
        }
      }
      module.exports = assignValue;
    }
  });

  // node_modules/lodash/_copyObject.js
  var require_copyObject = __commonJS({
    "node_modules/lodash/_copyObject.js"(exports, module) {
      var assignValue = require_assignValue();
      var baseAssignValue = require_baseAssignValue();
      function copyObject(source, props, object, customizer) {
        var isNew = !object;
        object || (object = {});
        var index = -1, length = props.length;
        while (++index < length) {
          var key = props[index];
          var newValue = customizer ? customizer(object[key], source[key], key, object, source) : void 0;
          if (newValue === void 0) {
            newValue = source[key];
          }
          if (isNew) {
            baseAssignValue(object, key, newValue);
          } else {
            assignValue(object, key, newValue);
          }
        }
        return object;
      }
      module.exports = copyObject;
    }
  });

  // node_modules/lodash/_baseTimes.js
  var require_baseTimes = __commonJS({
    "node_modules/lodash/_baseTimes.js"(exports, module) {
      function baseTimes(n, iteratee) {
        var index = -1, result = Array(n);
        while (++index < n) {
          result[index] = iteratee(index);
        }
        return result;
      }
      module.exports = baseTimes;
    }
  });

  // node_modules/lodash/isObjectLike.js
  var require_isObjectLike = __commonJS({
    "node_modules/lodash/isObjectLike.js"(exports, module) {
      function isObjectLike(value) {
        return value != null && typeof value == "object";
      }
      module.exports = isObjectLike;
    }
  });

  // node_modules/lodash/_baseIsArguments.js
  var require_baseIsArguments = __commonJS({
    "node_modules/lodash/_baseIsArguments.js"(exports, module) {
      var baseGetTag = require_baseGetTag();
      var isObjectLike = require_isObjectLike();
      var argsTag = "[object Arguments]";
      function baseIsArguments(value) {
        return isObjectLike(value) && baseGetTag(value) == argsTag;
      }
      module.exports = baseIsArguments;
    }
  });

  // node_modules/lodash/isArguments.js
  var require_isArguments = __commonJS({
    "node_modules/lodash/isArguments.js"(exports, module) {
      var baseIsArguments = require_baseIsArguments();
      var isObjectLike = require_isObjectLike();
      var objectProto = Object.prototype;
      var hasOwnProperty = objectProto.hasOwnProperty;
      var propertyIsEnumerable = objectProto.propertyIsEnumerable;
      var isArguments = baseIsArguments(/* @__PURE__ */ (function() {
        return arguments;
      })()) ? baseIsArguments : function(value) {
        return isObjectLike(value) && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
      };
      module.exports = isArguments;
    }
  });

  // node_modules/lodash/isArray.js
  var require_isArray = __commonJS({
    "node_modules/lodash/isArray.js"(exports, module) {
      var isArray = Array.isArray;
      module.exports = isArray;
    }
  });

  // node_modules/lodash/stubFalse.js
  var require_stubFalse = __commonJS({
    "node_modules/lodash/stubFalse.js"(exports, module) {
      function stubFalse() {
        return false;
      }
      module.exports = stubFalse;
    }
  });

  // node_modules/lodash/isBuffer.js
  var require_isBuffer = __commonJS({
    "node_modules/lodash/isBuffer.js"(exports, module) {
      var root = require_root();
      var stubFalse = require_stubFalse();
      var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
      var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
      var moduleExports = freeModule && freeModule.exports === freeExports;
      var Buffer2 = moduleExports ? root.Buffer : void 0;
      var nativeIsBuffer = Buffer2 ? Buffer2.isBuffer : void 0;
      var isBuffer = nativeIsBuffer || stubFalse;
      module.exports = isBuffer;
    }
  });

  // node_modules/lodash/_isIndex.js
  var require_isIndex = __commonJS({
    "node_modules/lodash/_isIndex.js"(exports, module) {
      var MAX_SAFE_INTEGER = 9007199254740991;
      var reIsUint = /^(?:0|[1-9]\d*)$/;
      function isIndex(value, length) {
        var type = typeof value;
        length = length == null ? MAX_SAFE_INTEGER : length;
        return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
      }
      module.exports = isIndex;
    }
  });

  // node_modules/lodash/isLength.js
  var require_isLength = __commonJS({
    "node_modules/lodash/isLength.js"(exports, module) {
      var MAX_SAFE_INTEGER = 9007199254740991;
      function isLength(value) {
        return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
      }
      module.exports = isLength;
    }
  });

  // node_modules/lodash/_baseIsTypedArray.js
  var require_baseIsTypedArray = __commonJS({
    "node_modules/lodash/_baseIsTypedArray.js"(exports, module) {
      var baseGetTag = require_baseGetTag();
      var isLength = require_isLength();
      var isObjectLike = require_isObjectLike();
      var argsTag = "[object Arguments]";
      var arrayTag = "[object Array]";
      var boolTag = "[object Boolean]";
      var dateTag = "[object Date]";
      var errorTag = "[object Error]";
      var funcTag = "[object Function]";
      var mapTag = "[object Map]";
      var numberTag = "[object Number]";
      var objectTag = "[object Object]";
      var regexpTag = "[object RegExp]";
      var setTag = "[object Set]";
      var stringTag = "[object String]";
      var weakMapTag = "[object WeakMap]";
      var arrayBufferTag = "[object ArrayBuffer]";
      var dataViewTag = "[object DataView]";
      var float32Tag = "[object Float32Array]";
      var float64Tag = "[object Float64Array]";
      var int8Tag = "[object Int8Array]";
      var int16Tag = "[object Int16Array]";
      var int32Tag = "[object Int32Array]";
      var uint8Tag = "[object Uint8Array]";
      var uint8ClampedTag = "[object Uint8ClampedArray]";
      var uint16Tag = "[object Uint16Array]";
      var uint32Tag = "[object Uint32Array]";
      var typedArrayTags = {};
      typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
      typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
      function baseIsTypedArray(value) {
        return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
      }
      module.exports = baseIsTypedArray;
    }
  });

  // node_modules/lodash/_baseUnary.js
  var require_baseUnary = __commonJS({
    "node_modules/lodash/_baseUnary.js"(exports, module) {
      function baseUnary(func) {
        return function(value) {
          return func(value);
        };
      }
      module.exports = baseUnary;
    }
  });

  // node_modules/lodash/_nodeUtil.js
  var require_nodeUtil = __commonJS({
    "node_modules/lodash/_nodeUtil.js"(exports, module) {
      var freeGlobal = require_freeGlobal();
      var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
      var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
      var moduleExports = freeModule && freeModule.exports === freeExports;
      var freeProcess = moduleExports && freeGlobal.process;
      var nodeUtil = (function() {
        try {
          var types = freeModule && freeModule.require && freeModule.require("util").types;
          if (types) {
            return types;
          }
          return freeProcess && freeProcess.binding && freeProcess.binding("util");
        } catch (e) {
        }
      })();
      module.exports = nodeUtil;
    }
  });

  // node_modules/lodash/isTypedArray.js
  var require_isTypedArray = __commonJS({
    "node_modules/lodash/isTypedArray.js"(exports, module) {
      var baseIsTypedArray = require_baseIsTypedArray();
      var baseUnary = require_baseUnary();
      var nodeUtil = require_nodeUtil();
      var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
      var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
      module.exports = isTypedArray;
    }
  });

  // node_modules/lodash/_arrayLikeKeys.js
  var require_arrayLikeKeys = __commonJS({
    "node_modules/lodash/_arrayLikeKeys.js"(exports, module) {
      var baseTimes = require_baseTimes();
      var isArguments = require_isArguments();
      var isArray = require_isArray();
      var isBuffer = require_isBuffer();
      var isIndex = require_isIndex();
      var isTypedArray = require_isTypedArray();
      var objectProto = Object.prototype;
      var hasOwnProperty = objectProto.hasOwnProperty;
      function arrayLikeKeys(value, inherited) {
        var isArr = isArray(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
        for (var key in value) {
          if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
          (key == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
          isBuff && (key == "offset" || key == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
          isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || // Skip index properties.
          isIndex(key, length)))) {
            result.push(key);
          }
        }
        return result;
      }
      module.exports = arrayLikeKeys;
    }
  });

  // node_modules/lodash/_isPrototype.js
  var require_isPrototype = __commonJS({
    "node_modules/lodash/_isPrototype.js"(exports, module) {
      var objectProto = Object.prototype;
      function isPrototype(value) {
        var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto;
        return value === proto;
      }
      module.exports = isPrototype;
    }
  });

  // node_modules/lodash/_overArg.js
  var require_overArg = __commonJS({
    "node_modules/lodash/_overArg.js"(exports, module) {
      function overArg(func, transform) {
        return function(arg) {
          return func(transform(arg));
        };
      }
      module.exports = overArg;
    }
  });

  // node_modules/lodash/_nativeKeys.js
  var require_nativeKeys = __commonJS({
    "node_modules/lodash/_nativeKeys.js"(exports, module) {
      var overArg = require_overArg();
      var nativeKeys = overArg(Object.keys, Object);
      module.exports = nativeKeys;
    }
  });

  // node_modules/lodash/_baseKeys.js
  var require_baseKeys = __commonJS({
    "node_modules/lodash/_baseKeys.js"(exports, module) {
      var isPrototype = require_isPrototype();
      var nativeKeys = require_nativeKeys();
      var objectProto = Object.prototype;
      var hasOwnProperty = objectProto.hasOwnProperty;
      function baseKeys(object) {
        if (!isPrototype(object)) {
          return nativeKeys(object);
        }
        var result = [];
        for (var key in Object(object)) {
          if (hasOwnProperty.call(object, key) && key != "constructor") {
            result.push(key);
          }
        }
        return result;
      }
      module.exports = baseKeys;
    }
  });

  // node_modules/lodash/isArrayLike.js
  var require_isArrayLike = __commonJS({
    "node_modules/lodash/isArrayLike.js"(exports, module) {
      var isFunction = require_isFunction();
      var isLength = require_isLength();
      function isArrayLike(value) {
        return value != null && isLength(value.length) && !isFunction(value);
      }
      module.exports = isArrayLike;
    }
  });

  // node_modules/lodash/keys.js
  var require_keys = __commonJS({
    "node_modules/lodash/keys.js"(exports, module) {
      var arrayLikeKeys = require_arrayLikeKeys();
      var baseKeys = require_baseKeys();
      var isArrayLike = require_isArrayLike();
      function keys(object) {
        return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
      }
      module.exports = keys;
    }
  });

  // node_modules/lodash/_baseAssign.js
  var require_baseAssign = __commonJS({
    "node_modules/lodash/_baseAssign.js"(exports, module) {
      var copyObject = require_copyObject();
      var keys = require_keys();
      function baseAssign(object, source) {
        return object && copyObject(source, keys(source), object);
      }
      module.exports = baseAssign;
    }
  });

  // node_modules/lodash/_nativeKeysIn.js
  var require_nativeKeysIn = __commonJS({
    "node_modules/lodash/_nativeKeysIn.js"(exports, module) {
      function nativeKeysIn(object) {
        var result = [];
        if (object != null) {
          for (var key in Object(object)) {
            result.push(key);
          }
        }
        return result;
      }
      module.exports = nativeKeysIn;
    }
  });

  // node_modules/lodash/_baseKeysIn.js
  var require_baseKeysIn = __commonJS({
    "node_modules/lodash/_baseKeysIn.js"(exports, module) {
      var isObject = require_isObject();
      var isPrototype = require_isPrototype();
      var nativeKeysIn = require_nativeKeysIn();
      var objectProto = Object.prototype;
      var hasOwnProperty = objectProto.hasOwnProperty;
      function baseKeysIn(object) {
        if (!isObject(object)) {
          return nativeKeysIn(object);
        }
        var isProto = isPrototype(object), result = [];
        for (var key in object) {
          if (!(key == "constructor" && (isProto || !hasOwnProperty.call(object, key)))) {
            result.push(key);
          }
        }
        return result;
      }
      module.exports = baseKeysIn;
    }
  });

  // node_modules/lodash/keysIn.js
  var require_keysIn = __commonJS({
    "node_modules/lodash/keysIn.js"(exports, module) {
      var arrayLikeKeys = require_arrayLikeKeys();
      var baseKeysIn = require_baseKeysIn();
      var isArrayLike = require_isArrayLike();
      function keysIn(object) {
        return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
      }
      module.exports = keysIn;
    }
  });

  // node_modules/lodash/_baseAssignIn.js
  var require_baseAssignIn = __commonJS({
    "node_modules/lodash/_baseAssignIn.js"(exports, module) {
      var copyObject = require_copyObject();
      var keysIn = require_keysIn();
      function baseAssignIn(object, source) {
        return object && copyObject(source, keysIn(source), object);
      }
      module.exports = baseAssignIn;
    }
  });

  // node_modules/lodash/_cloneBuffer.js
  var require_cloneBuffer = __commonJS({
    "node_modules/lodash/_cloneBuffer.js"(exports, module) {
      var root = require_root();
      var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
      var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
      var moduleExports = freeModule && freeModule.exports === freeExports;
      var Buffer2 = moduleExports ? root.Buffer : void 0;
      var allocUnsafe = Buffer2 ? Buffer2.allocUnsafe : void 0;
      function cloneBuffer(buffer, isDeep) {
        if (isDeep) {
          return buffer.slice();
        }
        var length = buffer.length, result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
        buffer.copy(result);
        return result;
      }
      module.exports = cloneBuffer;
    }
  });

  // node_modules/lodash/_copyArray.js
  var require_copyArray = __commonJS({
    "node_modules/lodash/_copyArray.js"(exports, module) {
      function copyArray(source, array) {
        var index = -1, length = source.length;
        array || (array = Array(length));
        while (++index < length) {
          array[index] = source[index];
        }
        return array;
      }
      module.exports = copyArray;
    }
  });

  // node_modules/lodash/_arrayFilter.js
  var require_arrayFilter = __commonJS({
    "node_modules/lodash/_arrayFilter.js"(exports, module) {
      function arrayFilter(array, predicate) {
        var index = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
        while (++index < length) {
          var value = array[index];
          if (predicate(value, index, array)) {
            result[resIndex++] = value;
          }
        }
        return result;
      }
      module.exports = arrayFilter;
    }
  });

  // node_modules/lodash/stubArray.js
  var require_stubArray = __commonJS({
    "node_modules/lodash/stubArray.js"(exports, module) {
      function stubArray() {
        return [];
      }
      module.exports = stubArray;
    }
  });

  // node_modules/lodash/_getSymbols.js
  var require_getSymbols = __commonJS({
    "node_modules/lodash/_getSymbols.js"(exports, module) {
      var arrayFilter = require_arrayFilter();
      var stubArray = require_stubArray();
      var objectProto = Object.prototype;
      var propertyIsEnumerable = objectProto.propertyIsEnumerable;
      var nativeGetSymbols = Object.getOwnPropertySymbols;
      var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
        if (object == null) {
          return [];
        }
        object = Object(object);
        return arrayFilter(nativeGetSymbols(object), function(symbol) {
          return propertyIsEnumerable.call(object, symbol);
        });
      };
      module.exports = getSymbols;
    }
  });

  // node_modules/lodash/_copySymbols.js
  var require_copySymbols = __commonJS({
    "node_modules/lodash/_copySymbols.js"(exports, module) {
      var copyObject = require_copyObject();
      var getSymbols = require_getSymbols();
      function copySymbols(source, object) {
        return copyObject(source, getSymbols(source), object);
      }
      module.exports = copySymbols;
    }
  });

  // node_modules/lodash/_arrayPush.js
  var require_arrayPush = __commonJS({
    "node_modules/lodash/_arrayPush.js"(exports, module) {
      function arrayPush(array, values) {
        var index = -1, length = values.length, offset = array.length;
        while (++index < length) {
          array[offset + index] = values[index];
        }
        return array;
      }
      module.exports = arrayPush;
    }
  });

  // node_modules/lodash/_getPrototype.js
  var require_getPrototype = __commonJS({
    "node_modules/lodash/_getPrototype.js"(exports, module) {
      var overArg = require_overArg();
      var getPrototype = overArg(Object.getPrototypeOf, Object);
      module.exports = getPrototype;
    }
  });

  // node_modules/lodash/_getSymbolsIn.js
  var require_getSymbolsIn = __commonJS({
    "node_modules/lodash/_getSymbolsIn.js"(exports, module) {
      var arrayPush = require_arrayPush();
      var getPrototype = require_getPrototype();
      var getSymbols = require_getSymbols();
      var stubArray = require_stubArray();
      var nativeGetSymbols = Object.getOwnPropertySymbols;
      var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object) {
        var result = [];
        while (object) {
          arrayPush(result, getSymbols(object));
          object = getPrototype(object);
        }
        return result;
      };
      module.exports = getSymbolsIn;
    }
  });

  // node_modules/lodash/_copySymbolsIn.js
  var require_copySymbolsIn = __commonJS({
    "node_modules/lodash/_copySymbolsIn.js"(exports, module) {
      var copyObject = require_copyObject();
      var getSymbolsIn = require_getSymbolsIn();
      function copySymbolsIn(source, object) {
        return copyObject(source, getSymbolsIn(source), object);
      }
      module.exports = copySymbolsIn;
    }
  });

  // node_modules/lodash/_baseGetAllKeys.js
  var require_baseGetAllKeys = __commonJS({
    "node_modules/lodash/_baseGetAllKeys.js"(exports, module) {
      var arrayPush = require_arrayPush();
      var isArray = require_isArray();
      function baseGetAllKeys(object, keysFunc, symbolsFunc) {
        var result = keysFunc(object);
        return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
      }
      module.exports = baseGetAllKeys;
    }
  });

  // node_modules/lodash/_getAllKeys.js
  var require_getAllKeys = __commonJS({
    "node_modules/lodash/_getAllKeys.js"(exports, module) {
      var baseGetAllKeys = require_baseGetAllKeys();
      var getSymbols = require_getSymbols();
      var keys = require_keys();
      function getAllKeys(object) {
        return baseGetAllKeys(object, keys, getSymbols);
      }
      module.exports = getAllKeys;
    }
  });

  // node_modules/lodash/_getAllKeysIn.js
  var require_getAllKeysIn = __commonJS({
    "node_modules/lodash/_getAllKeysIn.js"(exports, module) {
      var baseGetAllKeys = require_baseGetAllKeys();
      var getSymbolsIn = require_getSymbolsIn();
      var keysIn = require_keysIn();
      function getAllKeysIn(object) {
        return baseGetAllKeys(object, keysIn, getSymbolsIn);
      }
      module.exports = getAllKeysIn;
    }
  });

  // node_modules/lodash/_DataView.js
  var require_DataView = __commonJS({
    "node_modules/lodash/_DataView.js"(exports, module) {
      var getNative = require_getNative();
      var root = require_root();
      var DataView = getNative(root, "DataView");
      module.exports = DataView;
    }
  });

  // node_modules/lodash/_Promise.js
  var require_Promise = __commonJS({
    "node_modules/lodash/_Promise.js"(exports, module) {
      var getNative = require_getNative();
      var root = require_root();
      var Promise2 = getNative(root, "Promise");
      module.exports = Promise2;
    }
  });

  // node_modules/lodash/_Set.js
  var require_Set = __commonJS({
    "node_modules/lodash/_Set.js"(exports, module) {
      var getNative = require_getNative();
      var root = require_root();
      var Set2 = getNative(root, "Set");
      module.exports = Set2;
    }
  });

  // node_modules/lodash/_WeakMap.js
  var require_WeakMap = __commonJS({
    "node_modules/lodash/_WeakMap.js"(exports, module) {
      var getNative = require_getNative();
      var root = require_root();
      var WeakMap = getNative(root, "WeakMap");
      module.exports = WeakMap;
    }
  });

  // node_modules/lodash/_getTag.js
  var require_getTag = __commonJS({
    "node_modules/lodash/_getTag.js"(exports, module) {
      var DataView = require_DataView();
      var Map = require_Map();
      var Promise2 = require_Promise();
      var Set2 = require_Set();
      var WeakMap = require_WeakMap();
      var baseGetTag = require_baseGetTag();
      var toSource = require_toSource();
      var mapTag = "[object Map]";
      var objectTag = "[object Object]";
      var promiseTag = "[object Promise]";
      var setTag = "[object Set]";
      var weakMapTag = "[object WeakMap]";
      var dataViewTag = "[object DataView]";
      var dataViewCtorString = toSource(DataView);
      var mapCtorString = toSource(Map);
      var promiseCtorString = toSource(Promise2);
      var setCtorString = toSource(Set2);
      var weakMapCtorString = toSource(WeakMap);
      var getTag = baseGetTag;
      if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag || Map && getTag(new Map()) != mapTag || Promise2 && getTag(Promise2.resolve()) != promiseTag || Set2 && getTag(new Set2()) != setTag || WeakMap && getTag(new WeakMap()) != weakMapTag) {
        getTag = function(value) {
          var result = baseGetTag(value), Ctor = result == objectTag ? value.constructor : void 0, ctorString = Ctor ? toSource(Ctor) : "";
          if (ctorString) {
            switch (ctorString) {
              case dataViewCtorString:
                return dataViewTag;
              case mapCtorString:
                return mapTag;
              case promiseCtorString:
                return promiseTag;
              case setCtorString:
                return setTag;
              case weakMapCtorString:
                return weakMapTag;
            }
          }
          return result;
        };
      }
      module.exports = getTag;
    }
  });

  // node_modules/lodash/_initCloneArray.js
  var require_initCloneArray = __commonJS({
    "node_modules/lodash/_initCloneArray.js"(exports, module) {
      var objectProto = Object.prototype;
      var hasOwnProperty = objectProto.hasOwnProperty;
      function initCloneArray(array) {
        var length = array.length, result = new array.constructor(length);
        if (length && typeof array[0] == "string" && hasOwnProperty.call(array, "index")) {
          result.index = array.index;
          result.input = array.input;
        }
        return result;
      }
      module.exports = initCloneArray;
    }
  });

  // node_modules/lodash/_Uint8Array.js
  var require_Uint8Array = __commonJS({
    "node_modules/lodash/_Uint8Array.js"(exports, module) {
      var root = require_root();
      var Uint8Array2 = root.Uint8Array;
      module.exports = Uint8Array2;
    }
  });

  // node_modules/lodash/_cloneArrayBuffer.js
  var require_cloneArrayBuffer = __commonJS({
    "node_modules/lodash/_cloneArrayBuffer.js"(exports, module) {
      var Uint8Array2 = require_Uint8Array();
      function cloneArrayBuffer(arrayBuffer) {
        var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
        new Uint8Array2(result).set(new Uint8Array2(arrayBuffer));
        return result;
      }
      module.exports = cloneArrayBuffer;
    }
  });

  // node_modules/lodash/_cloneDataView.js
  var require_cloneDataView = __commonJS({
    "node_modules/lodash/_cloneDataView.js"(exports, module) {
      var cloneArrayBuffer = require_cloneArrayBuffer();
      function cloneDataView(dataView, isDeep) {
        var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
        return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
      }
      module.exports = cloneDataView;
    }
  });

  // node_modules/lodash/_cloneRegExp.js
  var require_cloneRegExp = __commonJS({
    "node_modules/lodash/_cloneRegExp.js"(exports, module) {
      var reFlags = /\w*$/;
      function cloneRegExp(regexp) {
        var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
        result.lastIndex = regexp.lastIndex;
        return result;
      }
      module.exports = cloneRegExp;
    }
  });

  // node_modules/lodash/_cloneSymbol.js
  var require_cloneSymbol = __commonJS({
    "node_modules/lodash/_cloneSymbol.js"(exports, module) {
      var Symbol2 = require_Symbol();
      var symbolProto = Symbol2 ? Symbol2.prototype : void 0;
      var symbolValueOf = symbolProto ? symbolProto.valueOf : void 0;
      function cloneSymbol(symbol) {
        return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
      }
      module.exports = cloneSymbol;
    }
  });

  // node_modules/lodash/_cloneTypedArray.js
  var require_cloneTypedArray = __commonJS({
    "node_modules/lodash/_cloneTypedArray.js"(exports, module) {
      var cloneArrayBuffer = require_cloneArrayBuffer();
      function cloneTypedArray(typedArray, isDeep) {
        var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
        return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
      }
      module.exports = cloneTypedArray;
    }
  });

  // node_modules/lodash/_initCloneByTag.js
  var require_initCloneByTag = __commonJS({
    "node_modules/lodash/_initCloneByTag.js"(exports, module) {
      var cloneArrayBuffer = require_cloneArrayBuffer();
      var cloneDataView = require_cloneDataView();
      var cloneRegExp = require_cloneRegExp();
      var cloneSymbol = require_cloneSymbol();
      var cloneTypedArray = require_cloneTypedArray();
      var boolTag = "[object Boolean]";
      var dateTag = "[object Date]";
      var mapTag = "[object Map]";
      var numberTag = "[object Number]";
      var regexpTag = "[object RegExp]";
      var setTag = "[object Set]";
      var stringTag = "[object String]";
      var symbolTag = "[object Symbol]";
      var arrayBufferTag = "[object ArrayBuffer]";
      var dataViewTag = "[object DataView]";
      var float32Tag = "[object Float32Array]";
      var float64Tag = "[object Float64Array]";
      var int8Tag = "[object Int8Array]";
      var int16Tag = "[object Int16Array]";
      var int32Tag = "[object Int32Array]";
      var uint8Tag = "[object Uint8Array]";
      var uint8ClampedTag = "[object Uint8ClampedArray]";
      var uint16Tag = "[object Uint16Array]";
      var uint32Tag = "[object Uint32Array]";
      function initCloneByTag(object, tag, isDeep) {
        var Ctor = object.constructor;
        switch (tag) {
          case arrayBufferTag:
            return cloneArrayBuffer(object);
          case boolTag:
          case dateTag:
            return new Ctor(+object);
          case dataViewTag:
            return cloneDataView(object, isDeep);
          case float32Tag:
          case float64Tag:
          case int8Tag:
          case int16Tag:
          case int32Tag:
          case uint8Tag:
          case uint8ClampedTag:
          case uint16Tag:
          case uint32Tag:
            return cloneTypedArray(object, isDeep);
          case mapTag:
            return new Ctor();
          case numberTag:
          case stringTag:
            return new Ctor(object);
          case regexpTag:
            return cloneRegExp(object);
          case setTag:
            return new Ctor();
          case symbolTag:
            return cloneSymbol(object);
        }
      }
      module.exports = initCloneByTag;
    }
  });

  // node_modules/lodash/_baseCreate.js
  var require_baseCreate = __commonJS({
    "node_modules/lodash/_baseCreate.js"(exports, module) {
      var isObject = require_isObject();
      var objectCreate = Object.create;
      var baseCreate = /* @__PURE__ */ (function() {
        function object() {
        }
        return function(proto) {
          if (!isObject(proto)) {
            return {};
          }
          if (objectCreate) {
            return objectCreate(proto);
          }
          object.prototype = proto;
          var result = new object();
          object.prototype = void 0;
          return result;
        };
      })();
      module.exports = baseCreate;
    }
  });

  // node_modules/lodash/_initCloneObject.js
  var require_initCloneObject = __commonJS({
    "node_modules/lodash/_initCloneObject.js"(exports, module) {
      var baseCreate = require_baseCreate();
      var getPrototype = require_getPrototype();
      var isPrototype = require_isPrototype();
      function initCloneObject(object) {
        return typeof object.constructor == "function" && !isPrototype(object) ? baseCreate(getPrototype(object)) : {};
      }
      module.exports = initCloneObject;
    }
  });

  // node_modules/lodash/_baseIsMap.js
  var require_baseIsMap = __commonJS({
    "node_modules/lodash/_baseIsMap.js"(exports, module) {
      var getTag = require_getTag();
      var isObjectLike = require_isObjectLike();
      var mapTag = "[object Map]";
      function baseIsMap(value) {
        return isObjectLike(value) && getTag(value) == mapTag;
      }
      module.exports = baseIsMap;
    }
  });

  // node_modules/lodash/isMap.js
  var require_isMap = __commonJS({
    "node_modules/lodash/isMap.js"(exports, module) {
      var baseIsMap = require_baseIsMap();
      var baseUnary = require_baseUnary();
      var nodeUtil = require_nodeUtil();
      var nodeIsMap = nodeUtil && nodeUtil.isMap;
      var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;
      module.exports = isMap;
    }
  });

  // node_modules/lodash/_baseIsSet.js
  var require_baseIsSet = __commonJS({
    "node_modules/lodash/_baseIsSet.js"(exports, module) {
      var getTag = require_getTag();
      var isObjectLike = require_isObjectLike();
      var setTag = "[object Set]";
      function baseIsSet(value) {
        return isObjectLike(value) && getTag(value) == setTag;
      }
      module.exports = baseIsSet;
    }
  });

  // node_modules/lodash/isSet.js
  var require_isSet = __commonJS({
    "node_modules/lodash/isSet.js"(exports, module) {
      var baseIsSet = require_baseIsSet();
      var baseUnary = require_baseUnary();
      var nodeUtil = require_nodeUtil();
      var nodeIsSet = nodeUtil && nodeUtil.isSet;
      var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;
      module.exports = isSet;
    }
  });

  // node_modules/lodash/_baseClone.js
  var require_baseClone = __commonJS({
    "node_modules/lodash/_baseClone.js"(exports, module) {
      var Stack = require_Stack();
      var arrayEach = require_arrayEach();
      var assignValue = require_assignValue();
      var baseAssign = require_baseAssign();
      var baseAssignIn = require_baseAssignIn();
      var cloneBuffer = require_cloneBuffer();
      var copyArray = require_copyArray();
      var copySymbols = require_copySymbols();
      var copySymbolsIn = require_copySymbolsIn();
      var getAllKeys = require_getAllKeys();
      var getAllKeysIn = require_getAllKeysIn();
      var getTag = require_getTag();
      var initCloneArray = require_initCloneArray();
      var initCloneByTag = require_initCloneByTag();
      var initCloneObject = require_initCloneObject();
      var isArray = require_isArray();
      var isBuffer = require_isBuffer();
      var isMap = require_isMap();
      var isObject = require_isObject();
      var isSet = require_isSet();
      var keys = require_keys();
      var keysIn = require_keysIn();
      var CLONE_DEEP_FLAG = 1;
      var CLONE_FLAT_FLAG = 2;
      var CLONE_SYMBOLS_FLAG = 4;
      var argsTag = "[object Arguments]";
      var arrayTag = "[object Array]";
      var boolTag = "[object Boolean]";
      var dateTag = "[object Date]";
      var errorTag = "[object Error]";
      var funcTag = "[object Function]";
      var genTag = "[object GeneratorFunction]";
      var mapTag = "[object Map]";
      var numberTag = "[object Number]";
      var objectTag = "[object Object]";
      var regexpTag = "[object RegExp]";
      var setTag = "[object Set]";
      var stringTag = "[object String]";
      var symbolTag = "[object Symbol]";
      var weakMapTag = "[object WeakMap]";
      var arrayBufferTag = "[object ArrayBuffer]";
      var dataViewTag = "[object DataView]";
      var float32Tag = "[object Float32Array]";
      var float64Tag = "[object Float64Array]";
      var int8Tag = "[object Int8Array]";
      var int16Tag = "[object Int16Array]";
      var int32Tag = "[object Int32Array]";
      var uint8Tag = "[object Uint8Array]";
      var uint8ClampedTag = "[object Uint8ClampedArray]";
      var uint16Tag = "[object Uint16Array]";
      var uint32Tag = "[object Uint32Array]";
      var cloneableTags = {};
      cloneableTags[argsTag] = cloneableTags[arrayTag] = cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] = cloneableTags[boolTag] = cloneableTags[dateTag] = cloneableTags[float32Tag] = cloneableTags[float64Tag] = cloneableTags[int8Tag] = cloneableTags[int16Tag] = cloneableTags[int32Tag] = cloneableTags[mapTag] = cloneableTags[numberTag] = cloneableTags[objectTag] = cloneableTags[regexpTag] = cloneableTags[setTag] = cloneableTags[stringTag] = cloneableTags[symbolTag] = cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
      cloneableTags[errorTag] = cloneableTags[funcTag] = cloneableTags[weakMapTag] = false;
      function baseClone(value, bitmask, customizer, key, object, stack) {
        var result, isDeep = bitmask & CLONE_DEEP_FLAG, isFlat = bitmask & CLONE_FLAT_FLAG, isFull = bitmask & CLONE_SYMBOLS_FLAG;
        if (customizer) {
          result = object ? customizer(value, key, object, stack) : customizer(value);
        }
        if (result !== void 0) {
          return result;
        }
        if (!isObject(value)) {
          return value;
        }
        var isArr = isArray(value);
        if (isArr) {
          result = initCloneArray(value);
          if (!isDeep) {
            return copyArray(value, result);
          }
        } else {
          var tag = getTag(value), isFunc = tag == funcTag || tag == genTag;
          if (isBuffer(value)) {
            return cloneBuffer(value, isDeep);
          }
          if (tag == objectTag || tag == argsTag || isFunc && !object) {
            result = isFlat || isFunc ? {} : initCloneObject(value);
            if (!isDeep) {
              return isFlat ? copySymbolsIn(value, baseAssignIn(result, value)) : copySymbols(value, baseAssign(result, value));
            }
          } else {
            if (!cloneableTags[tag]) {
              return object ? value : {};
            }
            result = initCloneByTag(value, tag, isDeep);
          }
        }
        stack || (stack = new Stack());
        var stacked = stack.get(value);
        if (stacked) {
          return stacked;
        }
        stack.set(value, result);
        if (isSet(value)) {
          value.forEach(function(subValue) {
            result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
          });
        } else if (isMap(value)) {
          value.forEach(function(subValue, key2) {
            result.set(key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
          });
        }
        var keysFunc = isFull ? isFlat ? getAllKeysIn : getAllKeys : isFlat ? keysIn : keys;
        var props = isArr ? void 0 : keysFunc(value);
        arrayEach(props || value, function(subValue, key2) {
          if (props) {
            key2 = subValue;
            subValue = value[key2];
          }
          assignValue(result, key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
        });
        return result;
      }
      module.exports = baseClone;
    }
  });

  // node_modules/lodash/clone.js
  var require_clone = __commonJS({
    "node_modules/lodash/clone.js"(exports, module) {
      var baseClone = require_baseClone();
      var CLONE_SYMBOLS_FLAG = 4;
      function clone(value) {
        return baseClone(value, CLONE_SYMBOLS_FLAG);
      }
      module.exports = clone;
    }
  });

  // node_modules/lodash/constant.js
  var require_constant = __commonJS({
    "node_modules/lodash/constant.js"(exports, module) {
      function constant(value) {
        return function() {
          return value;
        };
      }
      module.exports = constant;
    }
  });

  // node_modules/lodash/_createBaseFor.js
  var require_createBaseFor = __commonJS({
    "node_modules/lodash/_createBaseFor.js"(exports, module) {
      function createBaseFor(fromRight) {
        return function(object, iteratee, keysFunc) {
          var index = -1, iterable = Object(object), props = keysFunc(object), length = props.length;
          while (length--) {
            var key = props[fromRight ? length : ++index];
            if (iteratee(iterable[key], key, iterable) === false) {
              break;
            }
          }
          return object;
        };
      }
      module.exports = createBaseFor;
    }
  });

  // node_modules/lodash/_baseFor.js
  var require_baseFor = __commonJS({
    "node_modules/lodash/_baseFor.js"(exports, module) {
      var createBaseFor = require_createBaseFor();
      var baseFor = createBaseFor();
      module.exports = baseFor;
    }
  });

  // node_modules/lodash/_baseForOwn.js
  var require_baseForOwn = __commonJS({
    "node_modules/lodash/_baseForOwn.js"(exports, module) {
      var baseFor = require_baseFor();
      var keys = require_keys();
      function baseForOwn(object, iteratee) {
        return object && baseFor(object, iteratee, keys);
      }
      module.exports = baseForOwn;
    }
  });

  // node_modules/lodash/_createBaseEach.js
  var require_createBaseEach = __commonJS({
    "node_modules/lodash/_createBaseEach.js"(exports, module) {
      var isArrayLike = require_isArrayLike();
      function createBaseEach(eachFunc, fromRight) {
        return function(collection, iteratee) {
          if (collection == null) {
            return collection;
          }
          if (!isArrayLike(collection)) {
            return eachFunc(collection, iteratee);
          }
          var length = collection.length, index = fromRight ? length : -1, iterable = Object(collection);
          while (fromRight ? index-- : ++index < length) {
            if (iteratee(iterable[index], index, iterable) === false) {
              break;
            }
          }
          return collection;
        };
      }
      module.exports = createBaseEach;
    }
  });

  // node_modules/lodash/_baseEach.js
  var require_baseEach = __commonJS({
    "node_modules/lodash/_baseEach.js"(exports, module) {
      var baseForOwn = require_baseForOwn();
      var createBaseEach = require_createBaseEach();
      var baseEach = createBaseEach(baseForOwn);
      module.exports = baseEach;
    }
  });

  // node_modules/lodash/identity.js
  var require_identity = __commonJS({
    "node_modules/lodash/identity.js"(exports, module) {
      function identity(value) {
        return value;
      }
      module.exports = identity;
    }
  });

  // node_modules/lodash/_castFunction.js
  var require_castFunction = __commonJS({
    "node_modules/lodash/_castFunction.js"(exports, module) {
      var identity = require_identity();
      function castFunction(value) {
        return typeof value == "function" ? value : identity;
      }
      module.exports = castFunction;
    }
  });

  // node_modules/lodash/forEach.js
  var require_forEach = __commonJS({
    "node_modules/lodash/forEach.js"(exports, module) {
      var arrayEach = require_arrayEach();
      var baseEach = require_baseEach();
      var castFunction = require_castFunction();
      var isArray = require_isArray();
      function forEach(collection, iteratee) {
        var func = isArray(collection) ? arrayEach : baseEach;
        return func(collection, castFunction(iteratee));
      }
      module.exports = forEach;
    }
  });

  // node_modules/lodash/each.js
  var require_each = __commonJS({
    "node_modules/lodash/each.js"(exports, module) {
      module.exports = require_forEach();
    }
  });

  // node_modules/lodash/_baseFilter.js
  var require_baseFilter = __commonJS({
    "node_modules/lodash/_baseFilter.js"(exports, module) {
      var baseEach = require_baseEach();
      function baseFilter(collection, predicate) {
        var result = [];
        baseEach(collection, function(value, index, collection2) {
          if (predicate(value, index, collection2)) {
            result.push(value);
          }
        });
        return result;
      }
      module.exports = baseFilter;
    }
  });

  // node_modules/lodash/_setCacheAdd.js
  var require_setCacheAdd = __commonJS({
    "node_modules/lodash/_setCacheAdd.js"(exports, module) {
      var HASH_UNDEFINED = "__lodash_hash_undefined__";
      function setCacheAdd(value) {
        this.__data__.set(value, HASH_UNDEFINED);
        return this;
      }
      module.exports = setCacheAdd;
    }
  });

  // node_modules/lodash/_setCacheHas.js
  var require_setCacheHas = __commonJS({
    "node_modules/lodash/_setCacheHas.js"(exports, module) {
      function setCacheHas(value) {
        return this.__data__.has(value);
      }
      module.exports = setCacheHas;
    }
  });

  // node_modules/lodash/_SetCache.js
  var require_SetCache = __commonJS({
    "node_modules/lodash/_SetCache.js"(exports, module) {
      var MapCache = require_MapCache();
      var setCacheAdd = require_setCacheAdd();
      var setCacheHas = require_setCacheHas();
      function SetCache(values) {
        var index = -1, length = values == null ? 0 : values.length;
        this.__data__ = new MapCache();
        while (++index < length) {
          this.add(values[index]);
        }
      }
      SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
      SetCache.prototype.has = setCacheHas;
      module.exports = SetCache;
    }
  });

  // node_modules/lodash/_arraySome.js
  var require_arraySome = __commonJS({
    "node_modules/lodash/_arraySome.js"(exports, module) {
      function arraySome(array, predicate) {
        var index = -1, length = array == null ? 0 : array.length;
        while (++index < length) {
          if (predicate(array[index], index, array)) {
            return true;
          }
        }
        return false;
      }
      module.exports = arraySome;
    }
  });

  // node_modules/lodash/_cacheHas.js
  var require_cacheHas = __commonJS({
    "node_modules/lodash/_cacheHas.js"(exports, module) {
      function cacheHas(cache, key) {
        return cache.has(key);
      }
      module.exports = cacheHas;
    }
  });

  // node_modules/lodash/_equalArrays.js
  var require_equalArrays = __commonJS({
    "node_modules/lodash/_equalArrays.js"(exports, module) {
      var SetCache = require_SetCache();
      var arraySome = require_arraySome();
      var cacheHas = require_cacheHas();
      var COMPARE_PARTIAL_FLAG = 1;
      var COMPARE_UNORDERED_FLAG = 2;
      function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
        var isPartial = bitmask & COMPARE_PARTIAL_FLAG, arrLength = array.length, othLength = other.length;
        if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
          return false;
        }
        var arrStacked = stack.get(array);
        var othStacked = stack.get(other);
        if (arrStacked && othStacked) {
          return arrStacked == other && othStacked == array;
        }
        var index = -1, result = true, seen = bitmask & COMPARE_UNORDERED_FLAG ? new SetCache() : void 0;
        stack.set(array, other);
        stack.set(other, array);
        while (++index < arrLength) {
          var arrValue = array[index], othValue = other[index];
          if (customizer) {
            var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
          }
          if (compared !== void 0) {
            if (compared) {
              continue;
            }
            result = false;
            break;
          }
          if (seen) {
            if (!arraySome(other, function(othValue2, othIndex) {
              if (!cacheHas(seen, othIndex) && (arrValue === othValue2 || equalFunc(arrValue, othValue2, bitmask, customizer, stack))) {
                return seen.push(othIndex);
              }
            })) {
              result = false;
              break;
            }
          } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
            result = false;
            break;
          }
        }
        stack["delete"](array);
        stack["delete"](other);
        return result;
      }
      module.exports = equalArrays;
    }
  });

  // node_modules/lodash/_mapToArray.js
  var require_mapToArray = __commonJS({
    "node_modules/lodash/_mapToArray.js"(exports, module) {
      function mapToArray(map) {
        var index = -1, result = Array(map.size);
        map.forEach(function(value, key) {
          result[++index] = [key, value];
        });
        return result;
      }
      module.exports = mapToArray;
    }
  });

  // node_modules/lodash/_setToArray.js
  var require_setToArray = __commonJS({
    "node_modules/lodash/_setToArray.js"(exports, module) {
      function setToArray(set) {
        var index = -1, result = Array(set.size);
        set.forEach(function(value) {
          result[++index] = value;
        });
        return result;
      }
      module.exports = setToArray;
    }
  });

  // node_modules/lodash/_equalByTag.js
  var require_equalByTag = __commonJS({
    "node_modules/lodash/_equalByTag.js"(exports, module) {
      var Symbol2 = require_Symbol();
      var Uint8Array2 = require_Uint8Array();
      var eq = require_eq();
      var equalArrays = require_equalArrays();
      var mapToArray = require_mapToArray();
      var setToArray = require_setToArray();
      var COMPARE_PARTIAL_FLAG = 1;
      var COMPARE_UNORDERED_FLAG = 2;
      var boolTag = "[object Boolean]";
      var dateTag = "[object Date]";
      var errorTag = "[object Error]";
      var mapTag = "[object Map]";
      var numberTag = "[object Number]";
      var regexpTag = "[object RegExp]";
      var setTag = "[object Set]";
      var stringTag = "[object String]";
      var symbolTag = "[object Symbol]";
      var arrayBufferTag = "[object ArrayBuffer]";
      var dataViewTag = "[object DataView]";
      var symbolProto = Symbol2 ? Symbol2.prototype : void 0;
      var symbolValueOf = symbolProto ? symbolProto.valueOf : void 0;
      function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
        switch (tag) {
          case dataViewTag:
            if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
              return false;
            }
            object = object.buffer;
            other = other.buffer;
          case arrayBufferTag:
            if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array2(object), new Uint8Array2(other))) {
              return false;
            }
            return true;
          case boolTag:
          case dateTag:
          case numberTag:
            return eq(+object, +other);
          case errorTag:
            return object.name == other.name && object.message == other.message;
          case regexpTag:
          case stringTag:
            return object == other + "";
          case mapTag:
            var convert = mapToArray;
          case setTag:
            var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
            convert || (convert = setToArray);
            if (object.size != other.size && !isPartial) {
              return false;
            }
            var stacked = stack.get(object);
            if (stacked) {
              return stacked == other;
            }
            bitmask |= COMPARE_UNORDERED_FLAG;
            stack.set(object, other);
            var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
            stack["delete"](object);
            return result;
          case symbolTag:
            if (symbolValueOf) {
              return symbolValueOf.call(object) == symbolValueOf.call(other);
            }
        }
        return false;
      }
      module.exports = equalByTag;
    }
  });

  // node_modules/lodash/_equalObjects.js
  var require_equalObjects = __commonJS({
    "node_modules/lodash/_equalObjects.js"(exports, module) {
      var getAllKeys = require_getAllKeys();
      var COMPARE_PARTIAL_FLAG = 1;
      var objectProto = Object.prototype;
      var hasOwnProperty = objectProto.hasOwnProperty;
      function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
        var isPartial = bitmask & COMPARE_PARTIAL_FLAG, objProps = getAllKeys(object), objLength = objProps.length, othProps = getAllKeys(other), othLength = othProps.length;
        if (objLength != othLength && !isPartial) {
          return false;
        }
        var index = objLength;
        while (index--) {
          var key = objProps[index];
          if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
            return false;
          }
        }
        var objStacked = stack.get(object);
        var othStacked = stack.get(other);
        if (objStacked && othStacked) {
          return objStacked == other && othStacked == object;
        }
        var result = true;
        stack.set(object, other);
        stack.set(other, object);
        var skipCtor = isPartial;
        while (++index < objLength) {
          key = objProps[index];
          var objValue = object[key], othValue = other[key];
          if (customizer) {
            var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
          }
          if (!(compared === void 0 ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
            result = false;
            break;
          }
          skipCtor || (skipCtor = key == "constructor");
        }
        if (result && !skipCtor) {
          var objCtor = object.constructor, othCtor = other.constructor;
          if (objCtor != othCtor && ("constructor" in object && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
            result = false;
          }
        }
        stack["delete"](object);
        stack["delete"](other);
        return result;
      }
      module.exports = equalObjects;
    }
  });

  // node_modules/lodash/_baseIsEqualDeep.js
  var require_baseIsEqualDeep = __commonJS({
    "node_modules/lodash/_baseIsEqualDeep.js"(exports, module) {
      var Stack = require_Stack();
      var equalArrays = require_equalArrays();
      var equalByTag = require_equalByTag();
      var equalObjects = require_equalObjects();
      var getTag = require_getTag();
      var isArray = require_isArray();
      var isBuffer = require_isBuffer();
      var isTypedArray = require_isTypedArray();
      var COMPARE_PARTIAL_FLAG = 1;
      var argsTag = "[object Arguments]";
      var arrayTag = "[object Array]";
      var objectTag = "[object Object]";
      var objectProto = Object.prototype;
      var hasOwnProperty = objectProto.hasOwnProperty;
      function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
        var objIsArr = isArray(object), othIsArr = isArray(other), objTag = objIsArr ? arrayTag : getTag(object), othTag = othIsArr ? arrayTag : getTag(other);
        objTag = objTag == argsTag ? objectTag : objTag;
        othTag = othTag == argsTag ? objectTag : othTag;
        var objIsObj = objTag == objectTag, othIsObj = othTag == objectTag, isSameTag = objTag == othTag;
        if (isSameTag && isBuffer(object)) {
          if (!isBuffer(other)) {
            return false;
          }
          objIsArr = true;
          objIsObj = false;
        }
        if (isSameTag && !objIsObj) {
          stack || (stack = new Stack());
          return objIsArr || isTypedArray(object) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
        }
        if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
          var objIsWrapped = objIsObj && hasOwnProperty.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");
          if (objIsWrapped || othIsWrapped) {
            var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
            stack || (stack = new Stack());
            return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
          }
        }
        if (!isSameTag) {
          return false;
        }
        stack || (stack = new Stack());
        return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
      }
      module.exports = baseIsEqualDeep;
    }
  });

  // node_modules/lodash/_baseIsEqual.js
  var require_baseIsEqual = __commonJS({
    "node_modules/lodash/_baseIsEqual.js"(exports, module) {
      var baseIsEqualDeep = require_baseIsEqualDeep();
      var isObjectLike = require_isObjectLike();
      function baseIsEqual(value, other, bitmask, customizer, stack) {
        if (value === other) {
          return true;
        }
        if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) {
          return value !== value && other !== other;
        }
        return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
      }
      module.exports = baseIsEqual;
    }
  });

  // node_modules/lodash/_baseIsMatch.js
  var require_baseIsMatch = __commonJS({
    "node_modules/lodash/_baseIsMatch.js"(exports, module) {
      var Stack = require_Stack();
      var baseIsEqual = require_baseIsEqual();
      var COMPARE_PARTIAL_FLAG = 1;
      var COMPARE_UNORDERED_FLAG = 2;
      function baseIsMatch(object, source, matchData, customizer) {
        var index = matchData.length, length = index, noCustomizer = !customizer;
        if (object == null) {
          return !length;
        }
        object = Object(object);
        while (index--) {
          var data = matchData[index];
          if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
            return false;
          }
        }
        while (++index < length) {
          data = matchData[index];
          var key = data[0], objValue = object[key], srcValue = data[1];
          if (noCustomizer && data[2]) {
            if (objValue === void 0 && !(key in object)) {
              return false;
            }
          } else {
            var stack = new Stack();
            if (customizer) {
              var result = customizer(objValue, srcValue, key, object, source, stack);
            }
            if (!(result === void 0 ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG, customizer, stack) : result)) {
              return false;
            }
          }
        }
        return true;
      }
      module.exports = baseIsMatch;
    }
  });

  // node_modules/lodash/_isStrictComparable.js
  var require_isStrictComparable = __commonJS({
    "node_modules/lodash/_isStrictComparable.js"(exports, module) {
      var isObject = require_isObject();
      function isStrictComparable(value) {
        return value === value && !isObject(value);
      }
      module.exports = isStrictComparable;
    }
  });

  // node_modules/lodash/_getMatchData.js
  var require_getMatchData = __commonJS({
    "node_modules/lodash/_getMatchData.js"(exports, module) {
      var isStrictComparable = require_isStrictComparable();
      var keys = require_keys();
      function getMatchData(object) {
        var result = keys(object), length = result.length;
        while (length--) {
          var key = result[length], value = object[key];
          result[length] = [key, value, isStrictComparable(value)];
        }
        return result;
      }
      module.exports = getMatchData;
    }
  });

  // node_modules/lodash/_matchesStrictComparable.js
  var require_matchesStrictComparable = __commonJS({
    "node_modules/lodash/_matchesStrictComparable.js"(exports, module) {
      function matchesStrictComparable(key, srcValue) {
        return function(object) {
          if (object == null) {
            return false;
          }
          return object[key] === srcValue && (srcValue !== void 0 || key in Object(object));
        };
      }
      module.exports = matchesStrictComparable;
    }
  });

  // node_modules/lodash/_baseMatches.js
  var require_baseMatches = __commonJS({
    "node_modules/lodash/_baseMatches.js"(exports, module) {
      var baseIsMatch = require_baseIsMatch();
      var getMatchData = require_getMatchData();
      var matchesStrictComparable = require_matchesStrictComparable();
      function baseMatches(source) {
        var matchData = getMatchData(source);
        if (matchData.length == 1 && matchData[0][2]) {
          return matchesStrictComparable(matchData[0][0], matchData[0][1]);
        }
        return function(object) {
          return object === source || baseIsMatch(object, source, matchData);
        };
      }
      module.exports = baseMatches;
    }
  });

  // node_modules/lodash/isSymbol.js
  var require_isSymbol = __commonJS({
    "node_modules/lodash/isSymbol.js"(exports, module) {
      var baseGetTag = require_baseGetTag();
      var isObjectLike = require_isObjectLike();
      var symbolTag = "[object Symbol]";
      function isSymbol(value) {
        return typeof value == "symbol" || isObjectLike(value) && baseGetTag(value) == symbolTag;
      }
      module.exports = isSymbol;
    }
  });

  // node_modules/lodash/_isKey.js
  var require_isKey = __commonJS({
    "node_modules/lodash/_isKey.js"(exports, module) {
      var isArray = require_isArray();
      var isSymbol = require_isSymbol();
      var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
      var reIsPlainProp = /^\w*$/;
      function isKey(value, object) {
        if (isArray(value)) {
          return false;
        }
        var type = typeof value;
        if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol(value)) {
          return true;
        }
        return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
      }
      module.exports = isKey;
    }
  });

  // node_modules/lodash/memoize.js
  var require_memoize = __commonJS({
    "node_modules/lodash/memoize.js"(exports, module) {
      var MapCache = require_MapCache();
      var FUNC_ERROR_TEXT = "Expected a function";
      function memoize(func, resolver) {
        if (typeof func != "function" || resolver != null && typeof resolver != "function") {
          throw new TypeError(FUNC_ERROR_TEXT);
        }
        var memoized = function() {
          var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
          if (cache.has(key)) {
            return cache.get(key);
          }
          var result = func.apply(this, args);
          memoized.cache = cache.set(key, result) || cache;
          return result;
        };
        memoized.cache = new (memoize.Cache || MapCache)();
        return memoized;
      }
      memoize.Cache = MapCache;
      module.exports = memoize;
    }
  });

  // node_modules/lodash/_memoizeCapped.js
  var require_memoizeCapped = __commonJS({
    "node_modules/lodash/_memoizeCapped.js"(exports, module) {
      var memoize = require_memoize();
      var MAX_MEMOIZE_SIZE = 500;
      function memoizeCapped(func) {
        var result = memoize(func, function(key) {
          if (cache.size === MAX_MEMOIZE_SIZE) {
            cache.clear();
          }
          return key;
        });
        var cache = result.cache;
        return result;
      }
      module.exports = memoizeCapped;
    }
  });

  // node_modules/lodash/_stringToPath.js
  var require_stringToPath = __commonJS({
    "node_modules/lodash/_stringToPath.js"(exports, module) {
      var memoizeCapped = require_memoizeCapped();
      var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
      var reEscapeChar = /\\(\\)?/g;
      var stringToPath = memoizeCapped(function(string) {
        var result = [];
        if (string.charCodeAt(0) === 46) {
          result.push("");
        }
        string.replace(rePropName, function(match, number, quote, subString) {
          result.push(quote ? subString.replace(reEscapeChar, "$1") : number || match);
        });
        return result;
      });
      module.exports = stringToPath;
    }
  });

  // node_modules/lodash/_arrayMap.js
  var require_arrayMap = __commonJS({
    "node_modules/lodash/_arrayMap.js"(exports, module) {
      function arrayMap(array, iteratee) {
        var index = -1, length = array == null ? 0 : array.length, result = Array(length);
        while (++index < length) {
          result[index] = iteratee(array[index], index, array);
        }
        return result;
      }
      module.exports = arrayMap;
    }
  });

  // node_modules/lodash/_baseToString.js
  var require_baseToString = __commonJS({
    "node_modules/lodash/_baseToString.js"(exports, module) {
      var Symbol2 = require_Symbol();
      var arrayMap = require_arrayMap();
      var isArray = require_isArray();
      var isSymbol = require_isSymbol();
      var INFINITY = 1 / 0;
      var symbolProto = Symbol2 ? Symbol2.prototype : void 0;
      var symbolToString = symbolProto ? symbolProto.toString : void 0;
      function baseToString(value) {
        if (typeof value == "string") {
          return value;
        }
        if (isArray(value)) {
          return arrayMap(value, baseToString) + "";
        }
        if (isSymbol(value)) {
          return symbolToString ? symbolToString.call(value) : "";
        }
        var result = value + "";
        return result == "0" && 1 / value == -INFINITY ? "-0" : result;
      }
      module.exports = baseToString;
    }
  });

  // node_modules/lodash/toString.js
  var require_toString = __commonJS({
    "node_modules/lodash/toString.js"(exports, module) {
      var baseToString = require_baseToString();
      function toString(value) {
        return value == null ? "" : baseToString(value);
      }
      module.exports = toString;
    }
  });

  // node_modules/lodash/_castPath.js
  var require_castPath = __commonJS({
    "node_modules/lodash/_castPath.js"(exports, module) {
      var isArray = require_isArray();
      var isKey = require_isKey();
      var stringToPath = require_stringToPath();
      var toString = require_toString();
      function castPath(value, object) {
        if (isArray(value)) {
          return value;
        }
        return isKey(value, object) ? [value] : stringToPath(toString(value));
      }
      module.exports = castPath;
    }
  });

  // node_modules/lodash/_toKey.js
  var require_toKey = __commonJS({
    "node_modules/lodash/_toKey.js"(exports, module) {
      var isSymbol = require_isSymbol();
      var INFINITY = 1 / 0;
      function toKey(value) {
        if (typeof value == "string" || isSymbol(value)) {
          return value;
        }
        var result = value + "";
        return result == "0" && 1 / value == -INFINITY ? "-0" : result;
      }
      module.exports = toKey;
    }
  });

  // node_modules/lodash/_baseGet.js
  var require_baseGet = __commonJS({
    "node_modules/lodash/_baseGet.js"(exports, module) {
      var castPath = require_castPath();
      var toKey = require_toKey();
      function baseGet(object, path) {
        path = castPath(path, object);
        var index = 0, length = path.length;
        while (object != null && index < length) {
          object = object[toKey(path[index++])];
        }
        return index && index == length ? object : void 0;
      }
      module.exports = baseGet;
    }
  });

  // node_modules/lodash/get.js
  var require_get = __commonJS({
    "node_modules/lodash/get.js"(exports, module) {
      var baseGet = require_baseGet();
      function get(object, path, defaultValue) {
        var result = object == null ? void 0 : baseGet(object, path);
        return result === void 0 ? defaultValue : result;
      }
      module.exports = get;
    }
  });

  // node_modules/lodash/_baseHasIn.js
  var require_baseHasIn = __commonJS({
    "node_modules/lodash/_baseHasIn.js"(exports, module) {
      function baseHasIn(object, key) {
        return object != null && key in Object(object);
      }
      module.exports = baseHasIn;
    }
  });

  // node_modules/lodash/_hasPath.js
  var require_hasPath = __commonJS({
    "node_modules/lodash/_hasPath.js"(exports, module) {
      var castPath = require_castPath();
      var isArguments = require_isArguments();
      var isArray = require_isArray();
      var isIndex = require_isIndex();
      var isLength = require_isLength();
      var toKey = require_toKey();
      function hasPath(object, path, hasFunc) {
        path = castPath(path, object);
        var index = -1, length = path.length, result = false;
        while (++index < length) {
          var key = toKey(path[index]);
          if (!(result = object != null && hasFunc(object, key))) {
            break;
          }
          object = object[key];
        }
        if (result || ++index != length) {
          return result;
        }
        length = object == null ? 0 : object.length;
        return !!length && isLength(length) && isIndex(key, length) && (isArray(object) || isArguments(object));
      }
      module.exports = hasPath;
    }
  });

  // node_modules/lodash/hasIn.js
  var require_hasIn = __commonJS({
    "node_modules/lodash/hasIn.js"(exports, module) {
      var baseHasIn = require_baseHasIn();
      var hasPath = require_hasPath();
      function hasIn(object, path) {
        return object != null && hasPath(object, path, baseHasIn);
      }
      module.exports = hasIn;
    }
  });

  // node_modules/lodash/_baseMatchesProperty.js
  var require_baseMatchesProperty = __commonJS({
    "node_modules/lodash/_baseMatchesProperty.js"(exports, module) {
      var baseIsEqual = require_baseIsEqual();
      var get = require_get();
      var hasIn = require_hasIn();
      var isKey = require_isKey();
      var isStrictComparable = require_isStrictComparable();
      var matchesStrictComparable = require_matchesStrictComparable();
      var toKey = require_toKey();
      var COMPARE_PARTIAL_FLAG = 1;
      var COMPARE_UNORDERED_FLAG = 2;
      function baseMatchesProperty(path, srcValue) {
        if (isKey(path) && isStrictComparable(srcValue)) {
          return matchesStrictComparable(toKey(path), srcValue);
        }
        return function(object) {
          var objValue = get(object, path);
          return objValue === void 0 && objValue === srcValue ? hasIn(object, path) : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
        };
      }
      module.exports = baseMatchesProperty;
    }
  });

  // node_modules/lodash/_baseProperty.js
  var require_baseProperty = __commonJS({
    "node_modules/lodash/_baseProperty.js"(exports, module) {
      function baseProperty(key) {
        return function(object) {
          return object == null ? void 0 : object[key];
        };
      }
      module.exports = baseProperty;
    }
  });

  // node_modules/lodash/_basePropertyDeep.js
  var require_basePropertyDeep = __commonJS({
    "node_modules/lodash/_basePropertyDeep.js"(exports, module) {
      var baseGet = require_baseGet();
      function basePropertyDeep(path) {
        return function(object) {
          return baseGet(object, path);
        };
      }
      module.exports = basePropertyDeep;
    }
  });

  // node_modules/lodash/property.js
  var require_property = __commonJS({
    "node_modules/lodash/property.js"(exports, module) {
      var baseProperty = require_baseProperty();
      var basePropertyDeep = require_basePropertyDeep();
      var isKey = require_isKey();
      var toKey = require_toKey();
      function property(path) {
        return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
      }
      module.exports = property;
    }
  });

  // node_modules/lodash/_baseIteratee.js
  var require_baseIteratee = __commonJS({
    "node_modules/lodash/_baseIteratee.js"(exports, module) {
      var baseMatches = require_baseMatches();
      var baseMatchesProperty = require_baseMatchesProperty();
      var identity = require_identity();
      var isArray = require_isArray();
      var property = require_property();
      function baseIteratee(value) {
        if (typeof value == "function") {
          return value;
        }
        if (value == null) {
          return identity;
        }
        if (typeof value == "object") {
          return isArray(value) ? baseMatchesProperty(value[0], value[1]) : baseMatches(value);
        }
        return property(value);
      }
      module.exports = baseIteratee;
    }
  });

  // node_modules/lodash/filter.js
  var require_filter = __commonJS({
    "node_modules/lodash/filter.js"(exports, module) {
      var arrayFilter = require_arrayFilter();
      var baseFilter = require_baseFilter();
      var baseIteratee = require_baseIteratee();
      var isArray = require_isArray();
      function filter(collection, predicate) {
        var func = isArray(collection) ? arrayFilter : baseFilter;
        return func(collection, baseIteratee(predicate, 3));
      }
      module.exports = filter;
    }
  });

  // node_modules/lodash/_baseHas.js
  var require_baseHas = __commonJS({
    "node_modules/lodash/_baseHas.js"(exports, module) {
      var objectProto = Object.prototype;
      var hasOwnProperty = objectProto.hasOwnProperty;
      function baseHas(object, key) {
        return object != null && hasOwnProperty.call(object, key);
      }
      module.exports = baseHas;
    }
  });

  // node_modules/lodash/has.js
  var require_has = __commonJS({
    "node_modules/lodash/has.js"(exports, module) {
      var baseHas = require_baseHas();
      var hasPath = require_hasPath();
      function has(object, path) {
        return object != null && hasPath(object, path, baseHas);
      }
      module.exports = has;
    }
  });

  // node_modules/lodash/isEmpty.js
  var require_isEmpty = __commonJS({
    "node_modules/lodash/isEmpty.js"(exports, module) {
      var baseKeys = require_baseKeys();
      var getTag = require_getTag();
      var isArguments = require_isArguments();
      var isArray = require_isArray();
      var isArrayLike = require_isArrayLike();
      var isBuffer = require_isBuffer();
      var isPrototype = require_isPrototype();
      var isTypedArray = require_isTypedArray();
      var mapTag = "[object Map]";
      var setTag = "[object Set]";
      var objectProto = Object.prototype;
      var hasOwnProperty = objectProto.hasOwnProperty;
      function isEmpty(value) {
        if (value == null) {
          return true;
        }
        if (isArrayLike(value) && (isArray(value) || typeof value == "string" || typeof value.splice == "function" || isBuffer(value) || isTypedArray(value) || isArguments(value))) {
          return !value.length;
        }
        var tag = getTag(value);
        if (tag == mapTag || tag == setTag) {
          return !value.size;
        }
        if (isPrototype(value)) {
          return !baseKeys(value).length;
        }
        for (var key in value) {
          if (hasOwnProperty.call(value, key)) {
            return false;
          }
        }
        return true;
      }
      module.exports = isEmpty;
    }
  });

  // node_modules/lodash/isUndefined.js
  var require_isUndefined = __commonJS({
    "node_modules/lodash/isUndefined.js"(exports, module) {
      function isUndefined(value) {
        return value === void 0;
      }
      module.exports = isUndefined;
    }
  });

  // node_modules/lodash/_baseMap.js
  var require_baseMap = __commonJS({
    "node_modules/lodash/_baseMap.js"(exports, module) {
      var baseEach = require_baseEach();
      var isArrayLike = require_isArrayLike();
      function baseMap(collection, iteratee) {
        var index = -1, result = isArrayLike(collection) ? Array(collection.length) : [];
        baseEach(collection, function(value, key, collection2) {
          result[++index] = iteratee(value, key, collection2);
        });
        return result;
      }
      module.exports = baseMap;
    }
  });

  // node_modules/lodash/map.js
  var require_map = __commonJS({
    "node_modules/lodash/map.js"(exports, module) {
      var arrayMap = require_arrayMap();
      var baseIteratee = require_baseIteratee();
      var baseMap = require_baseMap();
      var isArray = require_isArray();
      function map(collection, iteratee) {
        var func = isArray(collection) ? arrayMap : baseMap;
        return func(collection, baseIteratee(iteratee, 3));
      }
      module.exports = map;
    }
  });

  // node_modules/lodash/_arrayReduce.js
  var require_arrayReduce = __commonJS({
    "node_modules/lodash/_arrayReduce.js"(exports, module) {
      function arrayReduce(array, iteratee, accumulator, initAccum) {
        var index = -1, length = array == null ? 0 : array.length;
        if (initAccum && length) {
          accumulator = array[++index];
        }
        while (++index < length) {
          accumulator = iteratee(accumulator, array[index], index, array);
        }
        return accumulator;
      }
      module.exports = arrayReduce;
    }
  });

  // node_modules/lodash/_baseReduce.js
  var require_baseReduce = __commonJS({
    "node_modules/lodash/_baseReduce.js"(exports, module) {
      function baseReduce(collection, iteratee, accumulator, initAccum, eachFunc) {
        eachFunc(collection, function(value, index, collection2) {
          accumulator = initAccum ? (initAccum = false, value) : iteratee(accumulator, value, index, collection2);
        });
        return accumulator;
      }
      module.exports = baseReduce;
    }
  });

  // node_modules/lodash/reduce.js
  var require_reduce = __commonJS({
    "node_modules/lodash/reduce.js"(exports, module) {
      var arrayReduce = require_arrayReduce();
      var baseEach = require_baseEach();
      var baseIteratee = require_baseIteratee();
      var baseReduce = require_baseReduce();
      var isArray = require_isArray();
      function reduce(collection, iteratee, accumulator) {
        var func = isArray(collection) ? arrayReduce : baseReduce, initAccum = arguments.length < 3;
        return func(collection, baseIteratee(iteratee, 4), accumulator, initAccum, baseEach);
      }
      module.exports = reduce;
    }
  });

  // node_modules/lodash/isString.js
  var require_isString = __commonJS({
    "node_modules/lodash/isString.js"(exports, module) {
      var baseGetTag = require_baseGetTag();
      var isArray = require_isArray();
      var isObjectLike = require_isObjectLike();
      var stringTag = "[object String]";
      function isString(value) {
        return typeof value == "string" || !isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag;
      }
      module.exports = isString;
    }
  });

  // node_modules/lodash/_asciiSize.js
  var require_asciiSize = __commonJS({
    "node_modules/lodash/_asciiSize.js"(exports, module) {
      var baseProperty = require_baseProperty();
      var asciiSize = baseProperty("length");
      module.exports = asciiSize;
    }
  });

  // node_modules/lodash/_hasUnicode.js
  var require_hasUnicode = __commonJS({
    "node_modules/lodash/_hasUnicode.js"(exports, module) {
      var rsAstralRange = "\\ud800-\\udfff";
      var rsComboMarksRange = "\\u0300-\\u036f";
      var reComboHalfMarksRange = "\\ufe20-\\ufe2f";
      var rsComboSymbolsRange = "\\u20d0-\\u20ff";
      var rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange;
      var rsVarRange = "\\ufe0e\\ufe0f";
      var rsZWJ = "\\u200d";
      var reHasUnicode = RegExp("[" + rsZWJ + rsAstralRange + rsComboRange + rsVarRange + "]");
      function hasUnicode(string) {
        return reHasUnicode.test(string);
      }
      module.exports = hasUnicode;
    }
  });

  // node_modules/lodash/_unicodeSize.js
  var require_unicodeSize = __commonJS({
    "node_modules/lodash/_unicodeSize.js"(exports, module) {
      var rsAstralRange = "\\ud800-\\udfff";
      var rsComboMarksRange = "\\u0300-\\u036f";
      var reComboHalfMarksRange = "\\ufe20-\\ufe2f";
      var rsComboSymbolsRange = "\\u20d0-\\u20ff";
      var rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange;
      var rsVarRange = "\\ufe0e\\ufe0f";
      var rsAstral = "[" + rsAstralRange + "]";
      var rsCombo = "[" + rsComboRange + "]";
      var rsFitz = "\\ud83c[\\udffb-\\udfff]";
      var rsModifier = "(?:" + rsCombo + "|" + rsFitz + ")";
      var rsNonAstral = "[^" + rsAstralRange + "]";
      var rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}";
      var rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]";
      var rsZWJ = "\\u200d";
      var reOptMod = rsModifier + "?";
      var rsOptVar = "[" + rsVarRange + "]?";
      var rsOptJoin = "(?:" + rsZWJ + "(?:" + [rsNonAstral, rsRegional, rsSurrPair].join("|") + ")" + rsOptVar + reOptMod + ")*";
      var rsSeq = rsOptVar + reOptMod + rsOptJoin;
      var rsSymbol = "(?:" + [rsNonAstral + rsCombo + "?", rsCombo, rsRegional, rsSurrPair, rsAstral].join("|") + ")";
      var reUnicode = RegExp(rsFitz + "(?=" + rsFitz + ")|" + rsSymbol + rsSeq, "g");
      function unicodeSize(string) {
        var result = reUnicode.lastIndex = 0;
        while (reUnicode.test(string)) {
          ++result;
        }
        return result;
      }
      module.exports = unicodeSize;
    }
  });

  // node_modules/lodash/_stringSize.js
  var require_stringSize = __commonJS({
    "node_modules/lodash/_stringSize.js"(exports, module) {
      var asciiSize = require_asciiSize();
      var hasUnicode = require_hasUnicode();
      var unicodeSize = require_unicodeSize();
      function stringSize(string) {
        return hasUnicode(string) ? unicodeSize(string) : asciiSize(string);
      }
      module.exports = stringSize;
    }
  });

  // node_modules/lodash/size.js
  var require_size = __commonJS({
    "node_modules/lodash/size.js"(exports, module) {
      var baseKeys = require_baseKeys();
      var getTag = require_getTag();
      var isArrayLike = require_isArrayLike();
      var isString = require_isString();
      var stringSize = require_stringSize();
      var mapTag = "[object Map]";
      var setTag = "[object Set]";
      function size(collection) {
        if (collection == null) {
          return 0;
        }
        if (isArrayLike(collection)) {
          return isString(collection) ? stringSize(collection) : collection.length;
        }
        var tag = getTag(collection);
        if (tag == mapTag || tag == setTag) {
          return collection.size;
        }
        return baseKeys(collection).length;
      }
      module.exports = size;
    }
  });

  // node_modules/lodash/transform.js
  var require_transform = __commonJS({
    "node_modules/lodash/transform.js"(exports, module) {
      var arrayEach = require_arrayEach();
      var baseCreate = require_baseCreate();
      var baseForOwn = require_baseForOwn();
      var baseIteratee = require_baseIteratee();
      var getPrototype = require_getPrototype();
      var isArray = require_isArray();
      var isBuffer = require_isBuffer();
      var isFunction = require_isFunction();
      var isObject = require_isObject();
      var isTypedArray = require_isTypedArray();
      function transform(object, iteratee, accumulator) {
        var isArr = isArray(object), isArrLike = isArr || isBuffer(object) || isTypedArray(object);
        iteratee = baseIteratee(iteratee, 4);
        if (accumulator == null) {
          var Ctor = object && object.constructor;
          if (isArrLike) {
            accumulator = isArr ? new Ctor() : [];
          } else if (isObject(object)) {
            accumulator = isFunction(Ctor) ? baseCreate(getPrototype(object)) : {};
          } else {
            accumulator = {};
          }
        }
        (isArrLike ? arrayEach : baseForOwn)(object, function(value, index, object2) {
          return iteratee(accumulator, value, index, object2);
        });
        return accumulator;
      }
      module.exports = transform;
    }
  });

  // node_modules/lodash/_isFlattenable.js
  var require_isFlattenable = __commonJS({
    "node_modules/lodash/_isFlattenable.js"(exports, module) {
      var Symbol2 = require_Symbol();
      var isArguments = require_isArguments();
      var isArray = require_isArray();
      var spreadableSymbol = Symbol2 ? Symbol2.isConcatSpreadable : void 0;
      function isFlattenable(value) {
        return isArray(value) || isArguments(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);
      }
      module.exports = isFlattenable;
    }
  });

  // node_modules/lodash/_baseFlatten.js
  var require_baseFlatten = __commonJS({
    "node_modules/lodash/_baseFlatten.js"(exports, module) {
      var arrayPush = require_arrayPush();
      var isFlattenable = require_isFlattenable();
      function baseFlatten(array, depth, predicate, isStrict, result) {
        var index = -1, length = array.length;
        predicate || (predicate = isFlattenable);
        result || (result = []);
        while (++index < length) {
          var value = array[index];
          if (depth > 0 && predicate(value)) {
            if (depth > 1) {
              baseFlatten(value, depth - 1, predicate, isStrict, result);
            } else {
              arrayPush(result, value);
            }
          } else if (!isStrict) {
            result[result.length] = value;
          }
        }
        return result;
      }
      module.exports = baseFlatten;
    }
  });

  // node_modules/lodash/_apply.js
  var require_apply = __commonJS({
    "node_modules/lodash/_apply.js"(exports, module) {
      function apply(func, thisArg, args) {
        switch (args.length) {
          case 0:
            return func.call(thisArg);
          case 1:
            return func.call(thisArg, args[0]);
          case 2:
            return func.call(thisArg, args[0], args[1]);
          case 3:
            return func.call(thisArg, args[0], args[1], args[2]);
        }
        return func.apply(thisArg, args);
      }
      module.exports = apply;
    }
  });

  // node_modules/lodash/_overRest.js
  var require_overRest = __commonJS({
    "node_modules/lodash/_overRest.js"(exports, module) {
      var apply = require_apply();
      var nativeMax = Math.max;
      function overRest(func, start, transform) {
        start = nativeMax(start === void 0 ? func.length - 1 : start, 0);
        return function() {
          var args = arguments, index = -1, length = nativeMax(args.length - start, 0), array = Array(length);
          while (++index < length) {
            array[index] = args[start + index];
          }
          index = -1;
          var otherArgs = Array(start + 1);
          while (++index < start) {
            otherArgs[index] = args[index];
          }
          otherArgs[start] = transform(array);
          return apply(func, this, otherArgs);
        };
      }
      module.exports = overRest;
    }
  });

  // node_modules/lodash/_baseSetToString.js
  var require_baseSetToString = __commonJS({
    "node_modules/lodash/_baseSetToString.js"(exports, module) {
      var constant = require_constant();
      var defineProperty = require_defineProperty();
      var identity = require_identity();
      var baseSetToString = !defineProperty ? identity : function(func, string) {
        return defineProperty(func, "toString", {
          "configurable": true,
          "enumerable": false,
          "value": constant(string),
          "writable": true
        });
      };
      module.exports = baseSetToString;
    }
  });

  // node_modules/lodash/_shortOut.js
  var require_shortOut = __commonJS({
    "node_modules/lodash/_shortOut.js"(exports, module) {
      var HOT_COUNT = 800;
      var HOT_SPAN = 16;
      var nativeNow = Date.now;
      function shortOut(func) {
        var count = 0, lastCalled = 0;
        return function() {
          var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
          lastCalled = stamp;
          if (remaining > 0) {
            if (++count >= HOT_COUNT) {
              return arguments[0];
            }
          } else {
            count = 0;
          }
          return func.apply(void 0, arguments);
        };
      }
      module.exports = shortOut;
    }
  });

  // node_modules/lodash/_setToString.js
  var require_setToString = __commonJS({
    "node_modules/lodash/_setToString.js"(exports, module) {
      var baseSetToString = require_baseSetToString();
      var shortOut = require_shortOut();
      var setToString = shortOut(baseSetToString);
      module.exports = setToString;
    }
  });

  // node_modules/lodash/_baseRest.js
  var require_baseRest = __commonJS({
    "node_modules/lodash/_baseRest.js"(exports, module) {
      var identity = require_identity();
      var overRest = require_overRest();
      var setToString = require_setToString();
      function baseRest(func, start) {
        return setToString(overRest(func, start, identity), func + "");
      }
      module.exports = baseRest;
    }
  });

  // node_modules/lodash/_baseFindIndex.js
  var require_baseFindIndex = __commonJS({
    "node_modules/lodash/_baseFindIndex.js"(exports, module) {
      function baseFindIndex(array, predicate, fromIndex, fromRight) {
        var length = array.length, index = fromIndex + (fromRight ? 1 : -1);
        while (fromRight ? index-- : ++index < length) {
          if (predicate(array[index], index, array)) {
            return index;
          }
        }
        return -1;
      }
      module.exports = baseFindIndex;
    }
  });

  // node_modules/lodash/_baseIsNaN.js
  var require_baseIsNaN = __commonJS({
    "node_modules/lodash/_baseIsNaN.js"(exports, module) {
      function baseIsNaN(value) {
        return value !== value;
      }
      module.exports = baseIsNaN;
    }
  });

  // node_modules/lodash/_strictIndexOf.js
  var require_strictIndexOf = __commonJS({
    "node_modules/lodash/_strictIndexOf.js"(exports, module) {
      function strictIndexOf(array, value, fromIndex) {
        var index = fromIndex - 1, length = array.length;
        while (++index < length) {
          if (array[index] === value) {
            return index;
          }
        }
        return -1;
      }
      module.exports = strictIndexOf;
    }
  });

  // node_modules/lodash/_baseIndexOf.js
  var require_baseIndexOf = __commonJS({
    "node_modules/lodash/_baseIndexOf.js"(exports, module) {
      var baseFindIndex = require_baseFindIndex();
      var baseIsNaN = require_baseIsNaN();
      var strictIndexOf = require_strictIndexOf();
      function baseIndexOf(array, value, fromIndex) {
        return value === value ? strictIndexOf(array, value, fromIndex) : baseFindIndex(array, baseIsNaN, fromIndex);
      }
      module.exports = baseIndexOf;
    }
  });

  // node_modules/lodash/_arrayIncludes.js
  var require_arrayIncludes = __commonJS({
    "node_modules/lodash/_arrayIncludes.js"(exports, module) {
      var baseIndexOf = require_baseIndexOf();
      function arrayIncludes(array, value) {
        var length = array == null ? 0 : array.length;
        return !!length && baseIndexOf(array, value, 0) > -1;
      }
      module.exports = arrayIncludes;
    }
  });

  // node_modules/lodash/_arrayIncludesWith.js
  var require_arrayIncludesWith = __commonJS({
    "node_modules/lodash/_arrayIncludesWith.js"(exports, module) {
      function arrayIncludesWith(array, value, comparator) {
        var index = -1, length = array == null ? 0 : array.length;
        while (++index < length) {
          if (comparator(value, array[index])) {
            return true;
          }
        }
        return false;
      }
      module.exports = arrayIncludesWith;
    }
  });

  // node_modules/lodash/noop.js
  var require_noop = __commonJS({
    "node_modules/lodash/noop.js"(exports, module) {
      function noop() {
      }
      module.exports = noop;
    }
  });

  // node_modules/lodash/_createSet.js
  var require_createSet = __commonJS({
    "node_modules/lodash/_createSet.js"(exports, module) {
      var Set2 = require_Set();
      var noop = require_noop();
      var setToArray = require_setToArray();
      var INFINITY = 1 / 0;
      var createSet = !(Set2 && 1 / setToArray(new Set2([, -0]))[1] == INFINITY) ? noop : function(values) {
        return new Set2(values);
      };
      module.exports = createSet;
    }
  });

  // node_modules/lodash/_baseUniq.js
  var require_baseUniq = __commonJS({
    "node_modules/lodash/_baseUniq.js"(exports, module) {
      var SetCache = require_SetCache();
      var arrayIncludes = require_arrayIncludes();
      var arrayIncludesWith = require_arrayIncludesWith();
      var cacheHas = require_cacheHas();
      var createSet = require_createSet();
      var setToArray = require_setToArray();
      var LARGE_ARRAY_SIZE = 200;
      function baseUniq(array, iteratee, comparator) {
        var index = -1, includes = arrayIncludes, length = array.length, isCommon = true, result = [], seen = result;
        if (comparator) {
          isCommon = false;
          includes = arrayIncludesWith;
        } else if (length >= LARGE_ARRAY_SIZE) {
          var set = iteratee ? null : createSet(array);
          if (set) {
            return setToArray(set);
          }
          isCommon = false;
          includes = cacheHas;
          seen = new SetCache();
        } else {
          seen = iteratee ? [] : result;
        }
        outer:
          while (++index < length) {
            var value = array[index], computed = iteratee ? iteratee(value) : value;
            value = comparator || value !== 0 ? value : 0;
            if (isCommon && computed === computed) {
              var seenIndex = seen.length;
              while (seenIndex--) {
                if (seen[seenIndex] === computed) {
                  continue outer;
                }
              }
              if (iteratee) {
                seen.push(computed);
              }
              result.push(value);
            } else if (!includes(seen, computed, comparator)) {
              if (seen !== result) {
                seen.push(computed);
              }
              result.push(value);
            }
          }
        return result;
      }
      module.exports = baseUniq;
    }
  });

  // node_modules/lodash/isArrayLikeObject.js
  var require_isArrayLikeObject = __commonJS({
    "node_modules/lodash/isArrayLikeObject.js"(exports, module) {
      var isArrayLike = require_isArrayLike();
      var isObjectLike = require_isObjectLike();
      function isArrayLikeObject(value) {
        return isObjectLike(value) && isArrayLike(value);
      }
      module.exports = isArrayLikeObject;
    }
  });

  // node_modules/lodash/union.js
  var require_union = __commonJS({
    "node_modules/lodash/union.js"(exports, module) {
      var baseFlatten = require_baseFlatten();
      var baseRest = require_baseRest();
      var baseUniq = require_baseUniq();
      var isArrayLikeObject = require_isArrayLikeObject();
      var union = baseRest(function(arrays) {
        return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true));
      });
      module.exports = union;
    }
  });

  // node_modules/lodash/_baseValues.js
  var require_baseValues = __commonJS({
    "node_modules/lodash/_baseValues.js"(exports, module) {
      var arrayMap = require_arrayMap();
      function baseValues(object, props) {
        return arrayMap(props, function(key) {
          return object[key];
        });
      }
      module.exports = baseValues;
    }
  });

  // node_modules/lodash/values.js
  var require_values = __commonJS({
    "node_modules/lodash/values.js"(exports, module) {
      var baseValues = require_baseValues();
      var keys = require_keys();
      function values(object) {
        return object == null ? [] : baseValues(object, keys(object));
      }
      module.exports = values;
    }
  });

  // node_modules/graphlib/lib/lodash.js
  var require_lodash = __commonJS({
    "node_modules/graphlib/lib/lodash.js"(exports, module) {
      var lodash;
      if (typeof __require === "function") {
        try {
          lodash = {
            clone: require_clone(),
            constant: require_constant(),
            each: require_each(),
            filter: require_filter(),
            has: require_has(),
            isArray: require_isArray(),
            isEmpty: require_isEmpty(),
            isFunction: require_isFunction(),
            isUndefined: require_isUndefined(),
            keys: require_keys(),
            map: require_map(),
            reduce: require_reduce(),
            size: require_size(),
            transform: require_transform(),
            union: require_union(),
            values: require_values()
          };
        } catch (e) {
        }
      }
      if (!lodash) {
        lodash = window._;
      }
      module.exports = lodash;
    }
  });

  // node_modules/graphlib/lib/graph.js
  var require_graph = __commonJS({
    "node_modules/graphlib/lib/graph.js"(exports, module) {
      "use strict";
      var _ = require_lodash();
      module.exports = Graph;
      var DEFAULT_EDGE_NAME = "\0";
      var GRAPH_NODE = "\0";
      var EDGE_KEY_DELIM = "";
      function Graph(opts) {
        this._isDirected = _.has(opts, "directed") ? opts.directed : true;
        this._isMultigraph = _.has(opts, "multigraph") ? opts.multigraph : false;
        this._isCompound = _.has(opts, "compound") ? opts.compound : false;
        this._label = void 0;
        this._defaultNodeLabelFn = _.constant(void 0);
        this._defaultEdgeLabelFn = _.constant(void 0);
        this._nodes = {};
        if (this._isCompound) {
          this._parent = {};
          this._children = {};
          this._children[GRAPH_NODE] = {};
        }
        this._in = {};
        this._preds = {};
        this._out = {};
        this._sucs = {};
        this._edgeObjs = {};
        this._edgeLabels = {};
      }
      Graph.prototype._nodeCount = 0;
      Graph.prototype._edgeCount = 0;
      Graph.prototype.isDirected = function() {
        return this._isDirected;
      };
      Graph.prototype.isMultigraph = function() {
        return this._isMultigraph;
      };
      Graph.prototype.isCompound = function() {
        return this._isCompound;
      };
      Graph.prototype.setGraph = function(label) {
        this._label = label;
        return this;
      };
      Graph.prototype.graph = function() {
        return this._label;
      };
      Graph.prototype.setDefaultNodeLabel = function(newDefault) {
        if (!_.isFunction(newDefault)) {
          newDefault = _.constant(newDefault);
        }
        this._defaultNodeLabelFn = newDefault;
        return this;
      };
      Graph.prototype.nodeCount = function() {
        return this._nodeCount;
      };
      Graph.prototype.nodes = function() {
        return _.keys(this._nodes);
      };
      Graph.prototype.sources = function() {
        var self2 = this;
        return _.filter(this.nodes(), function(v) {
          return _.isEmpty(self2._in[v]);
        });
      };
      Graph.prototype.sinks = function() {
        var self2 = this;
        return _.filter(this.nodes(), function(v) {
          return _.isEmpty(self2._out[v]);
        });
      };
      Graph.prototype.setNodes = function(vs, value) {
        var args = arguments;
        var self2 = this;
        _.each(vs, function(v) {
          if (args.length > 1) {
            self2.setNode(v, value);
          } else {
            self2.setNode(v);
          }
        });
        return this;
      };
      Graph.prototype.setNode = function(v, value) {
        if (_.has(this._nodes, v)) {
          if (arguments.length > 1) {
            this._nodes[v] = value;
          }
          return this;
        }
        this._nodes[v] = arguments.length > 1 ? value : this._defaultNodeLabelFn(v);
        if (this._isCompound) {
          this._parent[v] = GRAPH_NODE;
          this._children[v] = {};
          this._children[GRAPH_NODE][v] = true;
        }
        this._in[v] = {};
        this._preds[v] = {};
        this._out[v] = {};
        this._sucs[v] = {};
        ++this._nodeCount;
        return this;
      };
      Graph.prototype.node = function(v) {
        return this._nodes[v];
      };
      Graph.prototype.hasNode = function(v) {
        return _.has(this._nodes, v);
      };
      Graph.prototype.removeNode = function(v) {
        var self2 = this;
        if (_.has(this._nodes, v)) {
          var removeEdge = function(e) {
            self2.removeEdge(self2._edgeObjs[e]);
          };
          delete this._nodes[v];
          if (this._isCompound) {
            this._removeFromParentsChildList(v);
            delete this._parent[v];
            _.each(this.children(v), function(child) {
              self2.setParent(child);
            });
            delete this._children[v];
          }
          _.each(_.keys(this._in[v]), removeEdge);
          delete this._in[v];
          delete this._preds[v];
          _.each(_.keys(this._out[v]), removeEdge);
          delete this._out[v];
          delete this._sucs[v];
          --this._nodeCount;
        }
        return this;
      };
      Graph.prototype.setParent = function(v, parent) {
        if (!this._isCompound) {
          throw new Error("Cannot set parent in a non-compound graph");
        }
        if (_.isUndefined(parent)) {
          parent = GRAPH_NODE;
        } else {
          parent += "";
          for (var ancestor = parent; !_.isUndefined(ancestor); ancestor = this.parent(ancestor)) {
            if (ancestor === v) {
              throw new Error("Setting " + parent + " as parent of " + v + " would create a cycle");
            }
          }
          this.setNode(parent);
        }
        this.setNode(v);
        this._removeFromParentsChildList(v);
        this._parent[v] = parent;
        this._children[parent][v] = true;
        return this;
      };
      Graph.prototype._removeFromParentsChildList = function(v) {
        delete this._children[this._parent[v]][v];
      };
      Graph.prototype.parent = function(v) {
        if (this._isCompound) {
          var parent = this._parent[v];
          if (parent !== GRAPH_NODE) {
            return parent;
          }
        }
      };
      Graph.prototype.children = function(v) {
        if (_.isUndefined(v)) {
          v = GRAPH_NODE;
        }
        if (this._isCompound) {
          var children = this._children[v];
          if (children) {
            return _.keys(children);
          }
        } else if (v === GRAPH_NODE) {
          return this.nodes();
        } else if (this.hasNode(v)) {
          return [];
        }
      };
      Graph.prototype.predecessors = function(v) {
        var predsV = this._preds[v];
        if (predsV) {
          return _.keys(predsV);
        }
      };
      Graph.prototype.successors = function(v) {
        var sucsV = this._sucs[v];
        if (sucsV) {
          return _.keys(sucsV);
        }
      };
      Graph.prototype.neighbors = function(v) {
        var preds = this.predecessors(v);
        if (preds) {
          return _.union(preds, this.successors(v));
        }
      };
      Graph.prototype.isLeaf = function(v) {
        var neighbors;
        if (this.isDirected()) {
          neighbors = this.successors(v);
        } else {
          neighbors = this.neighbors(v);
        }
        return neighbors.length === 0;
      };
      Graph.prototype.filterNodes = function(filter) {
        var copy = new this.constructor({
          directed: this._isDirected,
          multigraph: this._isMultigraph,
          compound: this._isCompound
        });
        copy.setGraph(this.graph());
        var self2 = this;
        _.each(this._nodes, function(value, v) {
          if (filter(v)) {
            copy.setNode(v, value);
          }
        });
        _.each(this._edgeObjs, function(e) {
          if (copy.hasNode(e.v) && copy.hasNode(e.w)) {
            copy.setEdge(e, self2.edge(e));
          }
        });
        var parents = {};
        function findParent(v) {
          var parent = self2.parent(v);
          if (parent === void 0 || copy.hasNode(parent)) {
            parents[v] = parent;
            return parent;
          } else if (parent in parents) {
            return parents[parent];
          } else {
            return findParent(parent);
          }
        }
        if (this._isCompound) {
          _.each(copy.nodes(), function(v) {
            copy.setParent(v, findParent(v));
          });
        }
        return copy;
      };
      Graph.prototype.setDefaultEdgeLabel = function(newDefault) {
        if (!_.isFunction(newDefault)) {
          newDefault = _.constant(newDefault);
        }
        this._defaultEdgeLabelFn = newDefault;
        return this;
      };
      Graph.prototype.edgeCount = function() {
        return this._edgeCount;
      };
      Graph.prototype.edges = function() {
        return _.values(this._edgeObjs);
      };
      Graph.prototype.setPath = function(vs, value) {
        var self2 = this;
        var args = arguments;
        _.reduce(vs, function(v, w) {
          if (args.length > 1) {
            self2.setEdge(v, w, value);
          } else {
            self2.setEdge(v, w);
          }
          return w;
        });
        return this;
      };
      Graph.prototype.setEdge = function() {
        var v, w, name, value;
        var valueSpecified = false;
        var arg0 = arguments[0];
        if (typeof arg0 === "object" && arg0 !== null && "v" in arg0) {
          v = arg0.v;
          w = arg0.w;
          name = arg0.name;
          if (arguments.length === 2) {
            value = arguments[1];
            valueSpecified = true;
          }
        } else {
          v = arg0;
          w = arguments[1];
          name = arguments[3];
          if (arguments.length > 2) {
            value = arguments[2];
            valueSpecified = true;
          }
        }
        v = "" + v;
        w = "" + w;
        if (!_.isUndefined(name)) {
          name = "" + name;
        }
        var e = edgeArgsToId(this._isDirected, v, w, name);
        if (_.has(this._edgeLabels, e)) {
          if (valueSpecified) {
            this._edgeLabels[e] = value;
          }
          return this;
        }
        if (!_.isUndefined(name) && !this._isMultigraph) {
          throw new Error("Cannot set a named edge when isMultigraph = false");
        }
        this.setNode(v);
        this.setNode(w);
        this._edgeLabels[e] = valueSpecified ? value : this._defaultEdgeLabelFn(v, w, name);
        var edgeObj = edgeArgsToObj(this._isDirected, v, w, name);
        v = edgeObj.v;
        w = edgeObj.w;
        Object.freeze(edgeObj);
        this._edgeObjs[e] = edgeObj;
        incrementOrInitEntry(this._preds[w], v);
        incrementOrInitEntry(this._sucs[v], w);
        this._in[w][e] = edgeObj;
        this._out[v][e] = edgeObj;
        this._edgeCount++;
        return this;
      };
      Graph.prototype.edge = function(v, w, name) {
        var e = arguments.length === 1 ? edgeObjToId(this._isDirected, arguments[0]) : edgeArgsToId(this._isDirected, v, w, name);
        return this._edgeLabels[e];
      };
      Graph.prototype.hasEdge = function(v, w, name) {
        var e = arguments.length === 1 ? edgeObjToId(this._isDirected, arguments[0]) : edgeArgsToId(this._isDirected, v, w, name);
        return _.has(this._edgeLabels, e);
      };
      Graph.prototype.removeEdge = function(v, w, name) {
        var e = arguments.length === 1 ? edgeObjToId(this._isDirected, arguments[0]) : edgeArgsToId(this._isDirected, v, w, name);
        var edge = this._edgeObjs[e];
        if (edge) {
          v = edge.v;
          w = edge.w;
          delete this._edgeLabels[e];
          delete this._edgeObjs[e];
          decrementOrRemoveEntry(this._preds[w], v);
          decrementOrRemoveEntry(this._sucs[v], w);
          delete this._in[w][e];
          delete this._out[v][e];
          this._edgeCount--;
        }
        return this;
      };
      Graph.prototype.inEdges = function(v, u) {
        var inV = this._in[v];
        if (inV) {
          var edges = _.values(inV);
          if (!u) {
            return edges;
          }
          return _.filter(edges, function(edge) {
            return edge.v === u;
          });
        }
      };
      Graph.prototype.outEdges = function(v, w) {
        var outV = this._out[v];
        if (outV) {
          var edges = _.values(outV);
          if (!w) {
            return edges;
          }
          return _.filter(edges, function(edge) {
            return edge.w === w;
          });
        }
      };
      Graph.prototype.nodeEdges = function(v, w) {
        var inEdges = this.inEdges(v, w);
        if (inEdges) {
          return inEdges.concat(this.outEdges(v, w));
        }
      };
      function incrementOrInitEntry(map, k) {
        if (map[k]) {
          map[k]++;
        } else {
          map[k] = 1;
        }
      }
      function decrementOrRemoveEntry(map, k) {
        if (!--map[k]) {
          delete map[k];
        }
      }
      function edgeArgsToId(isDirected, v_, w_, name) {
        var v = "" + v_;
        var w = "" + w_;
        if (!isDirected && v > w) {
          var tmp = v;
          v = w;
          w = tmp;
        }
        return v + EDGE_KEY_DELIM + w + EDGE_KEY_DELIM + (_.isUndefined(name) ? DEFAULT_EDGE_NAME : name);
      }
      function edgeArgsToObj(isDirected, v_, w_, name) {
        var v = "" + v_;
        var w = "" + w_;
        if (!isDirected && v > w) {
          var tmp = v;
          v = w;
          w = tmp;
        }
        var edgeObj = { v, w };
        if (name) {
          edgeObj.name = name;
        }
        return edgeObj;
      }
      function edgeObjToId(isDirected, edgeObj) {
        return edgeArgsToId(isDirected, edgeObj.v, edgeObj.w, edgeObj.name);
      }
    }
  });

  // node_modules/graphlib/lib/version.js
  var require_version = __commonJS({
    "node_modules/graphlib/lib/version.js"(exports, module) {
      module.exports = "2.1.8";
    }
  });

  // node_modules/graphlib/lib/index.js
  var require_lib = __commonJS({
    "node_modules/graphlib/lib/index.js"(exports, module) {
      module.exports = {
        Graph: require_graph(),
        version: require_version()
      };
    }
  });

  // node_modules/graphlib/lib/json.js
  var require_json = __commonJS({
    "node_modules/graphlib/lib/json.js"(exports, module) {
      var _ = require_lodash();
      var Graph = require_graph();
      module.exports = {
        write,
        read
      };
      function write(g) {
        var json = {
          options: {
            directed: g.isDirected(),
            multigraph: g.isMultigraph(),
            compound: g.isCompound()
          },
          nodes: writeNodes(g),
          edges: writeEdges(g)
        };
        if (!_.isUndefined(g.graph())) {
          json.value = _.clone(g.graph());
        }
        return json;
      }
      function writeNodes(g) {
        return _.map(g.nodes(), function(v) {
          var nodeValue = g.node(v);
          var parent = g.parent(v);
          var node = { v };
          if (!_.isUndefined(nodeValue)) {
            node.value = nodeValue;
          }
          if (!_.isUndefined(parent)) {
            node.parent = parent;
          }
          return node;
        });
      }
      function writeEdges(g) {
        return _.map(g.edges(), function(e) {
          var edgeValue = g.edge(e);
          var edge = { v: e.v, w: e.w };
          if (!_.isUndefined(e.name)) {
            edge.name = e.name;
          }
          if (!_.isUndefined(edgeValue)) {
            edge.value = edgeValue;
          }
          return edge;
        });
      }
      function read(json) {
        var g = new Graph(json.options).setGraph(json.value);
        _.each(json.nodes, function(entry) {
          g.setNode(entry.v, entry.value);
          if (entry.parent) {
            g.setParent(entry.v, entry.parent);
          }
        });
        _.each(json.edges, function(entry) {
          g.setEdge({ v: entry.v, w: entry.w, name: entry.name }, entry.value);
        });
        return g;
      }
    }
  });

  // node_modules/graphlib/lib/alg/components.js
  var require_components = __commonJS({
    "node_modules/graphlib/lib/alg/components.js"(exports, module) {
      var _ = require_lodash();
      module.exports = components;
      function components(g) {
        var visited = {};
        var cmpts = [];
        var cmpt;
        function dfs(v) {
          if (_.has(visited, v)) return;
          visited[v] = true;
          cmpt.push(v);
          _.each(g.successors(v), dfs);
          _.each(g.predecessors(v), dfs);
        }
        _.each(g.nodes(), function(v) {
          cmpt = [];
          dfs(v);
          if (cmpt.length) {
            cmpts.push(cmpt);
          }
        });
        return cmpts;
      }
    }
  });

  // node_modules/graphlib/lib/data/priority-queue.js
  var require_priority_queue = __commonJS({
    "node_modules/graphlib/lib/data/priority-queue.js"(exports, module) {
      var _ = require_lodash();
      module.exports = PriorityQueue;
      function PriorityQueue() {
        this._arr = [];
        this._keyIndices = {};
      }
      PriorityQueue.prototype.size = function() {
        return this._arr.length;
      };
      PriorityQueue.prototype.keys = function() {
        return this._arr.map(function(x) {
          return x.key;
        });
      };
      PriorityQueue.prototype.has = function(key) {
        return _.has(this._keyIndices, key);
      };
      PriorityQueue.prototype.priority = function(key) {
        var index = this._keyIndices[key];
        if (index !== void 0) {
          return this._arr[index].priority;
        }
      };
      PriorityQueue.prototype.min = function() {
        if (this.size() === 0) {
          throw new Error("Queue underflow");
        }
        return this._arr[0].key;
      };
      PriorityQueue.prototype.add = function(key, priority) {
        var keyIndices = this._keyIndices;
        key = String(key);
        if (!_.has(keyIndices, key)) {
          var arr = this._arr;
          var index = arr.length;
          keyIndices[key] = index;
          arr.push({ key, priority });
          this._decrease(index);
          return true;
        }
        return false;
      };
      PriorityQueue.prototype.removeMin = function() {
        this._swap(0, this._arr.length - 1);
        var min = this._arr.pop();
        delete this._keyIndices[min.key];
        this._heapify(0);
        return min.key;
      };
      PriorityQueue.prototype.decrease = function(key, priority) {
        var index = this._keyIndices[key];
        if (priority > this._arr[index].priority) {
          throw new Error("New priority is greater than current priority. Key: " + key + " Old: " + this._arr[index].priority + " New: " + priority);
        }
        this._arr[index].priority = priority;
        this._decrease(index);
      };
      PriorityQueue.prototype._heapify = function(i) {
        var arr = this._arr;
        var l = 2 * i;
        var r = l + 1;
        var largest = i;
        if (l < arr.length) {
          largest = arr[l].priority < arr[largest].priority ? l : largest;
          if (r < arr.length) {
            largest = arr[r].priority < arr[largest].priority ? r : largest;
          }
          if (largest !== i) {
            this._swap(i, largest);
            this._heapify(largest);
          }
        }
      };
      PriorityQueue.prototype._decrease = function(index) {
        var arr = this._arr;
        var priority = arr[index].priority;
        var parent;
        while (index !== 0) {
          parent = index >> 1;
          if (arr[parent].priority < priority) {
            break;
          }
          this._swap(index, parent);
          index = parent;
        }
      };
      PriorityQueue.prototype._swap = function(i, j) {
        var arr = this._arr;
        var keyIndices = this._keyIndices;
        var origArrI = arr[i];
        var origArrJ = arr[j];
        arr[i] = origArrJ;
        arr[j] = origArrI;
        keyIndices[origArrJ.key] = i;
        keyIndices[origArrI.key] = j;
      };
    }
  });

  // node_modules/graphlib/lib/alg/dijkstra.js
  var require_dijkstra = __commonJS({
    "node_modules/graphlib/lib/alg/dijkstra.js"(exports, module) {
      var _ = require_lodash();
      var PriorityQueue = require_priority_queue();
      module.exports = dijkstra;
      var DEFAULT_WEIGHT_FUNC = _.constant(1);
      function dijkstra(g, source, weightFn, edgeFn) {
        return runDijkstra(
          g,
          String(source),
          weightFn || DEFAULT_WEIGHT_FUNC,
          edgeFn || function(v) {
            return g.outEdges(v);
          }
        );
      }
      function runDijkstra(g, source, weightFn, edgeFn) {
        var results = {};
        var pq = new PriorityQueue();
        var v, vEntry;
        var updateNeighbors = function(edge) {
          var w = edge.v !== v ? edge.v : edge.w;
          var wEntry = results[w];
          var weight = weightFn(edge);
          var distance = vEntry.distance + weight;
          if (weight < 0) {
            throw new Error("dijkstra does not allow negative edge weights. Bad edge: " + edge + " Weight: " + weight);
          }
          if (distance < wEntry.distance) {
            wEntry.distance = distance;
            wEntry.predecessor = v;
            pq.decrease(w, distance);
          }
        };
        g.nodes().forEach(function(v2) {
          var distance = v2 === source ? 0 : Number.POSITIVE_INFINITY;
          results[v2] = { distance };
          pq.add(v2, distance);
        });
        while (pq.size() > 0) {
          v = pq.removeMin();
          vEntry = results[v];
          if (vEntry.distance === Number.POSITIVE_INFINITY) {
            break;
          }
          edgeFn(v).forEach(updateNeighbors);
        }
        return results;
      }
    }
  });

  // node_modules/graphlib/lib/alg/dijkstra-all.js
  var require_dijkstra_all = __commonJS({
    "node_modules/graphlib/lib/alg/dijkstra-all.js"(exports, module) {
      var dijkstra = require_dijkstra();
      var _ = require_lodash();
      module.exports = dijkstraAll;
      function dijkstraAll(g, weightFunc, edgeFunc) {
        return _.transform(g.nodes(), function(acc, v) {
          acc[v] = dijkstra(g, v, weightFunc, edgeFunc);
        }, {});
      }
    }
  });

  // node_modules/graphlib/lib/alg/tarjan.js
  var require_tarjan = __commonJS({
    "node_modules/graphlib/lib/alg/tarjan.js"(exports, module) {
      var _ = require_lodash();
      module.exports = tarjan;
      function tarjan(g) {
        var index = 0;
        var stack = [];
        var visited = {};
        var results = [];
        function dfs(v) {
          var entry = visited[v] = {
            onStack: true,
            lowlink: index,
            index: index++
          };
          stack.push(v);
          g.successors(v).forEach(function(w2) {
            if (!_.has(visited, w2)) {
              dfs(w2);
              entry.lowlink = Math.min(entry.lowlink, visited[w2].lowlink);
            } else if (visited[w2].onStack) {
              entry.lowlink = Math.min(entry.lowlink, visited[w2].index);
            }
          });
          if (entry.lowlink === entry.index) {
            var cmpt = [];
            var w;
            do {
              w = stack.pop();
              visited[w].onStack = false;
              cmpt.push(w);
            } while (v !== w);
            results.push(cmpt);
          }
        }
        g.nodes().forEach(function(v) {
          if (!_.has(visited, v)) {
            dfs(v);
          }
        });
        return results;
      }
    }
  });

  // node_modules/graphlib/lib/alg/find-cycles.js
  var require_find_cycles = __commonJS({
    "node_modules/graphlib/lib/alg/find-cycles.js"(exports, module) {
      var _ = require_lodash();
      var tarjan = require_tarjan();
      module.exports = findCycles;
      function findCycles(g) {
        return _.filter(tarjan(g), function(cmpt) {
          return cmpt.length > 1 || cmpt.length === 1 && g.hasEdge(cmpt[0], cmpt[0]);
        });
      }
    }
  });

  // node_modules/graphlib/lib/alg/floyd-warshall.js
  var require_floyd_warshall = __commonJS({
    "node_modules/graphlib/lib/alg/floyd-warshall.js"(exports, module) {
      var _ = require_lodash();
      module.exports = floydWarshall;
      var DEFAULT_WEIGHT_FUNC = _.constant(1);
      function floydWarshall(g, weightFn, edgeFn) {
        return runFloydWarshall(
          g,
          weightFn || DEFAULT_WEIGHT_FUNC,
          edgeFn || function(v) {
            return g.outEdges(v);
          }
        );
      }
      function runFloydWarshall(g, weightFn, edgeFn) {
        var results = {};
        var nodes = g.nodes();
        nodes.forEach(function(v) {
          results[v] = {};
          results[v][v] = { distance: 0 };
          nodes.forEach(function(w) {
            if (v !== w) {
              results[v][w] = { distance: Number.POSITIVE_INFINITY };
            }
          });
          edgeFn(v).forEach(function(edge) {
            var w = edge.v === v ? edge.w : edge.v;
            var d = weightFn(edge);
            results[v][w] = { distance: d, predecessor: v };
          });
        });
        nodes.forEach(function(k) {
          var rowK = results[k];
          nodes.forEach(function(i) {
            var rowI = results[i];
            nodes.forEach(function(j) {
              var ik = rowI[k];
              var kj = rowK[j];
              var ij = rowI[j];
              var altDistance = ik.distance + kj.distance;
              if (altDistance < ij.distance) {
                ij.distance = altDistance;
                ij.predecessor = kj.predecessor;
              }
            });
          });
        });
        return results;
      }
    }
  });

  // node_modules/graphlib/lib/alg/topsort.js
  var require_topsort = __commonJS({
    "node_modules/graphlib/lib/alg/topsort.js"(exports, module) {
      var _ = require_lodash();
      module.exports = topsort;
      topsort.CycleException = CycleException;
      function topsort(g) {
        var visited = {};
        var stack = {};
        var results = [];
        function visit(node) {
          if (_.has(stack, node)) {
            throw new CycleException();
          }
          if (!_.has(visited, node)) {
            stack[node] = true;
            visited[node] = true;
            _.each(g.predecessors(node), visit);
            delete stack[node];
            results.push(node);
          }
        }
        _.each(g.sinks(), visit);
        if (_.size(visited) !== g.nodeCount()) {
          throw new CycleException();
        }
        return results;
      }
      function CycleException() {
      }
      CycleException.prototype = new Error();
    }
  });

  // node_modules/graphlib/lib/alg/is-acyclic.js
  var require_is_acyclic = __commonJS({
    "node_modules/graphlib/lib/alg/is-acyclic.js"(exports, module) {
      var topsort = require_topsort();
      module.exports = isAcyclic;
      function isAcyclic(g) {
        try {
          topsort(g);
        } catch (e) {
          if (e instanceof topsort.CycleException) {
            return false;
          }
          throw e;
        }
        return true;
      }
    }
  });

  // node_modules/graphlib/lib/alg/dfs.js
  var require_dfs = __commonJS({
    "node_modules/graphlib/lib/alg/dfs.js"(exports, module) {
      var _ = require_lodash();
      module.exports = dfs;
      function dfs(g, vs, order) {
        if (!_.isArray(vs)) {
          vs = [vs];
        }
        var navigation = (g.isDirected() ? g.successors : g.neighbors).bind(g);
        var acc = [];
        var visited = {};
        _.each(vs, function(v) {
          if (!g.hasNode(v)) {
            throw new Error("Graph does not have node: " + v);
          }
          doDfs(g, v, order === "post", visited, navigation, acc);
        });
        return acc;
      }
      function doDfs(g, v, postorder, visited, navigation, acc) {
        if (!_.has(visited, v)) {
          visited[v] = true;
          if (!postorder) {
            acc.push(v);
          }
          _.each(navigation(v), function(w) {
            doDfs(g, w, postorder, visited, navigation, acc);
          });
          if (postorder) {
            acc.push(v);
          }
        }
      }
    }
  });

  // node_modules/graphlib/lib/alg/postorder.js
  var require_postorder = __commonJS({
    "node_modules/graphlib/lib/alg/postorder.js"(exports, module) {
      var dfs = require_dfs();
      module.exports = postorder;
      function postorder(g, vs) {
        return dfs(g, vs, "post");
      }
    }
  });

  // node_modules/graphlib/lib/alg/preorder.js
  var require_preorder = __commonJS({
    "node_modules/graphlib/lib/alg/preorder.js"(exports, module) {
      var dfs = require_dfs();
      module.exports = preorder;
      function preorder(g, vs) {
        return dfs(g, vs, "pre");
      }
    }
  });

  // node_modules/graphlib/lib/alg/prim.js
  var require_prim = __commonJS({
    "node_modules/graphlib/lib/alg/prim.js"(exports, module) {
      var _ = require_lodash();
      var Graph = require_graph();
      var PriorityQueue = require_priority_queue();
      module.exports = prim;
      function prim(g, weightFunc) {
        var result = new Graph();
        var parents = {};
        var pq = new PriorityQueue();
        var v;
        function updateNeighbors(edge) {
          var w = edge.v === v ? edge.w : edge.v;
          var pri = pq.priority(w);
          if (pri !== void 0) {
            var edgeWeight = weightFunc(edge);
            if (edgeWeight < pri) {
              parents[w] = v;
              pq.decrease(w, edgeWeight);
            }
          }
        }
        if (g.nodeCount() === 0) {
          return result;
        }
        _.each(g.nodes(), function(v2) {
          pq.add(v2, Number.POSITIVE_INFINITY);
          result.setNode(v2);
        });
        pq.decrease(g.nodes()[0], 0);
        var init = false;
        while (pq.size() > 0) {
          v = pq.removeMin();
          if (_.has(parents, v)) {
            result.setEdge(v, parents[v]);
          } else if (init) {
            throw new Error("Input graph is not connected: " + g);
          } else {
            init = true;
          }
          g.nodeEdges(v).forEach(updateNeighbors);
        }
        return result;
      }
    }
  });

  // node_modules/graphlib/lib/alg/index.js
  var require_alg = __commonJS({
    "node_modules/graphlib/lib/alg/index.js"(exports, module) {
      module.exports = {
        components: require_components(),
        dijkstra: require_dijkstra(),
        dijkstraAll: require_dijkstra_all(),
        findCycles: require_find_cycles(),
        floydWarshall: require_floyd_warshall(),
        isAcyclic: require_is_acyclic(),
        postorder: require_postorder(),
        preorder: require_preorder(),
        prim: require_prim(),
        tarjan: require_tarjan(),
        topsort: require_topsort()
      };
    }
  });

  // node_modules/graphlib/index.js
  var require_graphlib = __commonJS({
    "node_modules/graphlib/index.js"(exports, module) {
      var lib = require_lib();
      module.exports = {
        Graph: lib.Graph,
        json: require_json(),
        alg: require_alg(),
        version: lib.version
      };
    }
  });

  // node_modules/dagre/lib/graphlib.js
  var require_graphlib2 = __commonJS({
    "node_modules/dagre/lib/graphlib.js"(exports, module) {
      var graphlib2;
      if (typeof __require === "function") {
        try {
          graphlib2 = require_graphlib();
        } catch (e) {
        }
      }
      if (!graphlib2) {
        graphlib2 = window.graphlib;
      }
      module.exports = graphlib2;
    }
  });

  // node_modules/lodash/cloneDeep.js
  var require_cloneDeep = __commonJS({
    "node_modules/lodash/cloneDeep.js"(exports, module) {
      var baseClone = require_baseClone();
      var CLONE_DEEP_FLAG = 1;
      var CLONE_SYMBOLS_FLAG = 4;
      function cloneDeep(value) {
        return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG);
      }
      module.exports = cloneDeep;
    }
  });

  // node_modules/lodash/_isIterateeCall.js
  var require_isIterateeCall = __commonJS({
    "node_modules/lodash/_isIterateeCall.js"(exports, module) {
      var eq = require_eq();
      var isArrayLike = require_isArrayLike();
      var isIndex = require_isIndex();
      var isObject = require_isObject();
      function isIterateeCall(value, index, object) {
        if (!isObject(object)) {
          return false;
        }
        var type = typeof index;
        if (type == "number" ? isArrayLike(object) && isIndex(index, object.length) : type == "string" && index in object) {
          return eq(object[index], value);
        }
        return false;
      }
      module.exports = isIterateeCall;
    }
  });

  // node_modules/lodash/defaults.js
  var require_defaults = __commonJS({
    "node_modules/lodash/defaults.js"(exports, module) {
      var baseRest = require_baseRest();
      var eq = require_eq();
      var isIterateeCall = require_isIterateeCall();
      var keysIn = require_keysIn();
      var objectProto = Object.prototype;
      var hasOwnProperty = objectProto.hasOwnProperty;
      var defaults = baseRest(function(object, sources) {
        object = Object(object);
        var index = -1;
        var length = sources.length;
        var guard = length > 2 ? sources[2] : void 0;
        if (guard && isIterateeCall(sources[0], sources[1], guard)) {
          length = 1;
        }
        while (++index < length) {
          var source = sources[index];
          var props = keysIn(source);
          var propsIndex = -1;
          var propsLength = props.length;
          while (++propsIndex < propsLength) {
            var key = props[propsIndex];
            var value = object[key];
            if (value === void 0 || eq(value, objectProto[key]) && !hasOwnProperty.call(object, key)) {
              object[key] = source[key];
            }
          }
        }
        return object;
      });
      module.exports = defaults;
    }
  });

  // node_modules/lodash/_createFind.js
  var require_createFind = __commonJS({
    "node_modules/lodash/_createFind.js"(exports, module) {
      var baseIteratee = require_baseIteratee();
      var isArrayLike = require_isArrayLike();
      var keys = require_keys();
      function createFind(findIndexFunc) {
        return function(collection, predicate, fromIndex) {
          var iterable = Object(collection);
          if (!isArrayLike(collection)) {
            var iteratee = baseIteratee(predicate, 3);
            collection = keys(collection);
            predicate = function(key) {
              return iteratee(iterable[key], key, iterable);
            };
          }
          var index = findIndexFunc(collection, predicate, fromIndex);
          return index > -1 ? iterable[iteratee ? collection[index] : index] : void 0;
        };
      }
      module.exports = createFind;
    }
  });

  // node_modules/lodash/_trimmedEndIndex.js
  var require_trimmedEndIndex = __commonJS({
    "node_modules/lodash/_trimmedEndIndex.js"(exports, module) {
      var reWhitespace = /\s/;
      function trimmedEndIndex(string) {
        var index = string.length;
        while (index-- && reWhitespace.test(string.charAt(index))) {
        }
        return index;
      }
      module.exports = trimmedEndIndex;
    }
  });

  // node_modules/lodash/_baseTrim.js
  var require_baseTrim = __commonJS({
    "node_modules/lodash/_baseTrim.js"(exports, module) {
      var trimmedEndIndex = require_trimmedEndIndex();
      var reTrimStart = /^\s+/;
      function baseTrim(string) {
        return string ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, "") : string;
      }
      module.exports = baseTrim;
    }
  });

  // node_modules/lodash/toNumber.js
  var require_toNumber = __commonJS({
    "node_modules/lodash/toNumber.js"(exports, module) {
      var baseTrim = require_baseTrim();
      var isObject = require_isObject();
      var isSymbol = require_isSymbol();
      var NAN = 0 / 0;
      var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
      var reIsBinary = /^0b[01]+$/i;
      var reIsOctal = /^0o[0-7]+$/i;
      var freeParseInt = parseInt;
      function toNumber(value) {
        if (typeof value == "number") {
          return value;
        }
        if (isSymbol(value)) {
          return NAN;
        }
        if (isObject(value)) {
          var other = typeof value.valueOf == "function" ? value.valueOf() : value;
          value = isObject(other) ? other + "" : other;
        }
        if (typeof value != "string") {
          return value === 0 ? value : +value;
        }
        value = baseTrim(value);
        var isBinary = reIsBinary.test(value);
        return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
      }
      module.exports = toNumber;
    }
  });

  // node_modules/lodash/toFinite.js
  var require_toFinite = __commonJS({
    "node_modules/lodash/toFinite.js"(exports, module) {
      var toNumber = require_toNumber();
      var INFINITY = 1 / 0;
      var MAX_INTEGER = 17976931348623157e292;
      function toFinite(value) {
        if (!value) {
          return value === 0 ? value : 0;
        }
        value = toNumber(value);
        if (value === INFINITY || value === -INFINITY) {
          var sign = value < 0 ? -1 : 1;
          return sign * MAX_INTEGER;
        }
        return value === value ? value : 0;
      }
      module.exports = toFinite;
    }
  });

  // node_modules/lodash/toInteger.js
  var require_toInteger = __commonJS({
    "node_modules/lodash/toInteger.js"(exports, module) {
      var toFinite = require_toFinite();
      function toInteger(value) {
        var result = toFinite(value), remainder = result % 1;
        return result === result ? remainder ? result - remainder : result : 0;
      }
      module.exports = toInteger;
    }
  });

  // node_modules/lodash/findIndex.js
  var require_findIndex = __commonJS({
    "node_modules/lodash/findIndex.js"(exports, module) {
      var baseFindIndex = require_baseFindIndex();
      var baseIteratee = require_baseIteratee();
      var toInteger = require_toInteger();
      var nativeMax = Math.max;
      function findIndex(array, predicate, fromIndex) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return -1;
        }
        var index = fromIndex == null ? 0 : toInteger(fromIndex);
        if (index < 0) {
          index = nativeMax(length + index, 0);
        }
        return baseFindIndex(array, baseIteratee(predicate, 3), index);
      }
      module.exports = findIndex;
    }
  });

  // node_modules/lodash/find.js
  var require_find = __commonJS({
    "node_modules/lodash/find.js"(exports, module) {
      var createFind = require_createFind();
      var findIndex = require_findIndex();
      var find = createFind(findIndex);
      module.exports = find;
    }
  });

  // node_modules/lodash/flatten.js
  var require_flatten = __commonJS({
    "node_modules/lodash/flatten.js"(exports, module) {
      var baseFlatten = require_baseFlatten();
      function flatten(array) {
        var length = array == null ? 0 : array.length;
        return length ? baseFlatten(array, 1) : [];
      }
      module.exports = flatten;
    }
  });

  // node_modules/lodash/forIn.js
  var require_forIn = __commonJS({
    "node_modules/lodash/forIn.js"(exports, module) {
      var baseFor = require_baseFor();
      var castFunction = require_castFunction();
      var keysIn = require_keysIn();
      function forIn(object, iteratee) {
        return object == null ? object : baseFor(object, castFunction(iteratee), keysIn);
      }
      module.exports = forIn;
    }
  });

  // node_modules/lodash/last.js
  var require_last = __commonJS({
    "node_modules/lodash/last.js"(exports, module) {
      function last(array) {
        var length = array == null ? 0 : array.length;
        return length ? array[length - 1] : void 0;
      }
      module.exports = last;
    }
  });

  // node_modules/lodash/mapValues.js
  var require_mapValues = __commonJS({
    "node_modules/lodash/mapValues.js"(exports, module) {
      var baseAssignValue = require_baseAssignValue();
      var baseForOwn = require_baseForOwn();
      var baseIteratee = require_baseIteratee();
      function mapValues(object, iteratee) {
        var result = {};
        iteratee = baseIteratee(iteratee, 3);
        baseForOwn(object, function(value, key, object2) {
          baseAssignValue(result, key, iteratee(value, key, object2));
        });
        return result;
      }
      module.exports = mapValues;
    }
  });

  // node_modules/lodash/_baseExtremum.js
  var require_baseExtremum = __commonJS({
    "node_modules/lodash/_baseExtremum.js"(exports, module) {
      var isSymbol = require_isSymbol();
      function baseExtremum(array, iteratee, comparator) {
        var index = -1, length = array.length;
        while (++index < length) {
          var value = array[index], current = iteratee(value);
          if (current != null && (computed === void 0 ? current === current && !isSymbol(current) : comparator(current, computed))) {
            var computed = current, result = value;
          }
        }
        return result;
      }
      module.exports = baseExtremum;
    }
  });

  // node_modules/lodash/_baseGt.js
  var require_baseGt = __commonJS({
    "node_modules/lodash/_baseGt.js"(exports, module) {
      function baseGt(value, other) {
        return value > other;
      }
      module.exports = baseGt;
    }
  });

  // node_modules/lodash/max.js
  var require_max = __commonJS({
    "node_modules/lodash/max.js"(exports, module) {
      var baseExtremum = require_baseExtremum();
      var baseGt = require_baseGt();
      var identity = require_identity();
      function max(array) {
        return array && array.length ? baseExtremum(array, identity, baseGt) : void 0;
      }
      module.exports = max;
    }
  });

  // node_modules/lodash/_assignMergeValue.js
  var require_assignMergeValue = __commonJS({
    "node_modules/lodash/_assignMergeValue.js"(exports, module) {
      var baseAssignValue = require_baseAssignValue();
      var eq = require_eq();
      function assignMergeValue(object, key, value) {
        if (value !== void 0 && !eq(object[key], value) || value === void 0 && !(key in object)) {
          baseAssignValue(object, key, value);
        }
      }
      module.exports = assignMergeValue;
    }
  });

  // node_modules/lodash/isPlainObject.js
  var require_isPlainObject = __commonJS({
    "node_modules/lodash/isPlainObject.js"(exports, module) {
      var baseGetTag = require_baseGetTag();
      var getPrototype = require_getPrototype();
      var isObjectLike = require_isObjectLike();
      var objectTag = "[object Object]";
      var funcProto = Function.prototype;
      var objectProto = Object.prototype;
      var funcToString = funcProto.toString;
      var hasOwnProperty = objectProto.hasOwnProperty;
      var objectCtorString = funcToString.call(Object);
      function isPlainObject(value) {
        if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
          return false;
        }
        var proto = getPrototype(value);
        if (proto === null) {
          return true;
        }
        var Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
        return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
      }
      module.exports = isPlainObject;
    }
  });

  // node_modules/lodash/_safeGet.js
  var require_safeGet = __commonJS({
    "node_modules/lodash/_safeGet.js"(exports, module) {
      function safeGet(object, key) {
        if (key === "constructor" && typeof object[key] === "function") {
          return;
        }
        if (key == "__proto__") {
          return;
        }
        return object[key];
      }
      module.exports = safeGet;
    }
  });

  // node_modules/lodash/toPlainObject.js
  var require_toPlainObject = __commonJS({
    "node_modules/lodash/toPlainObject.js"(exports, module) {
      var copyObject = require_copyObject();
      var keysIn = require_keysIn();
      function toPlainObject(value) {
        return copyObject(value, keysIn(value));
      }
      module.exports = toPlainObject;
    }
  });

  // node_modules/lodash/_baseMergeDeep.js
  var require_baseMergeDeep = __commonJS({
    "node_modules/lodash/_baseMergeDeep.js"(exports, module) {
      var assignMergeValue = require_assignMergeValue();
      var cloneBuffer = require_cloneBuffer();
      var cloneTypedArray = require_cloneTypedArray();
      var copyArray = require_copyArray();
      var initCloneObject = require_initCloneObject();
      var isArguments = require_isArguments();
      var isArray = require_isArray();
      var isArrayLikeObject = require_isArrayLikeObject();
      var isBuffer = require_isBuffer();
      var isFunction = require_isFunction();
      var isObject = require_isObject();
      var isPlainObject = require_isPlainObject();
      var isTypedArray = require_isTypedArray();
      var safeGet = require_safeGet();
      var toPlainObject = require_toPlainObject();
      function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
        var objValue = safeGet(object, key), srcValue = safeGet(source, key), stacked = stack.get(srcValue);
        if (stacked) {
          assignMergeValue(object, key, stacked);
          return;
        }
        var newValue = customizer ? customizer(objValue, srcValue, key + "", object, source, stack) : void 0;
        var isCommon = newValue === void 0;
        if (isCommon) {
          var isArr = isArray(srcValue), isBuff = !isArr && isBuffer(srcValue), isTyped = !isArr && !isBuff && isTypedArray(srcValue);
          newValue = srcValue;
          if (isArr || isBuff || isTyped) {
            if (isArray(objValue)) {
              newValue = objValue;
            } else if (isArrayLikeObject(objValue)) {
              newValue = copyArray(objValue);
            } else if (isBuff) {
              isCommon = false;
              newValue = cloneBuffer(srcValue, true);
            } else if (isTyped) {
              isCommon = false;
              newValue = cloneTypedArray(srcValue, true);
            } else {
              newValue = [];
            }
          } else if (isPlainObject(srcValue) || isArguments(srcValue)) {
            newValue = objValue;
            if (isArguments(objValue)) {
              newValue = toPlainObject(objValue);
            } else if (!isObject(objValue) || isFunction(objValue)) {
              newValue = initCloneObject(srcValue);
            }
          } else {
            isCommon = false;
          }
        }
        if (isCommon) {
          stack.set(srcValue, newValue);
          mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
          stack["delete"](srcValue);
        }
        assignMergeValue(object, key, newValue);
      }
      module.exports = baseMergeDeep;
    }
  });

  // node_modules/lodash/_baseMerge.js
  var require_baseMerge = __commonJS({
    "node_modules/lodash/_baseMerge.js"(exports, module) {
      var Stack = require_Stack();
      var assignMergeValue = require_assignMergeValue();
      var baseFor = require_baseFor();
      var baseMergeDeep = require_baseMergeDeep();
      var isObject = require_isObject();
      var keysIn = require_keysIn();
      var safeGet = require_safeGet();
      function baseMerge(object, source, srcIndex, customizer, stack) {
        if (object === source) {
          return;
        }
        baseFor(source, function(srcValue, key) {
          stack || (stack = new Stack());
          if (isObject(srcValue)) {
            baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
          } else {
            var newValue = customizer ? customizer(safeGet(object, key), srcValue, key + "", object, source, stack) : void 0;
            if (newValue === void 0) {
              newValue = srcValue;
            }
            assignMergeValue(object, key, newValue);
          }
        }, keysIn);
      }
      module.exports = baseMerge;
    }
  });

  // node_modules/lodash/_createAssigner.js
  var require_createAssigner = __commonJS({
    "node_modules/lodash/_createAssigner.js"(exports, module) {
      var baseRest = require_baseRest();
      var isIterateeCall = require_isIterateeCall();
      function createAssigner(assigner) {
        return baseRest(function(object, sources) {
          var index = -1, length = sources.length, customizer = length > 1 ? sources[length - 1] : void 0, guard = length > 2 ? sources[2] : void 0;
          customizer = assigner.length > 3 && typeof customizer == "function" ? (length--, customizer) : void 0;
          if (guard && isIterateeCall(sources[0], sources[1], guard)) {
            customizer = length < 3 ? void 0 : customizer;
            length = 1;
          }
          object = Object(object);
          while (++index < length) {
            var source = sources[index];
            if (source) {
              assigner(object, source, index, customizer);
            }
          }
          return object;
        });
      }
      module.exports = createAssigner;
    }
  });

  // node_modules/lodash/merge.js
  var require_merge = __commonJS({
    "node_modules/lodash/merge.js"(exports, module) {
      var baseMerge = require_baseMerge();
      var createAssigner = require_createAssigner();
      var merge = createAssigner(function(object, source, srcIndex) {
        baseMerge(object, source, srcIndex);
      });
      module.exports = merge;
    }
  });

  // node_modules/lodash/_baseLt.js
  var require_baseLt = __commonJS({
    "node_modules/lodash/_baseLt.js"(exports, module) {
      function baseLt(value, other) {
        return value < other;
      }
      module.exports = baseLt;
    }
  });

  // node_modules/lodash/min.js
  var require_min = __commonJS({
    "node_modules/lodash/min.js"(exports, module) {
      var baseExtremum = require_baseExtremum();
      var baseLt = require_baseLt();
      var identity = require_identity();
      function min(array) {
        return array && array.length ? baseExtremum(array, identity, baseLt) : void 0;
      }
      module.exports = min;
    }
  });

  // node_modules/lodash/minBy.js
  var require_minBy = __commonJS({
    "node_modules/lodash/minBy.js"(exports, module) {
      var baseExtremum = require_baseExtremum();
      var baseIteratee = require_baseIteratee();
      var baseLt = require_baseLt();
      function minBy(array, iteratee) {
        return array && array.length ? baseExtremum(array, baseIteratee(iteratee, 2), baseLt) : void 0;
      }
      module.exports = minBy;
    }
  });

  // node_modules/lodash/now.js
  var require_now = __commonJS({
    "node_modules/lodash/now.js"(exports, module) {
      var root = require_root();
      var now = function() {
        return root.Date.now();
      };
      module.exports = now;
    }
  });

  // node_modules/lodash/_baseSet.js
  var require_baseSet = __commonJS({
    "node_modules/lodash/_baseSet.js"(exports, module) {
      var assignValue = require_assignValue();
      var castPath = require_castPath();
      var isIndex = require_isIndex();
      var isObject = require_isObject();
      var toKey = require_toKey();
      function baseSet(object, path, value, customizer) {
        if (!isObject(object)) {
          return object;
        }
        path = castPath(path, object);
        var index = -1, length = path.length, lastIndex = length - 1, nested = object;
        while (nested != null && ++index < length) {
          var key = toKey(path[index]), newValue = value;
          if (key === "__proto__" || key === "constructor" || key === "prototype") {
            return object;
          }
          if (index != lastIndex) {
            var objValue = nested[key];
            newValue = customizer ? customizer(objValue, key, nested) : void 0;
            if (newValue === void 0) {
              newValue = isObject(objValue) ? objValue : isIndex(path[index + 1]) ? [] : {};
            }
          }
          assignValue(nested, key, newValue);
          nested = nested[key];
        }
        return object;
      }
      module.exports = baseSet;
    }
  });

  // node_modules/lodash/_basePickBy.js
  var require_basePickBy = __commonJS({
    "node_modules/lodash/_basePickBy.js"(exports, module) {
      var baseGet = require_baseGet();
      var baseSet = require_baseSet();
      var castPath = require_castPath();
      function basePickBy(object, paths, predicate) {
        var index = -1, length = paths.length, result = {};
        while (++index < length) {
          var path = paths[index], value = baseGet(object, path);
          if (predicate(value, path)) {
            baseSet(result, castPath(path, object), value);
          }
        }
        return result;
      }
      module.exports = basePickBy;
    }
  });

  // node_modules/lodash/_basePick.js
  var require_basePick = __commonJS({
    "node_modules/lodash/_basePick.js"(exports, module) {
      var basePickBy = require_basePickBy();
      var hasIn = require_hasIn();
      function basePick(object, paths) {
        return basePickBy(object, paths, function(value, path) {
          return hasIn(object, path);
        });
      }
      module.exports = basePick;
    }
  });

  // node_modules/lodash/_flatRest.js
  var require_flatRest = __commonJS({
    "node_modules/lodash/_flatRest.js"(exports, module) {
      var flatten = require_flatten();
      var overRest = require_overRest();
      var setToString = require_setToString();
      function flatRest(func) {
        return setToString(overRest(func, void 0, flatten), func + "");
      }
      module.exports = flatRest;
    }
  });

  // node_modules/lodash/pick.js
  var require_pick = __commonJS({
    "node_modules/lodash/pick.js"(exports, module) {
      var basePick = require_basePick();
      var flatRest = require_flatRest();
      var pick = flatRest(function(object, paths) {
        return object == null ? {} : basePick(object, paths);
      });
      module.exports = pick;
    }
  });

  // node_modules/lodash/_baseRange.js
  var require_baseRange = __commonJS({
    "node_modules/lodash/_baseRange.js"(exports, module) {
      var nativeCeil = Math.ceil;
      var nativeMax = Math.max;
      function baseRange(start, end, step, fromRight) {
        var index = -1, length = nativeMax(nativeCeil((end - start) / (step || 1)), 0), result = Array(length);
        while (length--) {
          result[fromRight ? length : ++index] = start;
          start += step;
        }
        return result;
      }
      module.exports = baseRange;
    }
  });

  // node_modules/lodash/_createRange.js
  var require_createRange = __commonJS({
    "node_modules/lodash/_createRange.js"(exports, module) {
      var baseRange = require_baseRange();
      var isIterateeCall = require_isIterateeCall();
      var toFinite = require_toFinite();
      function createRange(fromRight) {
        return function(start, end, step) {
          if (step && typeof step != "number" && isIterateeCall(start, end, step)) {
            end = step = void 0;
          }
          start = toFinite(start);
          if (end === void 0) {
            end = start;
            start = 0;
          } else {
            end = toFinite(end);
          }
          step = step === void 0 ? start < end ? 1 : -1 : toFinite(step);
          return baseRange(start, end, step, fromRight);
        };
      }
      module.exports = createRange;
    }
  });

  // node_modules/lodash/range.js
  var require_range = __commonJS({
    "node_modules/lodash/range.js"(exports, module) {
      var createRange = require_createRange();
      var range = createRange();
      module.exports = range;
    }
  });

  // node_modules/lodash/_baseSortBy.js
  var require_baseSortBy = __commonJS({
    "node_modules/lodash/_baseSortBy.js"(exports, module) {
      function baseSortBy(array, comparer) {
        var length = array.length;
        array.sort(comparer);
        while (length--) {
          array[length] = array[length].value;
        }
        return array;
      }
      module.exports = baseSortBy;
    }
  });

  // node_modules/lodash/_compareAscending.js
  var require_compareAscending = __commonJS({
    "node_modules/lodash/_compareAscending.js"(exports, module) {
      var isSymbol = require_isSymbol();
      function compareAscending(value, other) {
        if (value !== other) {
          var valIsDefined = value !== void 0, valIsNull = value === null, valIsReflexive = value === value, valIsSymbol = isSymbol(value);
          var othIsDefined = other !== void 0, othIsNull = other === null, othIsReflexive = other === other, othIsSymbol = isSymbol(other);
          if (!othIsNull && !othIsSymbol && !valIsSymbol && value > other || valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol || valIsNull && othIsDefined && othIsReflexive || !valIsDefined && othIsReflexive || !valIsReflexive) {
            return 1;
          }
          if (!valIsNull && !valIsSymbol && !othIsSymbol && value < other || othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol || othIsNull && valIsDefined && valIsReflexive || !othIsDefined && valIsReflexive || !othIsReflexive) {
            return -1;
          }
        }
        return 0;
      }
      module.exports = compareAscending;
    }
  });

  // node_modules/lodash/_compareMultiple.js
  var require_compareMultiple = __commonJS({
    "node_modules/lodash/_compareMultiple.js"(exports, module) {
      var compareAscending = require_compareAscending();
      function compareMultiple(object, other, orders) {
        var index = -1, objCriteria = object.criteria, othCriteria = other.criteria, length = objCriteria.length, ordersLength = orders.length;
        while (++index < length) {
          var result = compareAscending(objCriteria[index], othCriteria[index]);
          if (result) {
            if (index >= ordersLength) {
              return result;
            }
            var order = orders[index];
            return result * (order == "desc" ? -1 : 1);
          }
        }
        return object.index - other.index;
      }
      module.exports = compareMultiple;
    }
  });

  // node_modules/lodash/_baseOrderBy.js
  var require_baseOrderBy = __commonJS({
    "node_modules/lodash/_baseOrderBy.js"(exports, module) {
      var arrayMap = require_arrayMap();
      var baseGet = require_baseGet();
      var baseIteratee = require_baseIteratee();
      var baseMap = require_baseMap();
      var baseSortBy = require_baseSortBy();
      var baseUnary = require_baseUnary();
      var compareMultiple = require_compareMultiple();
      var identity = require_identity();
      var isArray = require_isArray();
      function baseOrderBy(collection, iteratees, orders) {
        if (iteratees.length) {
          iteratees = arrayMap(iteratees, function(iteratee) {
            if (isArray(iteratee)) {
              return function(value) {
                return baseGet(value, iteratee.length === 1 ? iteratee[0] : iteratee);
              };
            }
            return iteratee;
          });
        } else {
          iteratees = [identity];
        }
        var index = -1;
        iteratees = arrayMap(iteratees, baseUnary(baseIteratee));
        var result = baseMap(collection, function(value, key, collection2) {
          var criteria = arrayMap(iteratees, function(iteratee) {
            return iteratee(value);
          });
          return { "criteria": criteria, "index": ++index, "value": value };
        });
        return baseSortBy(result, function(object, other) {
          return compareMultiple(object, other, orders);
        });
      }
      module.exports = baseOrderBy;
    }
  });

  // node_modules/lodash/sortBy.js
  var require_sortBy = __commonJS({
    "node_modules/lodash/sortBy.js"(exports, module) {
      var baseFlatten = require_baseFlatten();
      var baseOrderBy = require_baseOrderBy();
      var baseRest = require_baseRest();
      var isIterateeCall = require_isIterateeCall();
      var sortBy = baseRest(function(collection, iteratees) {
        if (collection == null) {
          return [];
        }
        var length = iteratees.length;
        if (length > 1 && isIterateeCall(collection, iteratees[0], iteratees[1])) {
          iteratees = [];
        } else if (length > 2 && isIterateeCall(iteratees[0], iteratees[1], iteratees[2])) {
          iteratees = [iteratees[0]];
        }
        return baseOrderBy(collection, baseFlatten(iteratees, 1), []);
      });
      module.exports = sortBy;
    }
  });

  // node_modules/lodash/uniqueId.js
  var require_uniqueId = __commonJS({
    "node_modules/lodash/uniqueId.js"(exports, module) {
      var toString = require_toString();
      var idCounter = 0;
      function uniqueId(prefix) {
        var id = ++idCounter;
        return toString(prefix) + id;
      }
      module.exports = uniqueId;
    }
  });

  // node_modules/lodash/_baseZipObject.js
  var require_baseZipObject = __commonJS({
    "node_modules/lodash/_baseZipObject.js"(exports, module) {
      function baseZipObject(props, values, assignFunc) {
        var index = -1, length = props.length, valsLength = values.length, result = {};
        while (++index < length) {
          var value = index < valsLength ? values[index] : void 0;
          assignFunc(result, props[index], value);
        }
        return result;
      }
      module.exports = baseZipObject;
    }
  });

  // node_modules/lodash/zipObject.js
  var require_zipObject = __commonJS({
    "node_modules/lodash/zipObject.js"(exports, module) {
      var assignValue = require_assignValue();
      var baseZipObject = require_baseZipObject();
      function zipObject(props, values) {
        return baseZipObject(props || [], values || [], assignValue);
      }
      module.exports = zipObject;
    }
  });

  // node_modules/dagre/lib/lodash.js
  var require_lodash2 = __commonJS({
    "node_modules/dagre/lib/lodash.js"(exports, module) {
      var lodash;
      if (typeof __require === "function") {
        try {
          lodash = {
            cloneDeep: require_cloneDeep(),
            constant: require_constant(),
            defaults: require_defaults(),
            each: require_each(),
            filter: require_filter(),
            find: require_find(),
            flatten: require_flatten(),
            forEach: require_forEach(),
            forIn: require_forIn(),
            has: require_has(),
            isUndefined: require_isUndefined(),
            last: require_last(),
            map: require_map(),
            mapValues: require_mapValues(),
            max: require_max(),
            merge: require_merge(),
            min: require_min(),
            minBy: require_minBy(),
            now: require_now(),
            pick: require_pick(),
            range: require_range(),
            reduce: require_reduce(),
            sortBy: require_sortBy(),
            uniqueId: require_uniqueId(),
            values: require_values(),
            zipObject: require_zipObject()
          };
        } catch (e) {
        }
      }
      if (!lodash) {
        lodash = window._;
      }
      module.exports = lodash;
    }
  });

  // node_modules/dagre/lib/data/list.js
  var require_list = __commonJS({
    "node_modules/dagre/lib/data/list.js"(exports, module) {
      module.exports = List;
      function List() {
        var sentinel = {};
        sentinel._next = sentinel._prev = sentinel;
        this._sentinel = sentinel;
      }
      List.prototype.dequeue = function() {
        var sentinel = this._sentinel;
        var entry = sentinel._prev;
        if (entry !== sentinel) {
          unlink(entry);
          return entry;
        }
      };
      List.prototype.enqueue = function(entry) {
        var sentinel = this._sentinel;
        if (entry._prev && entry._next) {
          unlink(entry);
        }
        entry._next = sentinel._next;
        sentinel._next._prev = entry;
        sentinel._next = entry;
        entry._prev = sentinel;
      };
      List.prototype.toString = function() {
        var strs = [];
        var sentinel = this._sentinel;
        var curr = sentinel._prev;
        while (curr !== sentinel) {
          strs.push(JSON.stringify(curr, filterOutLinks));
          curr = curr._prev;
        }
        return "[" + strs.join(", ") + "]";
      };
      function unlink(entry) {
        entry._prev._next = entry._next;
        entry._next._prev = entry._prev;
        delete entry._next;
        delete entry._prev;
      }
      function filterOutLinks(k, v) {
        if (k !== "_next" && k !== "_prev") {
          return v;
        }
      }
    }
  });

  // node_modules/dagre/lib/greedy-fas.js
  var require_greedy_fas = __commonJS({
    "node_modules/dagre/lib/greedy-fas.js"(exports, module) {
      var _ = require_lodash2();
      var Graph = require_graphlib2().Graph;
      var List = require_list();
      module.exports = greedyFAS;
      var DEFAULT_WEIGHT_FN = _.constant(1);
      function greedyFAS(g, weightFn) {
        if (g.nodeCount() <= 1) {
          return [];
        }
        var state = buildState(g, weightFn || DEFAULT_WEIGHT_FN);
        var results = doGreedyFAS(state.graph, state.buckets, state.zeroIdx);
        return _.flatten(_.map(results, function(e) {
          return g.outEdges(e.v, e.w);
        }), true);
      }
      function doGreedyFAS(g, buckets, zeroIdx) {
        var results = [];
        var sources = buckets[buckets.length - 1];
        var sinks = buckets[0];
        var entry;
        while (g.nodeCount()) {
          while (entry = sinks.dequeue()) {
            removeNode(g, buckets, zeroIdx, entry);
          }
          while (entry = sources.dequeue()) {
            removeNode(g, buckets, zeroIdx, entry);
          }
          if (g.nodeCount()) {
            for (var i = buckets.length - 2; i > 0; --i) {
              entry = buckets[i].dequeue();
              if (entry) {
                results = results.concat(removeNode(g, buckets, zeroIdx, entry, true));
                break;
              }
            }
          }
        }
        return results;
      }
      function removeNode(g, buckets, zeroIdx, entry, collectPredecessors) {
        var results = collectPredecessors ? [] : void 0;
        _.forEach(g.inEdges(entry.v), function(edge) {
          var weight = g.edge(edge);
          var uEntry = g.node(edge.v);
          if (collectPredecessors) {
            results.push({ v: edge.v, w: edge.w });
          }
          uEntry.out -= weight;
          assignBucket(buckets, zeroIdx, uEntry);
        });
        _.forEach(g.outEdges(entry.v), function(edge) {
          var weight = g.edge(edge);
          var w = edge.w;
          var wEntry = g.node(w);
          wEntry["in"] -= weight;
          assignBucket(buckets, zeroIdx, wEntry);
        });
        g.removeNode(entry.v);
        return results;
      }
      function buildState(g, weightFn) {
        var fasGraph = new Graph();
        var maxIn = 0;
        var maxOut = 0;
        _.forEach(g.nodes(), function(v) {
          fasGraph.setNode(v, { v, "in": 0, out: 0 });
        });
        _.forEach(g.edges(), function(e) {
          var prevWeight = fasGraph.edge(e.v, e.w) || 0;
          var weight = weightFn(e);
          var edgeWeight = prevWeight + weight;
          fasGraph.setEdge(e.v, e.w, edgeWeight);
          maxOut = Math.max(maxOut, fasGraph.node(e.v).out += weight);
          maxIn = Math.max(maxIn, fasGraph.node(e.w)["in"] += weight);
        });
        var buckets = _.range(maxOut + maxIn + 3).map(function() {
          return new List();
        });
        var zeroIdx = maxIn + 1;
        _.forEach(fasGraph.nodes(), function(v) {
          assignBucket(buckets, zeroIdx, fasGraph.node(v));
        });
        return { graph: fasGraph, buckets, zeroIdx };
      }
      function assignBucket(buckets, zeroIdx, entry) {
        if (!entry.out) {
          buckets[0].enqueue(entry);
        } else if (!entry["in"]) {
          buckets[buckets.length - 1].enqueue(entry);
        } else {
          buckets[entry.out - entry["in"] + zeroIdx].enqueue(entry);
        }
      }
    }
  });

  // node_modules/dagre/lib/acyclic.js
  var require_acyclic = __commonJS({
    "node_modules/dagre/lib/acyclic.js"(exports, module) {
      "use strict";
      var _ = require_lodash2();
      var greedyFAS = require_greedy_fas();
      module.exports = {
        run,
        undo
      };
      function run(g) {
        var fas = g.graph().acyclicer === "greedy" ? greedyFAS(g, weightFn(g)) : dfsFAS(g);
        _.forEach(fas, function(e) {
          var label = g.edge(e);
          g.removeEdge(e);
          label.forwardName = e.name;
          label.reversed = true;
          g.setEdge(e.w, e.v, label, _.uniqueId("rev"));
        });
        function weightFn(g2) {
          return function(e) {
            return g2.edge(e).weight;
          };
        }
      }
      function dfsFAS(g) {
        var fas = [];
        var stack = {};
        var visited = {};
        function dfs(v) {
          if (_.has(visited, v)) {
            return;
          }
          visited[v] = true;
          stack[v] = true;
          _.forEach(g.outEdges(v), function(e) {
            if (_.has(stack, e.w)) {
              fas.push(e);
            } else {
              dfs(e.w);
            }
          });
          delete stack[v];
        }
        _.forEach(g.nodes(), dfs);
        return fas;
      }
      function undo(g) {
        _.forEach(g.edges(), function(e) {
          var label = g.edge(e);
          if (label.reversed) {
            g.removeEdge(e);
            var forwardName = label.forwardName;
            delete label.reversed;
            delete label.forwardName;
            g.setEdge(e.w, e.v, label, forwardName);
          }
        });
      }
    }
  });

  // node_modules/dagre/lib/util.js
  var require_util = __commonJS({
    "node_modules/dagre/lib/util.js"(exports, module) {
      "use strict";
      var _ = require_lodash2();
      var Graph = require_graphlib2().Graph;
      module.exports = {
        addDummyNode,
        simplify,
        asNonCompoundGraph,
        successorWeights,
        predecessorWeights,
        intersectRect,
        buildLayerMatrix,
        normalizeRanks,
        removeEmptyRanks,
        addBorderNode,
        maxRank,
        partition,
        time,
        notime
      };
      function addDummyNode(g, type, attrs, name) {
        var v;
        do {
          v = _.uniqueId(name);
        } while (g.hasNode(v));
        attrs.dummy = type;
        g.setNode(v, attrs);
        return v;
      }
      function simplify(g) {
        var simplified = new Graph().setGraph(g.graph());
        _.forEach(g.nodes(), function(v) {
          simplified.setNode(v, g.node(v));
        });
        _.forEach(g.edges(), function(e) {
          var simpleLabel = simplified.edge(e.v, e.w) || { weight: 0, minlen: 1 };
          var label = g.edge(e);
          simplified.setEdge(e.v, e.w, {
            weight: simpleLabel.weight + label.weight,
            minlen: Math.max(simpleLabel.minlen, label.minlen)
          });
        });
        return simplified;
      }
      function asNonCompoundGraph(g) {
        var simplified = new Graph({ multigraph: g.isMultigraph() }).setGraph(g.graph());
        _.forEach(g.nodes(), function(v) {
          if (!g.children(v).length) {
            simplified.setNode(v, g.node(v));
          }
        });
        _.forEach(g.edges(), function(e) {
          simplified.setEdge(e, g.edge(e));
        });
        return simplified;
      }
      function successorWeights(g) {
        var weightMap = _.map(g.nodes(), function(v) {
          var sucs = {};
          _.forEach(g.outEdges(v), function(e) {
            sucs[e.w] = (sucs[e.w] || 0) + g.edge(e).weight;
          });
          return sucs;
        });
        return _.zipObject(g.nodes(), weightMap);
      }
      function predecessorWeights(g) {
        var weightMap = _.map(g.nodes(), function(v) {
          var preds = {};
          _.forEach(g.inEdges(v), function(e) {
            preds[e.v] = (preds[e.v] || 0) + g.edge(e).weight;
          });
          return preds;
        });
        return _.zipObject(g.nodes(), weightMap);
      }
      function intersectRect(rect, point) {
        var x = rect.x;
        var y = rect.y;
        var dx = point.x - x;
        var dy = point.y - y;
        var w = rect.width / 2;
        var h = rect.height / 2;
        if (!dx && !dy) {
          throw new Error("Not possible to find intersection inside of the rectangle");
        }
        var sx, sy;
        if (Math.abs(dy) * w > Math.abs(dx) * h) {
          if (dy < 0) {
            h = -h;
          }
          sx = h * dx / dy;
          sy = h;
        } else {
          if (dx < 0) {
            w = -w;
          }
          sx = w;
          sy = w * dy / dx;
        }
        return { x: x + sx, y: y + sy };
      }
      function buildLayerMatrix(g) {
        var layering = _.map(_.range(maxRank(g) + 1), function() {
          return [];
        });
        _.forEach(g.nodes(), function(v) {
          var node = g.node(v);
          var rank = node.rank;
          if (!_.isUndefined(rank)) {
            layering[rank][node.order] = v;
          }
        });
        return layering;
      }
      function normalizeRanks(g) {
        var min = _.min(_.map(g.nodes(), function(v) {
          return g.node(v).rank;
        }));
        _.forEach(g.nodes(), function(v) {
          var node = g.node(v);
          if (_.has(node, "rank")) {
            node.rank -= min;
          }
        });
      }
      function removeEmptyRanks(g) {
        var offset = _.min(_.map(g.nodes(), function(v) {
          return g.node(v).rank;
        }));
        var layers = [];
        _.forEach(g.nodes(), function(v) {
          var rank = g.node(v).rank - offset;
          if (!layers[rank]) {
            layers[rank] = [];
          }
          layers[rank].push(v);
        });
        var delta = 0;
        var nodeRankFactor = g.graph().nodeRankFactor;
        _.forEach(layers, function(vs, i) {
          if (_.isUndefined(vs) && i % nodeRankFactor !== 0) {
            --delta;
          } else if (delta) {
            _.forEach(vs, function(v) {
              g.node(v).rank += delta;
            });
          }
        });
      }
      function addBorderNode(g, prefix, rank, order) {
        var node = {
          width: 0,
          height: 0
        };
        if (arguments.length >= 4) {
          node.rank = rank;
          node.order = order;
        }
        return addDummyNode(g, "border", node, prefix);
      }
      function maxRank(g) {
        return _.max(_.map(g.nodes(), function(v) {
          var rank = g.node(v).rank;
          if (!_.isUndefined(rank)) {
            return rank;
          }
        }));
      }
      function partition(collection, fn) {
        var result = { lhs: [], rhs: [] };
        _.forEach(collection, function(value) {
          if (fn(value)) {
            result.lhs.push(value);
          } else {
            result.rhs.push(value);
          }
        });
        return result;
      }
      function time(name, fn) {
        var start = _.now();
        try {
          return fn();
        } finally {
          console.log(name + " time: " + (_.now() - start) + "ms");
        }
      }
      function notime(name, fn) {
        return fn();
      }
    }
  });

  // node_modules/dagre/lib/normalize.js
  var require_normalize = __commonJS({
    "node_modules/dagre/lib/normalize.js"(exports, module) {
      "use strict";
      var _ = require_lodash2();
      var util = require_util();
      module.exports = {
        run,
        undo
      };
      function run(g) {
        g.graph().dummyChains = [];
        _.forEach(g.edges(), function(edge) {
          normalizeEdge(g, edge);
        });
      }
      function normalizeEdge(g, e) {
        var v = e.v;
        var vRank = g.node(v).rank;
        var w = e.w;
        var wRank = g.node(w).rank;
        var name = e.name;
        var edgeLabel = g.edge(e);
        var labelRank = edgeLabel.labelRank;
        if (wRank === vRank + 1) return;
        g.removeEdge(e);
        var dummy, attrs, i;
        for (i = 0, ++vRank; vRank < wRank; ++i, ++vRank) {
          edgeLabel.points = [];
          attrs = {
            width: 0,
            height: 0,
            edgeLabel,
            edgeObj: e,
            rank: vRank
          };
          dummy = util.addDummyNode(g, "edge", attrs, "_d");
          if (vRank === labelRank) {
            attrs.width = edgeLabel.width;
            attrs.height = edgeLabel.height;
            attrs.dummy = "edge-label";
            attrs.labelpos = edgeLabel.labelpos;
          }
          g.setEdge(v, dummy, { weight: edgeLabel.weight }, name);
          if (i === 0) {
            g.graph().dummyChains.push(dummy);
          }
          v = dummy;
        }
        g.setEdge(v, w, { weight: edgeLabel.weight }, name);
      }
      function undo(g) {
        _.forEach(g.graph().dummyChains, function(v) {
          var node = g.node(v);
          var origLabel = node.edgeLabel;
          var w;
          g.setEdge(node.edgeObj, origLabel);
          while (node.dummy) {
            w = g.successors(v)[0];
            g.removeNode(v);
            origLabel.points.push({ x: node.x, y: node.y });
            if (node.dummy === "edge-label") {
              origLabel.x = node.x;
              origLabel.y = node.y;
              origLabel.width = node.width;
              origLabel.height = node.height;
            }
            v = w;
            node = g.node(v);
          }
        });
      }
    }
  });

  // node_modules/dagre/lib/rank/util.js
  var require_util2 = __commonJS({
    "node_modules/dagre/lib/rank/util.js"(exports, module) {
      "use strict";
      var _ = require_lodash2();
      module.exports = {
        longestPath,
        slack
      };
      function longestPath(g) {
        var visited = {};
        function dfs(v) {
          var label = g.node(v);
          if (_.has(visited, v)) {
            return label.rank;
          }
          visited[v] = true;
          var rank = _.min(_.map(g.outEdges(v), function(e) {
            return dfs(e.w) - g.edge(e).minlen;
          }));
          if (rank === Number.POSITIVE_INFINITY || // return value of _.map([]) for Lodash 3
          rank === void 0 || // return value of _.map([]) for Lodash 4
          rank === null) {
            rank = 0;
          }
          return label.rank = rank;
        }
        _.forEach(g.sources(), dfs);
      }
      function slack(g, e) {
        return g.node(e.w).rank - g.node(e.v).rank - g.edge(e).minlen;
      }
    }
  });

  // node_modules/dagre/lib/rank/feasible-tree.js
  var require_feasible_tree = __commonJS({
    "node_modules/dagre/lib/rank/feasible-tree.js"(exports, module) {
      "use strict";
      var _ = require_lodash2();
      var Graph = require_graphlib2().Graph;
      var slack = require_util2().slack;
      module.exports = feasibleTree;
      function feasibleTree(g) {
        var t = new Graph({ directed: false });
        var start = g.nodes()[0];
        var size = g.nodeCount();
        t.setNode(start, {});
        var edge, delta;
        while (tightTree(t, g) < size) {
          edge = findMinSlackEdge(t, g);
          delta = t.hasNode(edge.v) ? slack(g, edge) : -slack(g, edge);
          shiftRanks(t, g, delta);
        }
        return t;
      }
      function tightTree(t, g) {
        function dfs(v) {
          _.forEach(g.nodeEdges(v), function(e) {
            var edgeV = e.v, w = v === edgeV ? e.w : edgeV;
            if (!t.hasNode(w) && !slack(g, e)) {
              t.setNode(w, {});
              t.setEdge(v, w, {});
              dfs(w);
            }
          });
        }
        _.forEach(t.nodes(), dfs);
        return t.nodeCount();
      }
      function findMinSlackEdge(t, g) {
        return _.minBy(g.edges(), function(e) {
          if (t.hasNode(e.v) !== t.hasNode(e.w)) {
            return slack(g, e);
          }
        });
      }
      function shiftRanks(t, g, delta) {
        _.forEach(t.nodes(), function(v) {
          g.node(v).rank += delta;
        });
      }
    }
  });

  // node_modules/dagre/lib/rank/network-simplex.js
  var require_network_simplex = __commonJS({
    "node_modules/dagre/lib/rank/network-simplex.js"(exports, module) {
      "use strict";
      var _ = require_lodash2();
      var feasibleTree = require_feasible_tree();
      var slack = require_util2().slack;
      var initRank = require_util2().longestPath;
      var preorder = require_graphlib2().alg.preorder;
      var postorder = require_graphlib2().alg.postorder;
      var simplify = require_util().simplify;
      module.exports = networkSimplex;
      networkSimplex.initLowLimValues = initLowLimValues;
      networkSimplex.initCutValues = initCutValues;
      networkSimplex.calcCutValue = calcCutValue;
      networkSimplex.leaveEdge = leaveEdge;
      networkSimplex.enterEdge = enterEdge;
      networkSimplex.exchangeEdges = exchangeEdges;
      function networkSimplex(g) {
        g = simplify(g);
        initRank(g);
        var t = feasibleTree(g);
        initLowLimValues(t);
        initCutValues(t, g);
        var e, f;
        while (e = leaveEdge(t)) {
          f = enterEdge(t, g, e);
          exchangeEdges(t, g, e, f);
        }
      }
      function initCutValues(t, g) {
        var vs = postorder(t, t.nodes());
        vs = vs.slice(0, vs.length - 1);
        _.forEach(vs, function(v) {
          assignCutValue(t, g, v);
        });
      }
      function assignCutValue(t, g, child) {
        var childLab = t.node(child);
        var parent = childLab.parent;
        t.edge(child, parent).cutvalue = calcCutValue(t, g, child);
      }
      function calcCutValue(t, g, child) {
        var childLab = t.node(child);
        var parent = childLab.parent;
        var childIsTail = true;
        var graphEdge = g.edge(child, parent);
        var cutValue = 0;
        if (!graphEdge) {
          childIsTail = false;
          graphEdge = g.edge(parent, child);
        }
        cutValue = graphEdge.weight;
        _.forEach(g.nodeEdges(child), function(e) {
          var isOutEdge = e.v === child, other = isOutEdge ? e.w : e.v;
          if (other !== parent) {
            var pointsToHead = isOutEdge === childIsTail, otherWeight = g.edge(e).weight;
            cutValue += pointsToHead ? otherWeight : -otherWeight;
            if (isTreeEdge(t, child, other)) {
              var otherCutValue = t.edge(child, other).cutvalue;
              cutValue += pointsToHead ? -otherCutValue : otherCutValue;
            }
          }
        });
        return cutValue;
      }
      function initLowLimValues(tree, root) {
        if (arguments.length < 2) {
          root = tree.nodes()[0];
        }
        dfsAssignLowLim(tree, {}, 1, root);
      }
      function dfsAssignLowLim(tree, visited, nextLim, v, parent) {
        var low = nextLim;
        var label = tree.node(v);
        visited[v] = true;
        _.forEach(tree.neighbors(v), function(w) {
          if (!_.has(visited, w)) {
            nextLim = dfsAssignLowLim(tree, visited, nextLim, w, v);
          }
        });
        label.low = low;
        label.lim = nextLim++;
        if (parent) {
          label.parent = parent;
        } else {
          delete label.parent;
        }
        return nextLim;
      }
      function leaveEdge(tree) {
        return _.find(tree.edges(), function(e) {
          return tree.edge(e).cutvalue < 0;
        });
      }
      function enterEdge(t, g, edge) {
        var v = edge.v;
        var w = edge.w;
        if (!g.hasEdge(v, w)) {
          v = edge.w;
          w = edge.v;
        }
        var vLabel = t.node(v);
        var wLabel = t.node(w);
        var tailLabel = vLabel;
        var flip = false;
        if (vLabel.lim > wLabel.lim) {
          tailLabel = wLabel;
          flip = true;
        }
        var candidates = _.filter(g.edges(), function(edge2) {
          return flip === isDescendant(t, t.node(edge2.v), tailLabel) && flip !== isDescendant(t, t.node(edge2.w), tailLabel);
        });
        return _.minBy(candidates, function(edge2) {
          return slack(g, edge2);
        });
      }
      function exchangeEdges(t, g, e, f) {
        var v = e.v;
        var w = e.w;
        t.removeEdge(v, w);
        t.setEdge(f.v, f.w, {});
        initLowLimValues(t);
        initCutValues(t, g);
        updateRanks(t, g);
      }
      function updateRanks(t, g) {
        var root = _.find(t.nodes(), function(v) {
          return !g.node(v).parent;
        });
        var vs = preorder(t, root);
        vs = vs.slice(1);
        _.forEach(vs, function(v) {
          var parent = t.node(v).parent, edge = g.edge(v, parent), flipped = false;
          if (!edge) {
            edge = g.edge(parent, v);
            flipped = true;
          }
          g.node(v).rank = g.node(parent).rank + (flipped ? edge.minlen : -edge.minlen);
        });
      }
      function isTreeEdge(tree, u, v) {
        return tree.hasEdge(u, v);
      }
      function isDescendant(tree, vLabel, rootLabel) {
        return rootLabel.low <= vLabel.lim && vLabel.lim <= rootLabel.lim;
      }
    }
  });

  // node_modules/dagre/lib/rank/index.js
  var require_rank = __commonJS({
    "node_modules/dagre/lib/rank/index.js"(exports, module) {
      "use strict";
      var rankUtil = require_util2();
      var longestPath = rankUtil.longestPath;
      var feasibleTree = require_feasible_tree();
      var networkSimplex = require_network_simplex();
      module.exports = rank;
      function rank(g) {
        switch (g.graph().ranker) {
          case "network-simplex":
            networkSimplexRanker(g);
            break;
          case "tight-tree":
            tightTreeRanker(g);
            break;
          case "longest-path":
            longestPathRanker(g);
            break;
          default:
            networkSimplexRanker(g);
        }
      }
      var longestPathRanker = longestPath;
      function tightTreeRanker(g) {
        longestPath(g);
        feasibleTree(g);
      }
      function networkSimplexRanker(g) {
        networkSimplex(g);
      }
    }
  });

  // node_modules/dagre/lib/parent-dummy-chains.js
  var require_parent_dummy_chains = __commonJS({
    "node_modules/dagre/lib/parent-dummy-chains.js"(exports, module) {
      var _ = require_lodash2();
      module.exports = parentDummyChains;
      function parentDummyChains(g) {
        var postorderNums = postorder(g);
        _.forEach(g.graph().dummyChains, function(v) {
          var node = g.node(v);
          var edgeObj = node.edgeObj;
          var pathData = findPath(g, postorderNums, edgeObj.v, edgeObj.w);
          var path = pathData.path;
          var lca = pathData.lca;
          var pathIdx = 0;
          var pathV = path[pathIdx];
          var ascending = true;
          while (v !== edgeObj.w) {
            node = g.node(v);
            if (ascending) {
              while ((pathV = path[pathIdx]) !== lca && g.node(pathV).maxRank < node.rank) {
                pathIdx++;
              }
              if (pathV === lca) {
                ascending = false;
              }
            }
            if (!ascending) {
              while (pathIdx < path.length - 1 && g.node(pathV = path[pathIdx + 1]).minRank <= node.rank) {
                pathIdx++;
              }
              pathV = path[pathIdx];
            }
            g.setParent(v, pathV);
            v = g.successors(v)[0];
          }
        });
      }
      function findPath(g, postorderNums, v, w) {
        var vPath = [];
        var wPath = [];
        var low = Math.min(postorderNums[v].low, postorderNums[w].low);
        var lim = Math.max(postorderNums[v].lim, postorderNums[w].lim);
        var parent;
        var lca;
        parent = v;
        do {
          parent = g.parent(parent);
          vPath.push(parent);
        } while (parent && (postorderNums[parent].low > low || lim > postorderNums[parent].lim));
        lca = parent;
        parent = w;
        while ((parent = g.parent(parent)) !== lca) {
          wPath.push(parent);
        }
        return { path: vPath.concat(wPath.reverse()), lca };
      }
      function postorder(g) {
        var result = {};
        var lim = 0;
        function dfs(v) {
          var low = lim;
          _.forEach(g.children(v), dfs);
          result[v] = { low, lim: lim++ };
        }
        _.forEach(g.children(), dfs);
        return result;
      }
    }
  });

  // node_modules/dagre/lib/nesting-graph.js
  var require_nesting_graph = __commonJS({
    "node_modules/dagre/lib/nesting-graph.js"(exports, module) {
      var _ = require_lodash2();
      var util = require_util();
      module.exports = {
        run,
        cleanup
      };
      function run(g) {
        var root = util.addDummyNode(g, "root", {}, "_root");
        var depths = treeDepths(g);
        var height = _.max(_.values(depths)) - 1;
        var nodeSep = 2 * height + 1;
        g.graph().nestingRoot = root;
        _.forEach(g.edges(), function(e) {
          g.edge(e).minlen *= nodeSep;
        });
        var weight = sumWeights(g) + 1;
        _.forEach(g.children(), function(child) {
          dfs(g, root, nodeSep, weight, height, depths, child);
        });
        g.graph().nodeRankFactor = nodeSep;
      }
      function dfs(g, root, nodeSep, weight, height, depths, v) {
        var children = g.children(v);
        if (!children.length) {
          if (v !== root) {
            g.setEdge(root, v, { weight: 0, minlen: nodeSep });
          }
          return;
        }
        var top = util.addBorderNode(g, "_bt");
        var bottom = util.addBorderNode(g, "_bb");
        var label = g.node(v);
        g.setParent(top, v);
        label.borderTop = top;
        g.setParent(bottom, v);
        label.borderBottom = bottom;
        _.forEach(children, function(child) {
          dfs(g, root, nodeSep, weight, height, depths, child);
          var childNode = g.node(child);
          var childTop = childNode.borderTop ? childNode.borderTop : child;
          var childBottom = childNode.borderBottom ? childNode.borderBottom : child;
          var thisWeight = childNode.borderTop ? weight : 2 * weight;
          var minlen = childTop !== childBottom ? 1 : height - depths[v] + 1;
          g.setEdge(top, childTop, {
            weight: thisWeight,
            minlen,
            nestingEdge: true
          });
          g.setEdge(childBottom, bottom, {
            weight: thisWeight,
            minlen,
            nestingEdge: true
          });
        });
        if (!g.parent(v)) {
          g.setEdge(root, top, { weight: 0, minlen: height + depths[v] });
        }
      }
      function treeDepths(g) {
        var depths = {};
        function dfs2(v, depth) {
          var children = g.children(v);
          if (children && children.length) {
            _.forEach(children, function(child) {
              dfs2(child, depth + 1);
            });
          }
          depths[v] = depth;
        }
        _.forEach(g.children(), function(v) {
          dfs2(v, 1);
        });
        return depths;
      }
      function sumWeights(g) {
        return _.reduce(g.edges(), function(acc, e) {
          return acc + g.edge(e).weight;
        }, 0);
      }
      function cleanup(g) {
        var graphLabel = g.graph();
        g.removeNode(graphLabel.nestingRoot);
        delete graphLabel.nestingRoot;
        _.forEach(g.edges(), function(e) {
          var edge = g.edge(e);
          if (edge.nestingEdge) {
            g.removeEdge(e);
          }
        });
      }
    }
  });

  // node_modules/dagre/lib/add-border-segments.js
  var require_add_border_segments = __commonJS({
    "node_modules/dagre/lib/add-border-segments.js"(exports, module) {
      var _ = require_lodash2();
      var util = require_util();
      module.exports = addBorderSegments;
      function addBorderSegments(g) {
        function dfs(v) {
          var children = g.children(v);
          var node = g.node(v);
          if (children.length) {
            _.forEach(children, dfs);
          }
          if (_.has(node, "minRank")) {
            node.borderLeft = [];
            node.borderRight = [];
            for (var rank = node.minRank, maxRank = node.maxRank + 1; rank < maxRank; ++rank) {
              addBorderNode(g, "borderLeft", "_bl", v, node, rank);
              addBorderNode(g, "borderRight", "_br", v, node, rank);
            }
          }
        }
        _.forEach(g.children(), dfs);
      }
      function addBorderNode(g, prop, prefix, sg, sgNode, rank) {
        var label = { width: 0, height: 0, rank, borderType: prop };
        var prev = sgNode[prop][rank - 1];
        var curr = util.addDummyNode(g, "border", label, prefix);
        sgNode[prop][rank] = curr;
        g.setParent(curr, sg);
        if (prev) {
          g.setEdge(prev, curr, { weight: 1 });
        }
      }
    }
  });

  // node_modules/dagre/lib/coordinate-system.js
  var require_coordinate_system = __commonJS({
    "node_modules/dagre/lib/coordinate-system.js"(exports, module) {
      "use strict";
      var _ = require_lodash2();
      module.exports = {
        adjust,
        undo
      };
      function adjust(g) {
        var rankDir = g.graph().rankdir.toLowerCase();
        if (rankDir === "lr" || rankDir === "rl") {
          swapWidthHeight(g);
        }
      }
      function undo(g) {
        var rankDir = g.graph().rankdir.toLowerCase();
        if (rankDir === "bt" || rankDir === "rl") {
          reverseY(g);
        }
        if (rankDir === "lr" || rankDir === "rl") {
          swapXY(g);
          swapWidthHeight(g);
        }
      }
      function swapWidthHeight(g) {
        _.forEach(g.nodes(), function(v) {
          swapWidthHeightOne(g.node(v));
        });
        _.forEach(g.edges(), function(e) {
          swapWidthHeightOne(g.edge(e));
        });
      }
      function swapWidthHeightOne(attrs) {
        var w = attrs.width;
        attrs.width = attrs.height;
        attrs.height = w;
      }
      function reverseY(g) {
        _.forEach(g.nodes(), function(v) {
          reverseYOne(g.node(v));
        });
        _.forEach(g.edges(), function(e) {
          var edge = g.edge(e);
          _.forEach(edge.points, reverseYOne);
          if (_.has(edge, "y")) {
            reverseYOne(edge);
          }
        });
      }
      function reverseYOne(attrs) {
        attrs.y = -attrs.y;
      }
      function swapXY(g) {
        _.forEach(g.nodes(), function(v) {
          swapXYOne(g.node(v));
        });
        _.forEach(g.edges(), function(e) {
          var edge = g.edge(e);
          _.forEach(edge.points, swapXYOne);
          if (_.has(edge, "x")) {
            swapXYOne(edge);
          }
        });
      }
      function swapXYOne(attrs) {
        var x = attrs.x;
        attrs.x = attrs.y;
        attrs.y = x;
      }
    }
  });

  // node_modules/dagre/lib/order/init-order.js
  var require_init_order = __commonJS({
    "node_modules/dagre/lib/order/init-order.js"(exports, module) {
      "use strict";
      var _ = require_lodash2();
      module.exports = initOrder;
      function initOrder(g) {
        var visited = {};
        var simpleNodes = _.filter(g.nodes(), function(v) {
          return !g.children(v).length;
        });
        var maxRank = _.max(_.map(simpleNodes, function(v) {
          return g.node(v).rank;
        }));
        var layers = _.map(_.range(maxRank + 1), function() {
          return [];
        });
        function dfs(v) {
          if (_.has(visited, v)) return;
          visited[v] = true;
          var node = g.node(v);
          layers[node.rank].push(v);
          _.forEach(g.successors(v), dfs);
        }
        var orderedVs = _.sortBy(simpleNodes, function(v) {
          return g.node(v).rank;
        });
        _.forEach(orderedVs, dfs);
        return layers;
      }
    }
  });

  // node_modules/dagre/lib/order/cross-count.js
  var require_cross_count = __commonJS({
    "node_modules/dagre/lib/order/cross-count.js"(exports, module) {
      "use strict";
      var _ = require_lodash2();
      module.exports = crossCount;
      function crossCount(g, layering) {
        var cc = 0;
        for (var i = 1; i < layering.length; ++i) {
          cc += twoLayerCrossCount(g, layering[i - 1], layering[i]);
        }
        return cc;
      }
      function twoLayerCrossCount(g, northLayer, southLayer) {
        var southPos = _.zipObject(
          southLayer,
          _.map(southLayer, function(v, i) {
            return i;
          })
        );
        var southEntries = _.flatten(_.map(northLayer, function(v) {
          return _.sortBy(_.map(g.outEdges(v), function(e) {
            return { pos: southPos[e.w], weight: g.edge(e).weight };
          }), "pos");
        }), true);
        var firstIndex = 1;
        while (firstIndex < southLayer.length) firstIndex <<= 1;
        var treeSize = 2 * firstIndex - 1;
        firstIndex -= 1;
        var tree = _.map(new Array(treeSize), function() {
          return 0;
        });
        var cc = 0;
        _.forEach(southEntries.forEach(function(entry) {
          var index = entry.pos + firstIndex;
          tree[index] += entry.weight;
          var weightSum = 0;
          while (index > 0) {
            if (index % 2) {
              weightSum += tree[index + 1];
            }
            index = index - 1 >> 1;
            tree[index] += entry.weight;
          }
          cc += entry.weight * weightSum;
        }));
        return cc;
      }
    }
  });

  // node_modules/dagre/lib/order/barycenter.js
  var require_barycenter = __commonJS({
    "node_modules/dagre/lib/order/barycenter.js"(exports, module) {
      var _ = require_lodash2();
      module.exports = barycenter;
      function barycenter(g, movable) {
        return _.map(movable, function(v) {
          var inV = g.inEdges(v);
          if (!inV.length) {
            return { v };
          } else {
            var result = _.reduce(inV, function(acc, e) {
              var edge = g.edge(e), nodeU = g.node(e.v);
              return {
                sum: acc.sum + edge.weight * nodeU.order,
                weight: acc.weight + edge.weight
              };
            }, { sum: 0, weight: 0 });
            return {
              v,
              barycenter: result.sum / result.weight,
              weight: result.weight
            };
          }
        });
      }
    }
  });

  // node_modules/dagre/lib/order/resolve-conflicts.js
  var require_resolve_conflicts = __commonJS({
    "node_modules/dagre/lib/order/resolve-conflicts.js"(exports, module) {
      "use strict";
      var _ = require_lodash2();
      module.exports = resolveConflicts;
      function resolveConflicts(entries, cg) {
        var mappedEntries = {};
        _.forEach(entries, function(entry, i) {
          var tmp = mappedEntries[entry.v] = {
            indegree: 0,
            "in": [],
            out: [],
            vs: [entry.v],
            i
          };
          if (!_.isUndefined(entry.barycenter)) {
            tmp.barycenter = entry.barycenter;
            tmp.weight = entry.weight;
          }
        });
        _.forEach(cg.edges(), function(e) {
          var entryV = mappedEntries[e.v];
          var entryW = mappedEntries[e.w];
          if (!_.isUndefined(entryV) && !_.isUndefined(entryW)) {
            entryW.indegree++;
            entryV.out.push(mappedEntries[e.w]);
          }
        });
        var sourceSet = _.filter(mappedEntries, function(entry) {
          return !entry.indegree;
        });
        return doResolveConflicts(sourceSet);
      }
      function doResolveConflicts(sourceSet) {
        var entries = [];
        function handleIn(vEntry) {
          return function(uEntry) {
            if (uEntry.merged) {
              return;
            }
            if (_.isUndefined(uEntry.barycenter) || _.isUndefined(vEntry.barycenter) || uEntry.barycenter >= vEntry.barycenter) {
              mergeEntries(vEntry, uEntry);
            }
          };
        }
        function handleOut(vEntry) {
          return function(wEntry) {
            wEntry["in"].push(vEntry);
            if (--wEntry.indegree === 0) {
              sourceSet.push(wEntry);
            }
          };
        }
        while (sourceSet.length) {
          var entry = sourceSet.pop();
          entries.push(entry);
          _.forEach(entry["in"].reverse(), handleIn(entry));
          _.forEach(entry.out, handleOut(entry));
        }
        return _.map(
          _.filter(entries, function(entry2) {
            return !entry2.merged;
          }),
          function(entry2) {
            return _.pick(entry2, ["vs", "i", "barycenter", "weight"]);
          }
        );
      }
      function mergeEntries(target, source) {
        var sum = 0;
        var weight = 0;
        if (target.weight) {
          sum += target.barycenter * target.weight;
          weight += target.weight;
        }
        if (source.weight) {
          sum += source.barycenter * source.weight;
          weight += source.weight;
        }
        target.vs = source.vs.concat(target.vs);
        target.barycenter = sum / weight;
        target.weight = weight;
        target.i = Math.min(source.i, target.i);
        source.merged = true;
      }
    }
  });

  // node_modules/dagre/lib/order/sort.js
  var require_sort = __commonJS({
    "node_modules/dagre/lib/order/sort.js"(exports, module) {
      var _ = require_lodash2();
      var util = require_util();
      module.exports = sort;
      function sort(entries, biasRight) {
        var parts = util.partition(entries, function(entry) {
          return _.has(entry, "barycenter");
        });
        var sortable = parts.lhs, unsortable = _.sortBy(parts.rhs, function(entry) {
          return -entry.i;
        }), vs = [], sum = 0, weight = 0, vsIndex = 0;
        sortable.sort(compareWithBias(!!biasRight));
        vsIndex = consumeUnsortable(vs, unsortable, vsIndex);
        _.forEach(sortable, function(entry) {
          vsIndex += entry.vs.length;
          vs.push(entry.vs);
          sum += entry.barycenter * entry.weight;
          weight += entry.weight;
          vsIndex = consumeUnsortable(vs, unsortable, vsIndex);
        });
        var result = { vs: _.flatten(vs, true) };
        if (weight) {
          result.barycenter = sum / weight;
          result.weight = weight;
        }
        return result;
      }
      function consumeUnsortable(vs, unsortable, index) {
        var last;
        while (unsortable.length && (last = _.last(unsortable)).i <= index) {
          unsortable.pop();
          vs.push(last.vs);
          index++;
        }
        return index;
      }
      function compareWithBias(bias) {
        return function(entryV, entryW) {
          if (entryV.barycenter < entryW.barycenter) {
            return -1;
          } else if (entryV.barycenter > entryW.barycenter) {
            return 1;
          }
          return !bias ? entryV.i - entryW.i : entryW.i - entryV.i;
        };
      }
    }
  });

  // node_modules/dagre/lib/order/sort-subgraph.js
  var require_sort_subgraph = __commonJS({
    "node_modules/dagre/lib/order/sort-subgraph.js"(exports, module) {
      var _ = require_lodash2();
      var barycenter = require_barycenter();
      var resolveConflicts = require_resolve_conflicts();
      var sort = require_sort();
      module.exports = sortSubgraph;
      function sortSubgraph(g, v, cg, biasRight) {
        var movable = g.children(v);
        var node = g.node(v);
        var bl = node ? node.borderLeft : void 0;
        var br = node ? node.borderRight : void 0;
        var subgraphs = {};
        if (bl) {
          movable = _.filter(movable, function(w) {
            return w !== bl && w !== br;
          });
        }
        var barycenters = barycenter(g, movable);
        _.forEach(barycenters, function(entry) {
          if (g.children(entry.v).length) {
            var subgraphResult = sortSubgraph(g, entry.v, cg, biasRight);
            subgraphs[entry.v] = subgraphResult;
            if (_.has(subgraphResult, "barycenter")) {
              mergeBarycenters(entry, subgraphResult);
            }
          }
        });
        var entries = resolveConflicts(barycenters, cg);
        expandSubgraphs(entries, subgraphs);
        var result = sort(entries, biasRight);
        if (bl) {
          result.vs = _.flatten([bl, result.vs, br], true);
          if (g.predecessors(bl).length) {
            var blPred = g.node(g.predecessors(bl)[0]), brPred = g.node(g.predecessors(br)[0]);
            if (!_.has(result, "barycenter")) {
              result.barycenter = 0;
              result.weight = 0;
            }
            result.barycenter = (result.barycenter * result.weight + blPred.order + brPred.order) / (result.weight + 2);
            result.weight += 2;
          }
        }
        return result;
      }
      function expandSubgraphs(entries, subgraphs) {
        _.forEach(entries, function(entry) {
          entry.vs = _.flatten(entry.vs.map(function(v) {
            if (subgraphs[v]) {
              return subgraphs[v].vs;
            }
            return v;
          }), true);
        });
      }
      function mergeBarycenters(target, other) {
        if (!_.isUndefined(target.barycenter)) {
          target.barycenter = (target.barycenter * target.weight + other.barycenter * other.weight) / (target.weight + other.weight);
          target.weight += other.weight;
        } else {
          target.barycenter = other.barycenter;
          target.weight = other.weight;
        }
      }
    }
  });

  // node_modules/dagre/lib/order/build-layer-graph.js
  var require_build_layer_graph = __commonJS({
    "node_modules/dagre/lib/order/build-layer-graph.js"(exports, module) {
      var _ = require_lodash2();
      var Graph = require_graphlib2().Graph;
      module.exports = buildLayerGraph;
      function buildLayerGraph(g, rank, relationship) {
        var root = createRootNode(g), result = new Graph({ compound: true }).setGraph({ root }).setDefaultNodeLabel(function(v) {
          return g.node(v);
        });
        _.forEach(g.nodes(), function(v) {
          var node = g.node(v), parent = g.parent(v);
          if (node.rank === rank || node.minRank <= rank && rank <= node.maxRank) {
            result.setNode(v);
            result.setParent(v, parent || root);
            _.forEach(g[relationship](v), function(e) {
              var u = e.v === v ? e.w : e.v, edge = result.edge(u, v), weight = !_.isUndefined(edge) ? edge.weight : 0;
              result.setEdge(u, v, { weight: g.edge(e).weight + weight });
            });
            if (_.has(node, "minRank")) {
              result.setNode(v, {
                borderLeft: node.borderLeft[rank],
                borderRight: node.borderRight[rank]
              });
            }
          }
        });
        return result;
      }
      function createRootNode(g) {
        var v;
        while (g.hasNode(v = _.uniqueId("_root"))) ;
        return v;
      }
    }
  });

  // node_modules/dagre/lib/order/add-subgraph-constraints.js
  var require_add_subgraph_constraints = __commonJS({
    "node_modules/dagre/lib/order/add-subgraph-constraints.js"(exports, module) {
      var _ = require_lodash2();
      module.exports = addSubgraphConstraints;
      function addSubgraphConstraints(g, cg, vs) {
        var prev = {}, rootPrev;
        _.forEach(vs, function(v) {
          var child = g.parent(v), parent, prevChild;
          while (child) {
            parent = g.parent(child);
            if (parent) {
              prevChild = prev[parent];
              prev[parent] = child;
            } else {
              prevChild = rootPrev;
              rootPrev = child;
            }
            if (prevChild && prevChild !== child) {
              cg.setEdge(prevChild, child);
              return;
            }
            child = parent;
          }
        });
      }
    }
  });

  // node_modules/dagre/lib/order/index.js
  var require_order = __commonJS({
    "node_modules/dagre/lib/order/index.js"(exports, module) {
      "use strict";
      var _ = require_lodash2();
      var initOrder = require_init_order();
      var crossCount = require_cross_count();
      var sortSubgraph = require_sort_subgraph();
      var buildLayerGraph = require_build_layer_graph();
      var addSubgraphConstraints = require_add_subgraph_constraints();
      var Graph = require_graphlib2().Graph;
      var util = require_util();
      module.exports = order;
      function order(g) {
        var maxRank = util.maxRank(g), downLayerGraphs = buildLayerGraphs(g, _.range(1, maxRank + 1), "inEdges"), upLayerGraphs = buildLayerGraphs(g, _.range(maxRank - 1, -1, -1), "outEdges");
        var layering = initOrder(g);
        assignOrder(g, layering);
        var bestCC = Number.POSITIVE_INFINITY, best;
        for (var i = 0, lastBest = 0; lastBest < 4; ++i, ++lastBest) {
          sweepLayerGraphs(i % 2 ? downLayerGraphs : upLayerGraphs, i % 4 >= 2);
          layering = util.buildLayerMatrix(g);
          var cc = crossCount(g, layering);
          if (cc < bestCC) {
            lastBest = 0;
            best = _.cloneDeep(layering);
            bestCC = cc;
          }
        }
        assignOrder(g, best);
      }
      function buildLayerGraphs(g, ranks, relationship) {
        return _.map(ranks, function(rank) {
          return buildLayerGraph(g, rank, relationship);
        });
      }
      function sweepLayerGraphs(layerGraphs, biasRight) {
        var cg = new Graph();
        _.forEach(layerGraphs, function(lg) {
          var root = lg.graph().root;
          var sorted = sortSubgraph(lg, root, cg, biasRight);
          _.forEach(sorted.vs, function(v, i) {
            lg.node(v).order = i;
          });
          addSubgraphConstraints(lg, cg, sorted.vs);
        });
      }
      function assignOrder(g, layering) {
        _.forEach(layering, function(layer) {
          _.forEach(layer, function(v, i) {
            g.node(v).order = i;
          });
        });
      }
    }
  });

  // node_modules/dagre/lib/position/bk.js
  var require_bk = __commonJS({
    "node_modules/dagre/lib/position/bk.js"(exports, module) {
      "use strict";
      var _ = require_lodash2();
      var Graph = require_graphlib2().Graph;
      var util = require_util();
      module.exports = {
        positionX,
        findType1Conflicts,
        findType2Conflicts,
        addConflict,
        hasConflict,
        verticalAlignment,
        horizontalCompaction,
        alignCoordinates,
        findSmallestWidthAlignment,
        balance
      };
      function findType1Conflicts(g, layering) {
        var conflicts = {};
        function visitLayer(prevLayer, layer) {
          var k0 = 0, scanPos = 0, prevLayerLength = prevLayer.length, lastNode = _.last(layer);
          _.forEach(layer, function(v, i) {
            var w = findOtherInnerSegmentNode(g, v), k1 = w ? g.node(w).order : prevLayerLength;
            if (w || v === lastNode) {
              _.forEach(layer.slice(scanPos, i + 1), function(scanNode) {
                _.forEach(g.predecessors(scanNode), function(u) {
                  var uLabel = g.node(u), uPos = uLabel.order;
                  if ((uPos < k0 || k1 < uPos) && !(uLabel.dummy && g.node(scanNode).dummy)) {
                    addConflict(conflicts, u, scanNode);
                  }
                });
              });
              scanPos = i + 1;
              k0 = k1;
            }
          });
          return layer;
        }
        _.reduce(layering, visitLayer);
        return conflicts;
      }
      function findType2Conflicts(g, layering) {
        var conflicts = {};
        function scan(south, southPos, southEnd, prevNorthBorder, nextNorthBorder) {
          var v;
          _.forEach(_.range(southPos, southEnd), function(i) {
            v = south[i];
            if (g.node(v).dummy) {
              _.forEach(g.predecessors(v), function(u) {
                var uNode = g.node(u);
                if (uNode.dummy && (uNode.order < prevNorthBorder || uNode.order > nextNorthBorder)) {
                  addConflict(conflicts, u, v);
                }
              });
            }
          });
        }
        function visitLayer(north, south) {
          var prevNorthPos = -1, nextNorthPos, southPos = 0;
          _.forEach(south, function(v, southLookahead) {
            if (g.node(v).dummy === "border") {
              var predecessors = g.predecessors(v);
              if (predecessors.length) {
                nextNorthPos = g.node(predecessors[0]).order;
                scan(south, southPos, southLookahead, prevNorthPos, nextNorthPos);
                southPos = southLookahead;
                prevNorthPos = nextNorthPos;
              }
            }
            scan(south, southPos, south.length, nextNorthPos, north.length);
          });
          return south;
        }
        _.reduce(layering, visitLayer);
        return conflicts;
      }
      function findOtherInnerSegmentNode(g, v) {
        if (g.node(v).dummy) {
          return _.find(g.predecessors(v), function(u) {
            return g.node(u).dummy;
          });
        }
      }
      function addConflict(conflicts, v, w) {
        if (v > w) {
          var tmp = v;
          v = w;
          w = tmp;
        }
        var conflictsV = conflicts[v];
        if (!conflictsV) {
          conflicts[v] = conflictsV = {};
        }
        conflictsV[w] = true;
      }
      function hasConflict(conflicts, v, w) {
        if (v > w) {
          var tmp = v;
          v = w;
          w = tmp;
        }
        return _.has(conflicts[v], w);
      }
      function verticalAlignment(g, layering, conflicts, neighborFn) {
        var root = {}, align = {}, pos = {};
        _.forEach(layering, function(layer) {
          _.forEach(layer, function(v, order) {
            root[v] = v;
            align[v] = v;
            pos[v] = order;
          });
        });
        _.forEach(layering, function(layer) {
          var prevIdx = -1;
          _.forEach(layer, function(v) {
            var ws = neighborFn(v);
            if (ws.length) {
              ws = _.sortBy(ws, function(w2) {
                return pos[w2];
              });
              var mp = (ws.length - 1) / 2;
              for (var i = Math.floor(mp), il = Math.ceil(mp); i <= il; ++i) {
                var w = ws[i];
                if (align[v] === v && prevIdx < pos[w] && !hasConflict(conflicts, v, w)) {
                  align[w] = v;
                  align[v] = root[v] = root[w];
                  prevIdx = pos[w];
                }
              }
            }
          });
        });
        return { root, align };
      }
      function horizontalCompaction(g, layering, root, align, reverseSep) {
        var xs = {}, blockG = buildBlockGraph(g, layering, root, reverseSep), borderType = reverseSep ? "borderLeft" : "borderRight";
        function iterate(setXsFunc, nextNodesFunc) {
          var stack = blockG.nodes();
          var elem = stack.pop();
          var visited = {};
          while (elem) {
            if (visited[elem]) {
              setXsFunc(elem);
            } else {
              visited[elem] = true;
              stack.push(elem);
              stack = stack.concat(nextNodesFunc(elem));
            }
            elem = stack.pop();
          }
        }
        function pass1(elem) {
          xs[elem] = blockG.inEdges(elem).reduce(function(acc, e) {
            return Math.max(acc, xs[e.v] + blockG.edge(e));
          }, 0);
        }
        function pass2(elem) {
          var min = blockG.outEdges(elem).reduce(function(acc, e) {
            return Math.min(acc, xs[e.w] - blockG.edge(e));
          }, Number.POSITIVE_INFINITY);
          var node = g.node(elem);
          if (min !== Number.POSITIVE_INFINITY && node.borderType !== borderType) {
            xs[elem] = Math.max(xs[elem], min);
          }
        }
        iterate(pass1, blockG.predecessors.bind(blockG));
        iterate(pass2, blockG.successors.bind(blockG));
        _.forEach(align, function(v) {
          xs[v] = xs[root[v]];
        });
        return xs;
      }
      function buildBlockGraph(g, layering, root, reverseSep) {
        var blockGraph = new Graph(), graphLabel = g.graph(), sepFn = sep(graphLabel.nodesep, graphLabel.edgesep, reverseSep);
        _.forEach(layering, function(layer) {
          var u;
          _.forEach(layer, function(v) {
            var vRoot = root[v];
            blockGraph.setNode(vRoot);
            if (u) {
              var uRoot = root[u], prevMax = blockGraph.edge(uRoot, vRoot);
              blockGraph.setEdge(uRoot, vRoot, Math.max(sepFn(g, v, u), prevMax || 0));
            }
            u = v;
          });
        });
        return blockGraph;
      }
      function findSmallestWidthAlignment(g, xss) {
        return _.minBy(_.values(xss), function(xs) {
          var max = Number.NEGATIVE_INFINITY;
          var min = Number.POSITIVE_INFINITY;
          _.forIn(xs, function(x, v) {
            var halfWidth = width(g, v) / 2;
            max = Math.max(x + halfWidth, max);
            min = Math.min(x - halfWidth, min);
          });
          return max - min;
        });
      }
      function alignCoordinates(xss, alignTo) {
        var alignToVals = _.values(alignTo), alignToMin = _.min(alignToVals), alignToMax = _.max(alignToVals);
        _.forEach(["u", "d"], function(vert) {
          _.forEach(["l", "r"], function(horiz) {
            var alignment = vert + horiz, xs = xss[alignment], delta;
            if (xs === alignTo) return;
            var xsVals = _.values(xs);
            delta = horiz === "l" ? alignToMin - _.min(xsVals) : alignToMax - _.max(xsVals);
            if (delta) {
              xss[alignment] = _.mapValues(xs, function(x) {
                return x + delta;
              });
            }
          });
        });
      }
      function balance(xss, align) {
        return _.mapValues(xss.ul, function(ignore, v) {
          if (align) {
            return xss[align.toLowerCase()][v];
          } else {
            var xs = _.sortBy(_.map(xss, v));
            return (xs[1] + xs[2]) / 2;
          }
        });
      }
      function positionX(g) {
        var layering = util.buildLayerMatrix(g);
        var conflicts = _.merge(
          findType1Conflicts(g, layering),
          findType2Conflicts(g, layering)
        );
        var xss = {};
        var adjustedLayering;
        _.forEach(["u", "d"], function(vert) {
          adjustedLayering = vert === "u" ? layering : _.values(layering).reverse();
          _.forEach(["l", "r"], function(horiz) {
            if (horiz === "r") {
              adjustedLayering = _.map(adjustedLayering, function(inner) {
                return _.values(inner).reverse();
              });
            }
            var neighborFn = (vert === "u" ? g.predecessors : g.successors).bind(g);
            var align = verticalAlignment(g, adjustedLayering, conflicts, neighborFn);
            var xs = horizontalCompaction(
              g,
              adjustedLayering,
              align.root,
              align.align,
              horiz === "r"
            );
            if (horiz === "r") {
              xs = _.mapValues(xs, function(x) {
                return -x;
              });
            }
            xss[vert + horiz] = xs;
          });
        });
        var smallestWidth = findSmallestWidthAlignment(g, xss);
        alignCoordinates(xss, smallestWidth);
        return balance(xss, g.graph().align);
      }
      function sep(nodeSep, edgeSep, reverseSep) {
        return function(g, v, w) {
          var vLabel = g.node(v);
          var wLabel = g.node(w);
          var sum = 0;
          var delta;
          sum += vLabel.width / 2;
          if (_.has(vLabel, "labelpos")) {
            switch (vLabel.labelpos.toLowerCase()) {
              case "l":
                delta = -vLabel.width / 2;
                break;
              case "r":
                delta = vLabel.width / 2;
                break;
            }
          }
          if (delta) {
            sum += reverseSep ? delta : -delta;
          }
          delta = 0;
          sum += (vLabel.dummy ? edgeSep : nodeSep) / 2;
          sum += (wLabel.dummy ? edgeSep : nodeSep) / 2;
          sum += wLabel.width / 2;
          if (_.has(wLabel, "labelpos")) {
            switch (wLabel.labelpos.toLowerCase()) {
              case "l":
                delta = wLabel.width / 2;
                break;
              case "r":
                delta = -wLabel.width / 2;
                break;
            }
          }
          if (delta) {
            sum += reverseSep ? delta : -delta;
          }
          delta = 0;
          return sum;
        };
      }
      function width(g, v) {
        return g.node(v).width;
      }
    }
  });

  // node_modules/dagre/lib/position/index.js
  var require_position = __commonJS({
    "node_modules/dagre/lib/position/index.js"(exports, module) {
      "use strict";
      var _ = require_lodash2();
      var util = require_util();
      var positionX = require_bk().positionX;
      module.exports = position;
      function position(g) {
        g = util.asNonCompoundGraph(g);
        positionY(g);
        _.forEach(positionX(g), function(x, v) {
          g.node(v).x = x;
        });
      }
      function positionY(g) {
        var layering = util.buildLayerMatrix(g);
        var rankSep = g.graph().ranksep;
        var prevY = 0;
        _.forEach(layering, function(layer) {
          var maxHeight = _.max(_.map(layer, function(v) {
            return g.node(v).height;
          }));
          _.forEach(layer, function(v) {
            g.node(v).y = prevY + maxHeight / 2;
          });
          prevY += maxHeight + rankSep;
        });
      }
    }
  });

  // node_modules/dagre/lib/layout.js
  var require_layout = __commonJS({
    "node_modules/dagre/lib/layout.js"(exports, module) {
      "use strict";
      var _ = require_lodash2();
      var acyclic = require_acyclic();
      var normalize = require_normalize();
      var rank = require_rank();
      var normalizeRanks = require_util().normalizeRanks;
      var parentDummyChains = require_parent_dummy_chains();
      var removeEmptyRanks = require_util().removeEmptyRanks;
      var nestingGraph = require_nesting_graph();
      var addBorderSegments = require_add_border_segments();
      var coordinateSystem = require_coordinate_system();
      var order = require_order();
      var position = require_position();
      var util = require_util();
      var Graph = require_graphlib2().Graph;
      module.exports = layout2;
      function layout2(g, opts) {
        var time = opts && opts.debugTiming ? util.time : util.notime;
        time("layout", function() {
          var layoutGraph = time("  buildLayoutGraph", function() {
            return buildLayoutGraph(g);
          });
          time("  runLayout", function() {
            runLayout(layoutGraph, time);
          });
          time("  updateInputGraph", function() {
            updateInputGraph(g, layoutGraph);
          });
        });
      }
      function runLayout(g, time) {
        time("    makeSpaceForEdgeLabels", function() {
          makeSpaceForEdgeLabels(g);
        });
        time("    removeSelfEdges", function() {
          removeSelfEdges(g);
        });
        time("    acyclic", function() {
          acyclic.run(g);
        });
        time("    nestingGraph.run", function() {
          nestingGraph.run(g);
        });
        time("    rank", function() {
          rank(util.asNonCompoundGraph(g));
        });
        time("    injectEdgeLabelProxies", function() {
          injectEdgeLabelProxies(g);
        });
        time("    removeEmptyRanks", function() {
          removeEmptyRanks(g);
        });
        time("    nestingGraph.cleanup", function() {
          nestingGraph.cleanup(g);
        });
        time("    normalizeRanks", function() {
          normalizeRanks(g);
        });
        time("    assignRankMinMax", function() {
          assignRankMinMax(g);
        });
        time("    removeEdgeLabelProxies", function() {
          removeEdgeLabelProxies(g);
        });
        time("    normalize.run", function() {
          normalize.run(g);
        });
        time("    parentDummyChains", function() {
          parentDummyChains(g);
        });
        time("    addBorderSegments", function() {
          addBorderSegments(g);
        });
        time("    order", function() {
          order(g);
        });
        time("    insertSelfEdges", function() {
          insertSelfEdges(g);
        });
        time("    adjustCoordinateSystem", function() {
          coordinateSystem.adjust(g);
        });
        time("    position", function() {
          position(g);
        });
        time("    positionSelfEdges", function() {
          positionSelfEdges(g);
        });
        time("    removeBorderNodes", function() {
          removeBorderNodes(g);
        });
        time("    normalize.undo", function() {
          normalize.undo(g);
        });
        time("    fixupEdgeLabelCoords", function() {
          fixupEdgeLabelCoords(g);
        });
        time("    undoCoordinateSystem", function() {
          coordinateSystem.undo(g);
        });
        time("    translateGraph", function() {
          translateGraph(g);
        });
        time("    assignNodeIntersects", function() {
          assignNodeIntersects(g);
        });
        time("    reversePoints", function() {
          reversePointsForReversedEdges(g);
        });
        time("    acyclic.undo", function() {
          acyclic.undo(g);
        });
      }
      function updateInputGraph(inputGraph, layoutGraph) {
        _.forEach(inputGraph.nodes(), function(v) {
          var inputLabel = inputGraph.node(v);
          var layoutLabel = layoutGraph.node(v);
          if (inputLabel) {
            inputLabel.x = layoutLabel.x;
            inputLabel.y = layoutLabel.y;
            if (layoutGraph.children(v).length) {
              inputLabel.width = layoutLabel.width;
              inputLabel.height = layoutLabel.height;
            }
          }
        });
        _.forEach(inputGraph.edges(), function(e) {
          var inputLabel = inputGraph.edge(e);
          var layoutLabel = layoutGraph.edge(e);
          inputLabel.points = layoutLabel.points;
          if (_.has(layoutLabel, "x")) {
            inputLabel.x = layoutLabel.x;
            inputLabel.y = layoutLabel.y;
          }
        });
        inputGraph.graph().width = layoutGraph.graph().width;
        inputGraph.graph().height = layoutGraph.graph().height;
      }
      var graphNumAttrs = ["nodesep", "edgesep", "ranksep", "marginx", "marginy"];
      var graphDefaults = { ranksep: 50, edgesep: 20, nodesep: 50, rankdir: "tb" };
      var graphAttrs = ["acyclicer", "ranker", "rankdir", "align"];
      var nodeNumAttrs = ["width", "height"];
      var nodeDefaults = { width: 0, height: 0 };
      var edgeNumAttrs = ["minlen", "weight", "width", "height", "labeloffset"];
      var edgeDefaults = {
        minlen: 1,
        weight: 1,
        width: 0,
        height: 0,
        labeloffset: 10,
        labelpos: "r"
      };
      var edgeAttrs = ["labelpos"];
      function buildLayoutGraph(inputGraph) {
        var g = new Graph({ multigraph: true, compound: true });
        var graph = canonicalize(inputGraph.graph());
        g.setGraph(_.merge(
          {},
          graphDefaults,
          selectNumberAttrs(graph, graphNumAttrs),
          _.pick(graph, graphAttrs)
        ));
        _.forEach(inputGraph.nodes(), function(v) {
          var node = canonicalize(inputGraph.node(v));
          g.setNode(v, _.defaults(selectNumberAttrs(node, nodeNumAttrs), nodeDefaults));
          g.setParent(v, inputGraph.parent(v));
        });
        _.forEach(inputGraph.edges(), function(e) {
          var edge = canonicalize(inputGraph.edge(e));
          g.setEdge(e, _.merge(
            {},
            edgeDefaults,
            selectNumberAttrs(edge, edgeNumAttrs),
            _.pick(edge, edgeAttrs)
          ));
        });
        return g;
      }
      function makeSpaceForEdgeLabels(g) {
        var graph = g.graph();
        graph.ranksep /= 2;
        _.forEach(g.edges(), function(e) {
          var edge = g.edge(e);
          edge.minlen *= 2;
          if (edge.labelpos.toLowerCase() !== "c") {
            if (graph.rankdir === "TB" || graph.rankdir === "BT") {
              edge.width += edge.labeloffset;
            } else {
              edge.height += edge.labeloffset;
            }
          }
        });
      }
      function injectEdgeLabelProxies(g) {
        _.forEach(g.edges(), function(e) {
          var edge = g.edge(e);
          if (edge.width && edge.height) {
            var v = g.node(e.v);
            var w = g.node(e.w);
            var label = { rank: (w.rank - v.rank) / 2 + v.rank, e };
            util.addDummyNode(g, "edge-proxy", label, "_ep");
          }
        });
      }
      function assignRankMinMax(g) {
        var maxRank = 0;
        _.forEach(g.nodes(), function(v) {
          var node = g.node(v);
          if (node.borderTop) {
            node.minRank = g.node(node.borderTop).rank;
            node.maxRank = g.node(node.borderBottom).rank;
            maxRank = _.max(maxRank, node.maxRank);
          }
        });
        g.graph().maxRank = maxRank;
      }
      function removeEdgeLabelProxies(g) {
        _.forEach(g.nodes(), function(v) {
          var node = g.node(v);
          if (node.dummy === "edge-proxy") {
            g.edge(node.e).labelRank = node.rank;
            g.removeNode(v);
          }
        });
      }
      function translateGraph(g) {
        var minX = Number.POSITIVE_INFINITY;
        var maxX = 0;
        var minY = Number.POSITIVE_INFINITY;
        var maxY = 0;
        var graphLabel = g.graph();
        var marginX = graphLabel.marginx || 0;
        var marginY = graphLabel.marginy || 0;
        function getExtremes(attrs) {
          var x = attrs.x;
          var y = attrs.y;
          var w = attrs.width;
          var h = attrs.height;
          minX = Math.min(minX, x - w / 2);
          maxX = Math.max(maxX, x + w / 2);
          minY = Math.min(minY, y - h / 2);
          maxY = Math.max(maxY, y + h / 2);
        }
        _.forEach(g.nodes(), function(v) {
          getExtremes(g.node(v));
        });
        _.forEach(g.edges(), function(e) {
          var edge = g.edge(e);
          if (_.has(edge, "x")) {
            getExtremes(edge);
          }
        });
        minX -= marginX;
        minY -= marginY;
        _.forEach(g.nodes(), function(v) {
          var node = g.node(v);
          node.x -= minX;
          node.y -= minY;
        });
        _.forEach(g.edges(), function(e) {
          var edge = g.edge(e);
          _.forEach(edge.points, function(p) {
            p.x -= minX;
            p.y -= minY;
          });
          if (_.has(edge, "x")) {
            edge.x -= minX;
          }
          if (_.has(edge, "y")) {
            edge.y -= minY;
          }
        });
        graphLabel.width = maxX - minX + marginX;
        graphLabel.height = maxY - minY + marginY;
      }
      function assignNodeIntersects(g) {
        _.forEach(g.edges(), function(e) {
          var edge = g.edge(e);
          var nodeV = g.node(e.v);
          var nodeW = g.node(e.w);
          var p1, p2;
          if (!edge.points) {
            edge.points = [];
            p1 = nodeW;
            p2 = nodeV;
          } else {
            p1 = edge.points[0];
            p2 = edge.points[edge.points.length - 1];
          }
          edge.points.unshift(util.intersectRect(nodeV, p1));
          edge.points.push(util.intersectRect(nodeW, p2));
        });
      }
      function fixupEdgeLabelCoords(g) {
        _.forEach(g.edges(), function(e) {
          var edge = g.edge(e);
          if (_.has(edge, "x")) {
            if (edge.labelpos === "l" || edge.labelpos === "r") {
              edge.width -= edge.labeloffset;
            }
            switch (edge.labelpos) {
              case "l":
                edge.x -= edge.width / 2 + edge.labeloffset;
                break;
              case "r":
                edge.x += edge.width / 2 + edge.labeloffset;
                break;
            }
          }
        });
      }
      function reversePointsForReversedEdges(g) {
        _.forEach(g.edges(), function(e) {
          var edge = g.edge(e);
          if (edge.reversed) {
            edge.points.reverse();
          }
        });
      }
      function removeBorderNodes(g) {
        _.forEach(g.nodes(), function(v) {
          if (g.children(v).length) {
            var node = g.node(v);
            var t = g.node(node.borderTop);
            var b = g.node(node.borderBottom);
            var l = g.node(_.last(node.borderLeft));
            var r = g.node(_.last(node.borderRight));
            node.width = Math.abs(r.x - l.x);
            node.height = Math.abs(b.y - t.y);
            node.x = l.x + node.width / 2;
            node.y = t.y + node.height / 2;
          }
        });
        _.forEach(g.nodes(), function(v) {
          if (g.node(v).dummy === "border") {
            g.removeNode(v);
          }
        });
      }
      function removeSelfEdges(g) {
        _.forEach(g.edges(), function(e) {
          if (e.v === e.w) {
            var node = g.node(e.v);
            if (!node.selfEdges) {
              node.selfEdges = [];
            }
            node.selfEdges.push({ e, label: g.edge(e) });
            g.removeEdge(e);
          }
        });
      }
      function insertSelfEdges(g) {
        var layers = util.buildLayerMatrix(g);
        _.forEach(layers, function(layer) {
          var orderShift = 0;
          _.forEach(layer, function(v, i) {
            var node = g.node(v);
            node.order = i + orderShift;
            _.forEach(node.selfEdges, function(selfEdge) {
              util.addDummyNode(g, "selfedge", {
                width: selfEdge.label.width,
                height: selfEdge.label.height,
                rank: node.rank,
                order: i + ++orderShift,
                e: selfEdge.e,
                label: selfEdge.label
              }, "_se");
            });
            delete node.selfEdges;
          });
        });
      }
      function positionSelfEdges(g) {
        _.forEach(g.nodes(), function(v) {
          var node = g.node(v);
          if (node.dummy === "selfedge") {
            var selfNode = g.node(node.e.v);
            var x = selfNode.x + selfNode.width / 2;
            var y = selfNode.y;
            var dx = node.x - x;
            var dy = selfNode.height / 2;
            g.setEdge(node.e, node.label);
            g.removeNode(v);
            node.label.points = [
              { x: x + 2 * dx / 3, y: y - dy },
              { x: x + 5 * dx / 6, y: y - dy },
              { x: x + dx, y },
              { x: x + 5 * dx / 6, y: y + dy },
              { x: x + 2 * dx / 3, y: y + dy }
            ];
            node.label.x = node.x;
            node.label.y = node.y;
          }
        });
      }
      function selectNumberAttrs(obj, attrs) {
        return _.mapValues(_.pick(obj, attrs), Number);
      }
      function canonicalize(attrs) {
        var newAttrs = {};
        _.forEach(attrs, function(v, k) {
          newAttrs[k.toLowerCase()] = v;
        });
        return newAttrs;
      }
    }
  });

  // node_modules/dagre/lib/debug.js
  var require_debug = __commonJS({
    "node_modules/dagre/lib/debug.js"(exports, module) {
      var _ = require_lodash2();
      var util = require_util();
      var Graph = require_graphlib2().Graph;
      module.exports = {
        debugOrdering
      };
      function debugOrdering(g) {
        var layerMatrix = util.buildLayerMatrix(g);
        var h = new Graph({ compound: true, multigraph: true }).setGraph({});
        _.forEach(g.nodes(), function(v) {
          h.setNode(v, { label: v });
          h.setParent(v, "layer" + g.node(v).rank);
        });
        _.forEach(g.edges(), function(e) {
          h.setEdge(e.v, e.w, {}, e.name);
        });
        _.forEach(layerMatrix, function(layer, i) {
          var layerV = "layer" + i;
          h.setNode(layerV, { rank: "same" });
          _.reduce(layer, function(u, v) {
            h.setEdge(u, v, { style: "invis" });
            return v;
          });
        });
        return h;
      }
    }
  });

  // node_modules/dagre/lib/version.js
  var require_version2 = __commonJS({
    "node_modules/dagre/lib/version.js"(exports, module) {
      module.exports = "0.8.5";
    }
  });

  // node_modules/dagre/index.js
  var require_dagre = __commonJS({
    "node_modules/dagre/index.js"(exports, module) {
      module.exports = {
        graphlib: require_graphlib2(),
        layout: require_layout(),
        debug: require_debug(),
        util: {
          time: require_util().time,
          notime: require_util().notime
        },
        version: require_version2()
      };
    }
  });

  // public/js/canvas.ts
  var dagre = __toESM(require_dagre());
  var ConceptCanvas = class {
    svg;
    viewport;
    edgesGroup;
    nodesGroup;
    panX = 0;
    panY = 0;
    zoom = 1;
    isDragging = false;
    startX = 0;
    startY = 0;
    nodes = [];
    onNodeClickCallback = null;
    thinkingHudEl = null;
    thinkingAgentEl = null;
    thinkingStreamEl = null;
    // Dagre layout configuration & hover tooltip state
    rankDir = "BT";
    hoverTimer = null;
    activeTooltip = null;
    constructor(svgId) {
      this.svg = document.getElementById(svgId);
      this.viewport = document.getElementById("canvas-viewport");
      this.edgesGroup = document.getElementById("svg-edges");
      this.nodesGroup = document.getElementById("svg-nodes");
      this.thinkingHudEl = document.getElementById("canvas-thinking-hud");
      this.thinkingAgentEl = document.getElementById("thinking-agent-name");
      this.thinkingStreamEl = document.getElementById("thinking-stream-text");
      this.initDefs();
      this.initEvents();
    }
    /** Initialize SVG Defs (Patterns, Gradients, Filters) */
    initDefs() {
      if (!this.svg) return;
      let defs = this.svg.querySelector("defs");
      if (!defs) {
        defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        this.svg.insertBefore(defs, this.svg.firstChild);
      }
      defs.innerHTML = `
      <!-- Canvas Grid Pattern -->
      <pattern id="canvas-grid-pattern" width="32" height="32" patternUnits="userSpaceOnUse">
        <circle cx="16" cy="16" r="1.2" fill="rgba(255, 255, 255, 0.07)"/>
      </pattern>
      
      <!-- Glow Filters -->
      <filter id="glow-active" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    `;
      let bgRect = this.svg.querySelector(".canvas-grid-bg");
      if (!bgRect) {
        bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        bgRect.setAttribute("class", "canvas-grid-bg");
        bgRect.setAttribute("width", "100%");
        bgRect.setAttribute("height", "100%");
        bgRect.setAttribute("fill", "url(#canvas-grid-pattern)");
        if (this.viewport) {
          this.svg.insertBefore(bgRect, this.viewport);
        } else {
          this.svg.appendChild(bgRect);
        }
      }
    }
    initEvents() {
      if (!this.svg) return;
      this.svg.addEventListener("mousedown", (e) => {
        if (e.target.closest(".svg-node-group")) return;
        this.isDragging = true;
        this.svg.style.cursor = "grabbing";
        this.startX = e.clientX - this.panX;
        this.startY = e.clientY - this.panY;
      });
      window.addEventListener("mousemove", (e) => {
        if (!this.isDragging) return;
        this.panX = e.clientX - this.startX;
        this.panY = e.clientY - this.startY;
        this.applyTransform();
      });
      window.addEventListener("mouseup", () => {
        if (this.isDragging) {
          this.isDragging = false;
          this.svg.style.cursor = "grab";
        }
      });
      this.svg.addEventListener("wheel", (e) => {
        e.preventDefault();
        const zoomFactor = 1.1;
        const svgRect = this.svg.getBoundingClientRect();
        const mouseX = e.clientX - svgRect.left;
        const mouseY = e.clientY - svgRect.top;
        const canvasMouseX = (mouseX - this.panX) / this.zoom;
        const canvasMouseY = (mouseY - this.panY) / this.zoom;
        if (e.deltaY < 0) {
          this.zoom = Math.min(this.zoom * zoomFactor, 2.5);
        } else {
          this.zoom = Math.max(this.zoom / zoomFactor, 0.4);
        }
        this.panX = mouseX - canvasMouseX * this.zoom;
        this.panY = mouseY - canvasMouseY * this.zoom;
        this.applyTransform();
      });
      document.getElementById("zoom-in-btn")?.addEventListener("click", () => this.zoomStep(1.2));
      document.getElementById("zoom-out-btn")?.addEventListener("click", () => this.zoomStep(1 / 1.2));
      document.getElementById("zoom-reset-btn")?.addEventListener("click", () => this.resetView());
    }
    zoomStep(factor) {
      if (!this.svg) return;
      const width = this.svg.clientWidth || 800;
      const height = this.svg.clientHeight || 600;
      const canvasCenterX = (width / 2 - this.panX) / this.zoom;
      const canvasCenterY = (height / 2 - this.panY) / this.zoom;
      this.zoom = Math.max(0.4, Math.min(this.zoom * factor, 2.5));
      this.panX = width / 2 - canvasCenterX * this.zoom;
      this.panY = height / 2 - canvasCenterY * this.zoom;
      this.applyTransform();
    }
    resetView() {
      if (this.nodes && this.nodes.length > 0) {
        this.autoCenterTree(this.nodes);
      } else {
        this.panX = 0;
        this.panY = 0;
        this.zoom = 1;
        this.applyTransform();
      }
    }
    /**
     * Step 2 — Fit-to-view auto-centering.
     * Calculates the bounding box of all nodes and updates zoom & pan so the entire tree
     * fits nicely inside the canvas with ~12% padding.
     */
    autoCenterTree(nodes) {
      if (!nodes || nodes.length === 0 || !this.svg) return;
      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;
      nodes.forEach((n) => {
        minX = Math.min(minX, n.x);
        maxX = Math.max(maxX, n.x + 210);
        minY = Math.min(minY, n.y);
        maxY = Math.max(maxY, n.y + 86);
      });
      const svgW = this.svg.clientWidth || 800;
      const svgH = this.svg.clientHeight || 600;
      const graphW = maxX - minX;
      const graphH = maxY - minY;
      const paddingX = Math.max(40, svgW * 0.1);
      const paddingY = Math.max(40, svgH * 0.1);
      const scaleX = (svgW - paddingX * 2) / (graphW || 1);
      const scaleY = (svgH - paddingY * 2) / (graphH || 1);
      this.zoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.45), 1.25);
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      this.panX = svgW / 2 - centerX * this.zoom;
      this.panY = svgH / 2 - centerY * this.zoom;
      this.applyTransform();
    }
    applyTransform() {
      if (this.viewport) {
        this.viewport.setAttribute("transform", `translate(${this.panX}, ${this.panY}) scale(${this.zoom})`);
      }
    }
    // ── Ghostly Thinking Stream HUD Public API ──
    showThinking(agentName, thoughtText) {
      if (!this.thinkingHudEl) this.thinkingHudEl = document.getElementById("canvas-thinking-hud");
      if (!this.thinkingAgentEl) this.thinkingAgentEl = document.getElementById("thinking-agent-name");
      if (!this.thinkingStreamEl) this.thinkingStreamEl = document.getElementById("thinking-stream-text");
      if (this.thinkingAgentEl) this.thinkingAgentEl.textContent = agentName;
      if (this.thinkingStreamEl) {
        this.thinkingStreamEl.textContent = thoughtText;
        this.thinkingStreamEl.classList.remove("error-text");
      }
      const dot = this.thinkingHudEl?.querySelector(".thinking-hud-dot");
      if (dot) {
        dot.className = "thinking-hud-dot";
      }
      if (this.thinkingHudEl) {
        this.thinkingHudEl.classList.remove("hidden");
      }
    }
    showThinkingError(agentName, errorMessage) {
      if (!this.thinkingHudEl) this.thinkingHudEl = document.getElementById("canvas-thinking-hud");
      if (!this.thinkingAgentEl) this.thinkingAgentEl = document.getElementById("thinking-agent-name");
      if (!this.thinkingStreamEl) this.thinkingStreamEl = document.getElementById("thinking-stream-text");
      if (this.thinkingAgentEl) this.thinkingAgentEl.textContent = agentName;
      if (this.thinkingStreamEl) {
        this.thinkingStreamEl.textContent = errorMessage;
        this.thinkingStreamEl.classList.add("error-text");
      }
      const dot = this.thinkingHudEl?.querySelector(".thinking-hud-dot");
      if (dot) {
        dot.className = "thinking-hud-dot error";
      }
      if (this.thinkingHudEl) {
        this.thinkingHudEl.classList.remove("hidden");
      }
    }
    hideThinking(finalStatus) {
      if (!this.thinkingHudEl) this.thinkingHudEl = document.getElementById("canvas-thinking-hud");
      if (!this.thinkingStreamEl) this.thinkingStreamEl = document.getElementById("thinking-stream-text");
      if (finalStatus && this.thinkingStreamEl) {
        this.thinkingStreamEl.textContent = finalStatus;
        this.thinkingStreamEl.classList.remove("error-text");
        const dot = this.thinkingHudEl?.querySelector(".thinking-hud-dot");
        if (dot) dot.className = "thinking-hud-dot verified";
        setTimeout(() => {
          if (this.thinkingHudEl) this.thinkingHudEl.classList.add("hidden");
        }, 2400);
      } else if (this.thinkingHudEl) {
        this.thinkingHudEl.classList.add("hidden");
      }
    }
    onNodeClick(callback) {
      this.onNodeClickCallback = callback;
    }
    /**
     * Step 1 — Dagre Layout Computation.
     * Feeds nodes (210x86) and PREREQUISITE edges only into Dagre graph for layout.
     */
    computeDagreLayout(nodes) {
      if (!nodes || nodes.length === 0) return;
      const g = new dagre.graphlib.Graph();
      g.setGraph({
        rankdir: this.rankDir,
        nodesep: 45,
        ranksep: 75,
        marginx: 40,
        marginy: 40
      });
      g.setDefaultEdgeLabel(() => ({}));
      nodes.forEach((n) => {
        g.setNode(n.id, { width: 210, height: 86 });
      });
      const addedPrereqEdges = /* @__PURE__ */ new Set();
      nodes.forEach((n) => {
        if (n.edges && Array.isArray(n.edges)) {
          n.edges.forEach((e) => {
            if (e.type !== "related") {
              const key = `${e.from}->${e.to}`;
              if (!addedPrereqEdges.has(key)) {
                addedPrereqEdges.add(key);
                g.setEdge(e.from, e.to);
              }
            }
          });
        }
        if (n.dependencies && Array.isArray(n.dependencies)) {
          n.dependencies.forEach((depId) => {
            const key = `${depId}->${n.id}`;
            if (!addedPrereqEdges.has(key)) {
              addedPrereqEdges.add(key);
              g.setEdge(depId, n.id);
            }
          });
        }
      });
      dagre.layout(g);
      nodes.forEach((n) => {
        const dagreNode = g.node(n.id);
        if (dagreNode) {
          n.x = dagreNode.x - 210 / 2;
          n.y = dagreNode.y - 86 / 2;
        }
      });
    }
    render(nodes, animate = true) {
      const oldNodes = this.nodes;
      this.nodes = nodes;
      if (!nodes || nodes.length === 0) {
        this.nodesGroup.innerHTML = "";
        this.edgesGroup.innerHTML = "";
        return;
      }
      const newIdSet = new Set(nodes.map((n) => n.id));
      oldNodes.forEach((oldNode) => {
        if (!newIdSet.has(oldNode.id)) {
          const oldGroup = document.getElementById(`node-group-${oldNode.id}`);
          if (oldGroup) {
            oldGroup.classList.add("dissolving");
            setTimeout(() => {
              if (oldGroup.parentNode) oldGroup.parentNode.removeChild(oldGroup);
            }, 350);
          }
        }
      });
      this.computeDagreLayout(nodes);
      this.nodesGroup.innerHTML = "";
      this.edgesGroup.innerHTML = "";
      const nodeMap = {};
      nodes.forEach((n) => {
        nodeMap[n.id] = n;
      });
      const drawnEdges = /* @__PURE__ */ new Set();
      nodes.forEach((node) => {
        if (node.edges && Array.isArray(node.edges)) {
          node.edges.forEach((edge) => {
            const key = `${edge.from}->${edge.to}:${edge.type}`;
            if (!drawnEdges.has(key)) {
              drawnEdges.add(key);
              const pNode = nodeMap[edge.from];
              const cNode = nodeMap[edge.to];
              if (pNode && cNode) {
                this.drawConnection(pNode, cNode, edge.type, animate);
              }
            }
          });
        }
        if (node.dependencies && Array.isArray(node.dependencies)) {
          node.dependencies.forEach((depId) => {
            const key = `${depId}->${node.id}:prerequisite`;
            if (!drawnEdges.has(key)) {
              drawnEdges.add(key);
              const pNode = nodeMap[depId];
              if (pNode) {
                this.drawConnection(pNode, node, "prerequisite", animate);
              }
            }
          });
        }
      });
      nodes.forEach((node) => {
        this.drawNode(node, animate);
      });
      this.autoCenterTree(nodes);
    }
    /**
     * Render edge connections with layout-direction-aware endpoints and secondary styling for related edges.
     */
    drawConnection(parent, child, edgeType, animate = true) {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      let pX, pY, cX, cY;
      if (this.rankDir === "BT") {
        pX = parent.x + 105;
        pY = parent.y;
        cX = child.x + 105;
        cY = child.y + 86;
      } else {
        pX = parent.x + 210;
        pY = parent.y + 43;
        cX = child.x;
        cY = child.y + 43;
      }
      let dStr = "";
      if (this.rankDir === "BT") {
        const dy = Math.abs(cY - pY) * 0.5;
        dStr = `M ${pX} ${pY} C ${pX} ${pY - dy}, ${cX} ${cY + dy}, ${cX} ${cY}`;
      } else {
        const dx = Math.abs(cX - pX) * 0.5;
        dStr = `M ${pX} ${pY} C ${pX + dx} ${pY}, ${cX - dx} ${cY}, ${cX} ${cY}`;
      }
      path.setAttribute("d", dStr);
      if (edgeType === "related") {
        path.setAttribute("class", `svg-edge-path related`);
        path.setAttribute("stroke", "rgba(148, 163, 184, 0.55)");
        path.setAttribute("stroke-dasharray", "6 4");
        path.setAttribute("stroke-width", "1.8");
        path.setAttribute("fill", "none");
      } else {
        path.setAttribute("class", `svg-edge-path ${child.status}`);
        if (child.status === "completed") {
          path.setAttribute("stroke", "#10b981");
        } else if (child.status === "active" || child.status === "available") {
          path.setAttribute("stroke", "#ffffff");
        } else {
          path.setAttribute("stroke", "rgba(255, 255, 255, 0.15)");
        }
        if (animate) {
          const length = Math.ceil(path.getTotalLength ? path.getTotalLength() || 300 : 300);
          path.style.setProperty("--path-len", `${length}`);
          path.classList.add("animated");
          const edgeDelay = Math.max(0, (child.order_index - 0.5) * 180);
          path.style.animationDelay = `${edgeDelay}ms`;
        }
      }
      this.edgesGroup.appendChild(path);
    }
    /**
     * Step 4 — Hover-to-expand with 180ms delay.
     */
    drawNode(node, animate = true) {
      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      group.setAttribute("class", `svg-node-group ${node.status}`);
      group.setAttribute("id", `node-group-${node.id}`);
      group.style.transformOrigin = `${node.x + 105}px ${node.y + 43}px`;
      if (animate) {
        group.classList.add("animated");
        const nodeDelay = Math.max(0, node.order_index * 180);
        group.style.animationDelay = `${nodeDelay}ms`;
      }
      const width = 210;
      const height = 86;
      if (node.status === "active") {
        group.setAttribute("filter", "url(#glow-active)");
      }
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", String(node.x));
      rect.setAttribute("y", String(node.y));
      rect.setAttribute("width", String(width));
      rect.setAttribute("height", String(height));
      rect.setAttribute("rx", "14");
      rect.setAttribute("ry", "14");
      rect.setAttribute("class", "svg-node-bg");
      group.appendChild(rect);
      const accentBar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      accentBar.setAttribute("x", String(node.x));
      accentBar.setAttribute("y", String(node.y));
      accentBar.setAttribute("width", "5");
      accentBar.setAttribute("height", String(height));
      accentBar.setAttribute("rx", "3");
      accentBar.setAttribute("class", `svg-node-accent-bar ${node.status}`);
      group.appendChild(accentBar);
      const iconBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      iconBg.setAttribute("x", String(node.x + 14));
      iconBg.setAttribute("y", String(node.y + 21));
      iconBg.setAttribute("width", "44");
      iconBg.setAttribute("height", "44");
      iconBg.setAttribute("rx", "11");
      iconBg.setAttribute("class", `svg-node-icon-bg ${node.status}`);
      group.appendChild(iconBg);
      const iconGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
      iconGroup.setAttribute("transform", `translate(${node.x + 26}, ${node.y + 33})`);
      if (node.status === "completed") {
        iconGroup.appendChild(this.createCheckIcon());
      } else if (node.status === "active") {
        iconGroup.appendChild(this.createActivePlayIcon());
      } else if (node.status === "available") {
        iconGroup.appendChild(this.createAvailableTargetIcon());
      } else {
        iconGroup.appendChild(this.createLockIcon());
      }
      group.appendChild(iconGroup);
      const badgeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
      badgeGroup.setAttribute("transform", `translate(${node.x + 68}, ${node.y + 16})`);
      const badgeBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      const phaseStr = node.phaseIndex !== void 0 ? `P${node.phaseIndex}` : `N${node.order_index + 1}`;
      const activeStr = node.isCurrentActiveChunk ? " \u2022 FOCUS" : "";
      const fullBadgeText = `${phaseStr}${activeStr}`;
      const badgeWidth = Math.max(54, fullBadgeText.length * 6 + 10);
      badgeBg.setAttribute("width", String(badgeWidth));
      badgeBg.setAttribute("height", "16");
      badgeBg.setAttribute("rx", "5");
      badgeBg.setAttribute("class", `svg-node-badge-bg ${node.status}${node.isCurrentActiveChunk ? " active-chunk" : ""}`);
      badgeGroup.appendChild(badgeBg);
      const badgeText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      badgeText.setAttribute("x", String(badgeWidth / 2));
      badgeText.setAttribute("y", "12");
      badgeText.setAttribute("text-anchor", "middle");
      badgeText.setAttribute("class", "svg-node-badge-text");
      badgeText.textContent = fullBadgeText;
      badgeGroup.appendChild(badgeText);
      group.appendChild(badgeGroup);
      const titleText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      titleText.setAttribute("x", String(node.x + 68));
      titleText.setAttribute("y", String(node.y + 49));
      titleText.setAttribute("class", "svg-node-text-title");
      let title = node.title;
      if (title.length > 16) title = title.substring(0, 14) + "\u2026";
      titleText.textContent = title;
      group.appendChild(titleText);
      const descText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      descText.setAttribute("x", String(node.x + 68));
      descText.setAttribute("y", String(node.y + 66));
      descText.setAttribute("class", "svg-node-text-desc");
      let desc = node.description || "";
      if (desc.length > 22) desc = desc.substring(0, 20) + "\u2026";
      descText.textContent = desc;
      group.appendChild(descText);
      group.addEventListener("mouseenter", (e) => {
        if (this.hoverTimer) clearTimeout(this.hoverTimer);
        this.hoverTimer = setTimeout(() => {
          this.showHoverTooltip(node, e);
        }, 180);
      });
      group.addEventListener("mousemove", (e) => {
        if (this.activeTooltip) {
          this.updateTooltipPosition(e);
        }
      });
      group.addEventListener("mouseleave", () => {
        if (this.hoverTimer) clearTimeout(this.hoverTimer);
        this.hideHoverTooltip();
      });
      group.addEventListener("click", () => {
        this.hideHoverTooltip();
        if (this.onNodeClickCallback) {
          this.onNodeClickCallback(node);
        }
      });
      this.nodesGroup.appendChild(group);
    }
    /** Display sleek dark glassmorphic tooltip with full node details */
    showHoverTooltip(node, e) {
      this.hideHoverTooltip();
      const phaseLabel = node.phaseIndex !== void 0 ? `Phase ${node.phaseIndex}` : `Node ${node.order_index + 1}`;
      const activeLabel = node.isCurrentActiveChunk ? " \u2022 Active Focus" : "";
      const tooltip = document.createElement("div");
      tooltip.className = "canvas-hover-tooltip";
      tooltip.innerHTML = `
      <div class="tooltip-badge">
        <span>${phaseLabel}${activeLabel}</span> \u2022 <span style="text-transform:uppercase">${node.status}</span>
      </div>
      <div class="tooltip-title">${node.title}</div>
      <div class="tooltip-desc">${node.description || "Core concept in this learning path."}</div>
    `;
      document.body.appendChild(tooltip);
      this.activeTooltip = tooltip;
      this.updateTooltipPosition(e);
      requestAnimationFrame(() => {
        tooltip.classList.add("visible");
      });
    }
    updateTooltipPosition(e) {
      if (!this.activeTooltip) return;
      const offset = 14;
      let x = e.clientX + offset;
      let y = e.clientY + offset;
      const rect = this.activeTooltip.getBoundingClientRect();
      if (x + rect.width > window.innerWidth - 16) {
        x = e.clientX - rect.width - offset;
      }
      if (y + rect.height > window.innerHeight - 16) {
        y = e.clientY - rect.height - offset;
      }
      this.activeTooltip.style.left = `${Math.max(12, x)}px`;
      this.activeTooltip.style.top = `${Math.max(12, y)}px`;
    }
    hideHoverTooltip() {
      if (this.activeTooltip) {
        const el = this.activeTooltip;
        this.activeTooltip = null;
        el.classList.remove("visible");
        setTimeout(() => {
          if (el.parentNode) el.parentNode.removeChild(el);
        }, 180);
      }
    }
    // --- Vector SVG Icon Helpers ---
    createCheckIcon() {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.innerHTML = `<path d="M 2 10 L 7 15 L 18 4" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
      return g;
    }
    createActivePlayIcon() {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.innerHTML = `<polygon points="5,3 16,10 5,17" fill="#ffffff"/>`;
      return g;
    }
    createAvailableTargetIcon() {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.innerHTML = `
      <circle cx="10" cy="10" r="7" fill="none" stroke="#e5e7eb" stroke-width="2"/>
      <circle cx="10" cy="10" r="2.5" fill="#e5e7eb"/>
    `;
      return g;
    }
    createLockIcon() {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.innerHTML = `
      <rect x="3" y="8" width="14" height="10" rx="2" fill="none" stroke="#64748b" stroke-width="2"/>
      <path d="M 6 8 V 5 A 4 4 0 0 1 14 5 V 8" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round"/>
    `;
      return g;
    }
  };

  // public/js/sandbox.ts
  var TaskSandbox = class {
    container;
    currentTask = null;
    onSubmitCallback = null;
    constructor(containerId) {
      let el = document.getElementById(containerId);
      if (!el) {
        el = document.createElement("div");
        el.id = containerId;
        el.className = "task-sandbox-container hidden";
        const canvasPanel = document.getElementById("canvas-panel");
        if (canvasPanel) {
          canvasPanel.appendChild(el);
        }
      }
      this.container = el;
    }
    getModalityMeta(modality) {
      switch (modality) {
        case "code_challenge":
          return { badge: "\u{1F4BB} CODE SIMULATION", label: "Solution Code" };
        case "exam_rubric_challenge":
          return { badge: "\u{1F4C4} EXAM RUBRIC CHALLENGE", label: "Written Response" };
        case "scenario_simulation":
          return { badge: "\u{1F4BC} STRATEGIC CASE SCENARIO", label: "Scenario Analysis & Decision" };
        case "creative_synthesis_challenge":
          return { badge: "\u{1F3A8} CREATIVE SYNTHESIS", label: "Synthesis Response" };
        case "dialogue_simulation":
          return { badge: "\u{1F4AC} DIALOGUE SIMULATION", label: "Dialogue / Translation" };
        case "math_proof_challenge":
          return { badge: "\u{1F4D0} QUANTITATIVE PROOF CHALLENGE", label: "Step-by-Step Proof" };
        default:
          return { badge: "\u{1F3AF} DOMAIN TASK CHALLENGE", label: "Task Response" };
      }
    }
    render(task, onSubmit) {
      this.currentTask = task;
      this.onSubmitCallback = onSubmit;
      const meta = this.getModalityMeta(task.taskType);
      this.container.classList.remove("hidden");
      this.container.innerHTML = `
      <div class="sandbox-header">
        <div class="sandbox-title-group">
          <span class="sandbox-badge">${meta.badge}${task.domainCategory ? ` \xB7 ${task.domainCategory}` : ""}</span>
          <h4 class="sandbox-title">${task.title}</h4>
        </div>
        <button class="sandbox-close-btn" id="sandbox-close-btn" title="Close Task Sandbox">\xD7</button>
      </div>

      <div class="sandbox-body">
        <div class="sandbox-instructions">
          <h5>Challenge Instructions</h5>
          <p>${task.instructions}</p>
          ${task.solutionRubric ? `<div class="sandbox-rubric"><strong>Evaluation Criteria:</strong> ${task.solutionRubric}</div>` : ""}
        </div>

        <div class="sandbox-editor-wrapper">
          <div class="sandbox-editor-header">
            <span>${meta.label}</span>
          </div>
          <textarea id="sandbox-editor-input" class="sandbox-editor-textarea" placeholder="Write your response here...">${task.starterTemplate || ""}</textarea>
        </div>

        <div class="sandbox-actions">
          <button id="sandbox-submit-btn" class="sandbox-submit-btn">Submit Solution for Evaluation</button>
        </div>

        <div id="sandbox-feedback-area" class="sandbox-feedback-area hidden"></div>
      </div>
    `;
      document.getElementById("sandbox-close-btn")?.addEventListener("click", () => {
        this.hide();
      });
      document.getElementById("sandbox-submit-btn")?.addEventListener("click", async () => {
        const inputEl = document.getElementById("sandbox-editor-input");
        const feedbackEl = document.getElementById("sandbox-feedback-area");
        const submitBtn = document.getElementById("sandbox-submit-btn");
        if (!inputEl || !inputEl.value.trim()) return;
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerText = "Evaluating Solution...";
        }
        if (feedbackEl) {
          feedbackEl.classList.remove("hidden");
          feedbackEl.innerHTML = `<div class="sandbox-eval-spinner">Running domain evaluation & rubric analysis...</div>`;
        }
        if (this.onSubmitCallback) {
          await this.onSubmitCallback(inputEl.value);
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = "Submit Solution for Evaluation";
        }
      });
    }
    showFeedback(score, passed, feedback, misconceptions = [], strengths = []) {
      const feedbackEl = document.getElementById("sandbox-feedback-area");
      if (!feedbackEl) return;
      feedbackEl.classList.remove("hidden");
      const badgeClass = passed ? "feedback-pass" : "feedback-refine";
      const badgeText = passed ? "\u2705 PASSED (Score: " + Math.round(score * 100) + "%)" : "\u26A0\uFE0F REFINEMENT NEEDED (Score: " + Math.round(score * 100) + "%)";
      feedbackEl.innerHTML = `
      <div class="sandbox-result-badge ${badgeClass}">${badgeText}</div>
      <div class="sandbox-result-text">${feedback}</div>
      ${strengths.length > 0 ? `
        <div class="sandbox-strengths" style="margin-top: 10px; font-size: 12px; color: #34d399;">
          <strong>Demonstrated Strengths:</strong>
          <ul>${strengths.map((s) => `<li>${s}</li>`).join("")}</ul>
        </div>
      ` : ""}
      ${misconceptions.length > 0 ? `
        <div class="sandbox-misconceptions" style="margin-top: 10px; font-size: 12px; color: #fb7185;">
          <strong>Key Focus Areas:</strong>
          <ul>${misconceptions.map((m) => `<li>${m}</li>`).join("")}</ul>
        </div>
      ` : ""}
    `;
    }
    hide() {
      this.container.classList.add("hidden");
    }
  };

  // public/js/auth.ts
  var AuthManager = class {
    user = null;
    token = null;
    authStateCallbacks = [];
    constructor() {
      this.loadPersistedAuth();
    }
    loadPersistedAuth() {
      try {
        const storedToken = localStorage.getItem("klaivo_auth_token");
        const storedUser = localStorage.getItem("klaivo_user");
        if (storedToken && storedUser) {
          this.token = storedToken;
          this.user = JSON.parse(storedUser);
        }
      } catch (e) {
        console.warn("[Auth] Error parsing persisted auth:", e);
      }
    }
    getToken() {
      return this.token;
    }
    getUser() {
      return this.user;
    }
    isAuthenticated() {
      return !!this.user && !!this.token;
    }
    getAuthHeaders() {
      if (this.token) {
        return { Authorization: `Bearer ${this.token}` };
      }
      return {};
    }
    onAuthStateChanged(cb) {
      this.authStateCallbacks.push(cb);
      cb(this.user);
    }
    notifyStateChange() {
      this.authStateCallbacks.forEach((cb) => cb(this.user));
    }
    setSession(user, token) {
      this.user = user;
      this.token = token;
      localStorage.setItem("klaivo_auth_token", token);
      localStorage.setItem("klaivo_user", JSON.stringify(user));
      this.updateUserNavUI();
      this.notifyStateChange();
    }
    clearSession() {
      this.user = null;
      this.token = null;
      localStorage.removeItem("klaivo_auth_token");
      localStorage.removeItem("klaivo_user");
      this.updateUserNavUI();
      this.notifyStateChange();
    }
    /**
     * Verify session with server on initial page load
     */
    async checkSession() {
      if (!this.token) return null;
      try {
        const res = await fetch("/api/auth/me", {
          headers: this.getAuthHeaders()
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            this.user = data.user;
            localStorage.setItem("klaivo_user", JSON.stringify(data.user));
            this.updateUserNavUI();
            this.notifyStateChange();
            return this.user;
          }
        }
        this.clearSession();
        return null;
      } catch (err) {
        console.warn("[Auth] Verification check error:", err);
        return this.user;
      }
    }
    /**
     * Initialize Auth UI DOM Elements & Event Listeners
     */
    initUI(onSessionRefreshRequested) {
      this.renderUserNavSlot();
      this.renderAuthModal();
      this.bindEvents(onSessionRefreshRequested);
      this.updateUserNavUI();
    }
    /**
     * Render User Slot at the bottom of the Left Nav Sidebar (.app-left-nav)
     */
    renderUserNavSlot() {
      const leftNav = document.getElementById("app-left-nav");
      if (!leftNav) return;
      if (document.getElementById("user-profile-slot")) return;
      const slotContainer = document.createElement("div");
      slotContainer.className = "user-profile-slot-container";
      slotContainer.id = "user-profile-slot-container";
      slotContainer.innerHTML = `
      <div class="user-profile-slot" id="user-profile-slot">
        <div class="user-avatar-wrapper" id="user-avatar-wrapper">
          <span class="user-avatar-initials" id="user-avatar-initials">?</span>
        </div>
        <div class="user-info-text">
          <span class="user-display-name" id="user-display-name">Log in / Sign up</span>
          <span class="user-subtext" id="user-subtext">Save history & memory</span>
        </div>
        <div class="user-slot-action-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>

      <!-- Popover Menu for Logged In User -->
      <div class="user-popover-menu hidden" id="user-popover-menu">
        <div class="popover-user-header">
          <div class="popover-user-name" id="popover-user-name">Learner</div>
          <div class="popover-user-email" id="popover-user-email">learner@klaivo.com</div>
        </div>
        <div class="popover-divider"></div>
        <button class="popover-menu-item danger" id="popover-logout-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Sign Out</span>
        </button>
      </div>
    `;
      leftNav.appendChild(slotContainer);
    }
    /**
     * Render Full-Screen Auth Overlay in document.body (Perplexity-Style Overlay)
     */
    renderAuthModal() {
      if (document.getElementById("auth-modal")) return;
      const modalOverlay = document.createElement("div");
      modalOverlay.className = "auth-modal-overlay hidden";
      modalOverlay.id = "auth-modal";
      modalOverlay.innerHTML = `
      <button class="auth-top-close" id="auth-modal-close" title="Close" aria-label="Close dialog">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <div class="auth-fullscreen-container">
        <div class="auth-modal-header">
          <h1 class="auth-modal-title" id="auth-modal-title">Sign in to save your personalized learning paths & memory</h1>
        </div>


        <!-- Form Error Alert Banner -->
        <div class="auth-error-banner hidden" id="auth-error-banner"></div>

        <form class="auth-form" id="auth-form" autocomplete="on">
          <div class="auth-field-group hidden" id="auth-name-group">
            <input type="text" id="auth-input-name" class="auth-input" placeholder="Full name" autocomplete="name" />
          </div>

          <div class="auth-field-group">
            <input type="email" id="auth-input-email" class="auth-input" placeholder="Enter your email" required autocomplete="email" />
          </div>

          <div class="auth-field-group" id="auth-password-group">
            <input type="password" id="auth-input-password" class="auth-input" placeholder="Enter your password" required autocomplete="current-password" minlength="6" />
          </div>

          <button type="submit" class="auth-submit-btn" id="auth-submit-btn">
            <span id="auth-submit-text">Continue with email</span>
            <div class="auth-spinner hidden" id="auth-spinner"></div>
          </button>
        </form>

        <div class="auth-modal-footer">
          <div class="auth-mode-switch-footer" id="auth-mode-switch-container">
            <span id="auth-switch-text">Don't have an account?</span>
            <button type="button" class="auth-switch-btn" id="auth-switch-mode-btn">Sign Up</button>
          </div>
        </div>

        <div class="auth-bottom-close-container">
          <button type="button" class="auth-bottom-close-btn" id="auth-bottom-close-btn">Close</button>
        </div>
      </div>
    `;
      document.body.appendChild(modalOverlay);
    }
    /**
     * Bind event listeners for slot, modal, tabs, form, and popover
     */
    bindEvents(onSessionRefreshRequested) {
      const slot = document.getElementById("user-profile-slot");
      const popover = document.getElementById("user-popover-menu");
      const modal = document.getElementById("auth-modal");
      const closeBtn = document.getElementById("auth-modal-close");
      const tabLogin = document.getElementById("auth-tab-login");
      const tabSignup = document.getElementById("auth-tab-signup");
      const form = document.getElementById("auth-form");
      const logoutBtn = document.getElementById("popover-logout-btn");
      let currentMode = "login";
      slot?.addEventListener("click", (e) => {
        e.stopPropagation();
        if (this.isAuthenticated()) {
          popover?.classList.toggle("hidden");
        } else {
          this.openAuthModal("login");
        }
      });
      document.addEventListener("click", (e) => {
        if (popover && !popover.contains(e.target) && !slot?.contains(e.target)) {
          popover.classList.add("hidden");
        }
      });
      closeBtn?.addEventListener("click", () => this.closeAuthModal());
      document.getElementById("auth-bottom-close-btn")?.addEventListener("click", () => this.closeAuthModal());
      const switchBtn = document.getElementById("auth-switch-mode-btn");
      const switchText = document.getElementById("auth-switch-text");
      const nameGroup = document.getElementById("auth-name-group");
      const submitText = document.getElementById("auth-submit-text");
      switchBtn?.addEventListener("click", () => {
        if (currentMode === "login") {
          currentMode = "signup";
          nameGroup?.classList.remove("hidden");
          if (submitText) submitText.textContent = "Create Account";
          if (switchText) switchText.textContent = "Already have an account?";
          if (switchBtn) switchBtn.textContent = "Sign In";
        } else {
          currentMode = "login";
          nameGroup?.classList.add("hidden");
          if (submitText) submitText.textContent = "Continue with email";
          if (switchText) switchText.textContent = "Don't have an account?";
          if (switchBtn) switchBtn.textContent = "Sign Up";
        }
        this.clearError();
      });
      form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        this.clearError();
        const email = document.getElementById("auth-input-email").value.trim();
        const password = document.getElementById("auth-input-password").value;
        const fullName = document.getElementById("auth-input-name").value.trim();
        if (!email || !password) return;
        this.setSubmitting(true);
        try {
          const endpoint = currentMode === "signup" ? "/api/auth/signup" : "/api/auth/login";
          const bodyPayload = { email, password };
          if (currentMode === "signup" && fullName) {
            bodyPayload.full_name = fullName;
          }
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyPayload)
          });
          const data = await res.json();
          if (!res.ok || data.error) {
            throw new Error(data.error || "Authentication failed");
          }
          if (data.user && data.token) {
            this.setSession(data.user, data.token);
            const activeSessionId = localStorage.getItem("klaivo_current_session_id");
            if (activeSessionId) {
              try {
                await fetch("/api/sessions/claim", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    ...this.getAuthHeaders()
                  },
                  body: JSON.stringify({ sessionId: activeSessionId })
                });
              } catch (_) {
              }
            }
            this.closeAuthModal();
            if (onSessionRefreshRequested) {
              onSessionRefreshRequested();
            }
          } else if (currentMode === "signup" && !data.session) {
            this.showError("Registration successful! Please check your email to confirm your account before signing in.");
          }
        } catch (err) {
          this.showError(err.message || "Authentication failed. Please try again.");
        } finally {
          this.setSubmitting(false);
        }
      });
      logoutBtn?.addEventListener("click", async () => {
        try {
          await fetch("/api/auth/logout", {
            method: "POST",
            headers: this.getAuthHeaders()
          });
        } catch (_) {
        }
        popover?.classList.add("hidden");
        this.clearSession();
        if (onSessionRefreshRequested) {
          onSessionRefreshRequested();
        }
      });
    }
    openAuthModal(mode = "login") {
      const modal = document.getElementById("auth-modal");
      if (!modal) return;
      modal.classList.remove("hidden");
      const switchBtn = document.getElementById("auth-switch-mode-btn");
      const switchText = document.getElementById("auth-switch-text");
      const nameGroup = document.getElementById("auth-name-group");
      const submitText = document.getElementById("auth-submit-text");
      if (mode === "signup") {
        nameGroup?.classList.remove("hidden");
        if (submitText) submitText.textContent = "Create Account";
        if (switchText) switchText.textContent = "Already have an account?";
        if (switchBtn) switchBtn.textContent = "Sign In";
      } else {
        nameGroup?.classList.add("hidden");
        if (submitText) submitText.textContent = "Continue with email";
        if (switchText) switchText.textContent = "Don't have an account?";
        if (switchBtn) switchBtn.textContent = "Sign Up";
      }
    }
    closeAuthModal() {
      const modal = document.getElementById("auth-modal");
      if (modal) modal.classList.add("hidden");
      this.clearError();
    }
    showError(msg) {
      const banner = document.getElementById("auth-error-banner");
      if (banner) {
        banner.textContent = msg;
        banner.classList.remove("hidden");
      }
    }
    clearError() {
      const banner = document.getElementById("auth-error-banner");
      if (banner) {
        banner.textContent = "";
        banner.classList.add("hidden");
      }
    }
    setSubmitting(isSubmitting) {
      const submitBtn = document.getElementById("auth-submit-btn");
      const submitText = document.getElementById("auth-submit-text");
      const spinner = document.getElementById("auth-spinner");
      if (submitBtn) submitBtn.disabled = isSubmitting;
      if (submitText) submitText.style.opacity = isSubmitting ? "0.4" : "1";
      if (spinner) spinner.classList.toggle("hidden", !isSubmitting);
    }
    /**
     * Refresh Left Navigation Profile Slot state
     */
    updateUserNavUI() {
      const nameEl = document.getElementById("user-display-name");
      const subtextEl = document.getElementById("user-subtext");
      const initialsEl = document.getElementById("user-avatar-initials");
      const popoverName = document.getElementById("popover-user-name");
      const popoverEmail = document.getElementById("popover-user-email");
      if (this.user) {
        const displayName = this.user.display_name || this.user.email.split("@")[0];
        const initials = displayName.slice(0, 2).toUpperCase();
        if (nameEl) nameEl.textContent = displayName;
        if (subtextEl) subtextEl.textContent = this.user.email;
        if (initialsEl) initialsEl.textContent = initials;
        if (popoverName) popoverName.textContent = displayName;
        if (popoverEmail) popoverEmail.textContent = this.user.email;
      } else {
        if (nameEl) nameEl.textContent = "Log in / Sign up";
        if (subtextEl) subtextEl.textContent = "Save history & memory";
        if (initialsEl) initialsEl.textContent = "?";
      }
    }
  };
  var authManager = new AuthManager();

  // public/js/app.ts
  document.addEventListener("DOMContentLoaded", () => {
    let sessionId = null;
    let activeNodeId = null;
    let currentNodeOpenRequestId = 0;
    let calibration = "Beginner";
    let nodes = [];
    let selectedFiles = [];
    authManager.initUI(() => {
      loadNavigationHistory();
    });
    authManager.checkSession();
    const welcomeScreen = document.getElementById("welcome-screen");
    const workspaceScreen = document.getElementById("workspace-screen");
    const headerStatus = document.getElementById("header-status");
    const headerCalibration = document.getElementById("header-calibration");
    const progressOverlay = document.getElementById("progress-overlay");
    const progressText = document.getElementById("progress-text");
    const welcomeInput = document.getElementById("welcome-input");
    const welcomeSendBtn = document.getElementById("welcome-send-btn");
    const welcomeFileInput = document.getElementById("welcome-file-input");
    const welcomeFilesList = document.getElementById("welcome-files-list");
    const suggestionChips = document.querySelectorAll(".suggestion-chip");
    const chatSidebar = document.getElementById("chat-sidebar");
    const canvasPanel = document.getElementById("canvas-panel");
    const panelResizer = document.getElementById("panel-resizer");
    const toggleSidebarBtn = document.getElementById("toggle-sidebar-btn");
    const sidebarNodeTitle = document.getElementById("sidebar-node-title");
    const sidebarNodeStatus = document.getElementById("sidebar-node-status");
    const exitNodeBtn = document.getElementById("exit-node-btn");
    const chatHistory = document.getElementById("chat-history");
    const chatInput = document.getElementById("chat-input");
    const sendChatBtn = document.getElementById("send-chat-btn");
    const onboardingFileInput = document.getElementById("onboarding-file-input");
    const onboardingFilesList = document.getElementById("onboarding-files-list");
    const canvasSessionTitle = document.getElementById("canvas-session-title");
    const canvasSessionStats = document.getElementById("canvas-session-stats");
    const canvas = new ConceptCanvas("concept-svg");
    window.canvas = canvas;
    const taskSandbox = new TaskSandbox("task-sandbox-container");
    function setupAutoResizeTextarea(textarea) {
      if (!textarea) return;
      const adjustHeight = () => {
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
      };
      textarea.addEventListener("input", adjustHeight);
    }
    setupAutoResizeTextarea(welcomeInput);
    setupAutoResizeTextarea(chatInput);
    const welcomeAttachBtn = document.getElementById("welcome-attach-btn");
    welcomeAttachBtn?.addEventListener("click", () => {
      welcomeFileInput.click();
    });
    const appLeftNav = document.getElementById("app-left-nav");
    const sidebarToggleBtn = document.getElementById("sidebar-toggle-btn");
    const navNewSessionBtn = document.getElementById("nav-new-session-btn");
    const navSessionsGroup = document.getElementById("nav-sessions-group");
    const navSessionsHeader = document.getElementById("nav-sessions-header");
    const navSessionsList = document.getElementById("nav-sessions-list");
    const navHistoryGroup = document.getElementById("nav-history-group");
    const navHistoryHeader = document.getElementById("nav-history-header");
    const navHistoryList = document.getElementById("nav-history-list");
    const navLogoSection = document.querySelector(".nav-logo-section");
    sidebarToggleBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      appLeftNav.classList.toggle("collapsed");
    });
    navLogoSection?.addEventListener("click", () => {
      if (appLeftNav.classList.contains("collapsed")) {
        appLeftNav.classList.remove("collapsed");
      }
    });
    function updateTimeOfDayGreeting() {
      const greetingTitle = document.getElementById("welcome-greeting-title");
      if (!greetingTitle) return;
      const hour = (/* @__PURE__ */ new Date()).getHours();
      let timeGreeting = "Good afternoon";
      if (hour >= 5 && hour < 12) {
        timeGreeting = "Good morning";
      } else if (hour >= 12 && hour < 17) {
        timeGreeting = "Good afternoon";
      } else {
        timeGreeting = "Good evening";
      }
      greetingTitle.textContent = timeGreeting;
    }
    updateTimeOfDayGreeting();
    navSessionsHeader?.addEventListener("click", () => {
      navSessionsGroup.classList.toggle("collapsed");
    });
    navHistoryHeader?.addEventListener("click", () => {
      navHistoryGroup.classList.toggle("collapsed");
    });
    navNewSessionBtn?.addEventListener("click", resetToWelcomeScreen);
    function resetToWelcomeScreen() {
      currentNodeOpenRequestId++;
      sessionId = null;
      activeNodeId = null;
      nodes = [];
      selectedFiles = [];
      canvas.render([]);
      welcomeInput.value = "";
      welcomeInput.style.height = "auto";
      welcomeFilesList.innerHTML = "";
      onboardingFilesList.innerHTML = "";
      chatHistory.innerHTML = "";
      if (headerStatus) headerStatus.classList.add("hidden");
      if (headerSplitToggleBtn) headerSplitToggleBtn.style.display = "none";
      workspaceScreen.classList.add("hidden");
      welcomeScreen.classList.remove("hidden");
      updateTimeOfDayGreeting();
      welcomeInput.focus();
      loadNavigationHistory();
    }
    function toSentenceCase(str) {
      if (!str) return "";
      const trimmed = str.trim();
      if (trimmed.length === 0) return "";
      const words = trimmed.split(/\s+/);
      return words.map((word, i) => {
        if (/^[A-Z0-9]{2,5}$/.test(word)) return word;
        if (/^(Python|JavaScript|TypeScript|React|Next|Node|C\+\+|SQL|HTML|CSS|SQLite|Postgres)$/i.test(word)) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
        if (i === 0) {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
        return word.toLowerCase();
      }).join(" ");
    }
    let activeContextMenu = null;
    function closeActiveContextMenu() {
      if (activeContextMenu) {
        activeContextMenu.remove();
        activeContextMenu = null;
        document.querySelectorAll(".nav-item-options-btn").forEach((btn) => btn.classList.remove("menu-open"));
      }
    }
    window.addEventListener("click", () => closeActiveContextMenu());
    window.addEventListener("scroll", () => closeActiveContextMenu(), true);
    function createNavItemOptionsBtn() {
      const btn = document.createElement("button");
      btn.className = "nav-item-options-btn";
      btn.title = "Options";
      btn.setAttribute("aria-label", "Options");
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="5" r="1.5"/>
      <circle cx="12" cy="12" r="1.5"/>
      <circle cx="12" cy="19" r="1.5"/>
    </svg>`;
      return btn;
    }
    function showContextMenu(e, targetBtn, menuItems) {
      e.stopPropagation();
      closeActiveContextMenu();
      targetBtn.classList.add("menu-open");
      const menu = document.createElement("div");
      menu.className = "nav-context-menu";
      menuItems.forEach((mi) => {
        const item = document.createElement("div");
        item.className = `nav-context-item ${mi.isDanger ? "danger" : ""}`;
        item.innerHTML = `${mi.iconSvg} <span>${mi.label}</span>`;
        item.addEventListener("click", (ev) => {
          ev.stopPropagation();
          closeActiveContextMenu();
          mi.onClick();
        });
        menu.appendChild(item);
      });
      document.body.appendChild(menu);
      activeContextMenu = menu;
      const rect = targetBtn.getBoundingClientRect();
      let top = rect.bottom + 4;
      let left = rect.left - 110;
      if (left < 10) left = rect.right + 4;
      if (top + 90 > window.innerHeight) top = rect.top - 90;
      menu.style.top = `${top}px`;
      menu.style.left = `${left}px`;
    }
    async function loadNavigationHistory() {
      try {
        const res = await fetch("/api/sessions", {
          headers: authManager.getAuthHeaders()
        });
        if (!res.ok) return;
        const data = await res.json();
        const rawSessions = data.sessions || [];
        const sessions = rawSessions.map((s) => s.session ? { ...s.session, nodes: s.nodes } : s);
        const buildSessionNavItem = (sess) => {
          const item = document.createElement("div");
          item.className = `nav-item ${sess.id === sessionId && !activeNodeId ? "active" : ""}`;
          const displayTitle = toSentenceCase(sess.title || "Untitled session");
          item.innerHTML = `<div class="nav-item-title-container"><div class="nav-item-title">${displayTitle}</div></div>`;
          item.addEventListener("click", () => {
            openSessionAndNode(sess.id, null);
          });
          const optBtn = createNavItemOptionsBtn();
          optBtn.addEventListener("click", (ev) => {
            showContextMenu(ev, optBtn, [
              {
                label: "Rename",
                iconSvg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>`,
                onClick: async () => {
                  const newTitle = prompt("Rename learning session:", sess.title);
                  if (newTitle && newTitle.trim() && newTitle.trim() !== sess.title) {
                    try {
                      const updateRes = await fetch(`/api/sessions/${sess.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ title: newTitle.trim() })
                      });
                      if (updateRes.ok) {
                        if (sess.id === sessionId && sidebarNodeTitle) {
                          sidebarNodeTitle.textContent = toSentenceCase(newTitle.trim());
                        }
                        loadNavigationHistory();
                      }
                    } catch (err) {
                      console.error("Error renaming session:", err);
                    }
                  }
                }
              },
              {
                label: "Delete",
                iconSvg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
                isDanger: true,
                onClick: async () => {
                  if (confirm(`Delete "${displayTitle}"?`)) {
                    try {
                      const delRes = await fetch(`/api/sessions/${sess.id}`, { method: "DELETE" });
                      if (delRes.ok) {
                        if (sess.id === sessionId) {
                          resetToWelcomeScreen();
                        } else {
                          loadNavigationHistory();
                        }
                      }
                    } catch (err) {
                      console.error("Error deleting session:", err);
                    }
                  }
                }
              }
            ]);
          });
          item.appendChild(optBtn);
          return item;
        };
        navSessionsList.innerHTML = "";
        if (sessions.length === 0) {
          navSessionsList.innerHTML = `<div class="nav-item-sub" style="padding: 6px 8px;">No sessions yet</div>`;
        } else {
          const visibleSessions = sessions.slice(0, 7);
          const remainingSessions = sessions.slice(7);
          visibleSessions.forEach((sess) => {
            navSessionsList.appendChild(buildSessionNavItem(sess));
          });
          if (remainingSessions.length > 0) {
            const moreContainer = document.createElement("div");
            moreContainer.className = "nav-more-sessions-container";
            moreContainer.style.display = "none";
            remainingSessions.forEach((sess) => {
              moreContainer.appendChild(buildSessionNavItem(sess));
            });
            navSessionsList.appendChild(moreContainer);
            const showMoreBtn = document.createElement("div");
            showMoreBtn.className = "nav-more-toggle-btn";
            showMoreBtn.innerHTML = `<span>More</span>`;
            showMoreBtn.addEventListener("click", () => {
              const isHidden = moreContainer.style.display === "none";
              moreContainer.style.display = isHidden ? "block" : "none";
              showMoreBtn.innerHTML = isHidden ? `<span>Less</span>` : `<span>More</span>`;
            });
            navSessionsList.appendChild(showMoreBtn);
          }
        }
        navHistoryList.innerHTML = "";
        const allNodeChats = [];
        sessions.forEach((sess) => {
          if (sess.nodes) {
            sess.nodes.forEach((n) => {
              if (n.status !== "locked") {
                allNodeChats.push({ sessionId: sess.id, sessionTitle: sess.title, node: n });
              }
            });
          }
        });
        if (allNodeChats.length === 0) {
          navHistoryList.innerHTML = `<div class="nav-item-sub" style="padding: 6px 8px;">No recent chats</div>`;
        } else {
          allNodeChats.slice(0, 20).forEach((chat) => {
            const item = document.createElement("div");
            item.className = `nav-item ${chat.sessionId === sessionId && chat.node.id === activeNodeId ? "active" : ""}`;
            const isStarred = !!chat.node.is_starred;
            const starIcon = isStarred ? `<span class="nav-item-star-icon" title="Starred">\u2605</span>` : "";
            const nodeTitle = toSentenceCase(chat.node.title);
            item.innerHTML = `<div class="nav-item-title-container">${starIcon}<div class="nav-item-title">${nodeTitle}</div></div>`;
            item.addEventListener("click", () => {
              openSessionAndNode(chat.sessionId, chat.node.id);
            });
            const optBtn = createNavItemOptionsBtn();
            optBtn.addEventListener("click", (ev) => {
              showContextMenu(ev, optBtn, [
                {
                  label: isStarred ? "Unstar" : "Star",
                  iconSvg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="${isStarred ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
                  onClick: async () => {
                    try {
                      const starRes = await fetch(`/api/sessions/${chat.sessionId}/nodes/${chat.node.id}/star`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ isStarred: !isStarred })
                      });
                      if (starRes.ok) {
                        loadNavigationHistory();
                      }
                    } catch (err) {
                      console.error("Error starring history item:", err);
                    }
                  }
                },
                {
                  label: "Reset Thread",
                  iconSvg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>`,
                  onClick: async () => {
                    if (confirm(`Reset conversation thread for "${nodeTitle}"?

This will clear chat history for this concept node so you can re-learn it from scratch.`)) {
                      try {
                        const resetRes = await fetch(`/api/sessions/${chat.sessionId}/nodes/${chat.node.id}/reset`, { method: "POST" });
                        if (resetRes.ok) {
                          if (chat.sessionId === sessionId && chat.node.id === activeNodeId) {
                            chatHistory.innerHTML = "";
                          }
                          loadNavigationHistory();
                        }
                      } catch (err) {
                        console.error("Error resetting history chat:", err);
                      }
                    }
                  }
                }
              ]);
            });
            item.appendChild(optBtn);
            navHistoryList.appendChild(item);
          });
        }
      } catch (err) {
        console.error("Error loading navigation history:", err);
      }
    }
    async function openSessionAndNode(sessId, nodeId) {
      try {
        const res = await fetch(`/api/sessions/${sessId}`);
        if (!res.ok) return;
        const data = await res.json();
        sessionId = sessId;
        calibration = data.session.calibration.level;
        nodes = data.nodes || [];
        if (headerCalibration) headerCalibration.textContent = calibration;
        if (headerStatus) headerStatus.classList.remove("hidden");
        if (canvasSessionTitle) canvasSessionTitle.textContent = toSentenceCase(data.session.title);
        canvas.render(nodes);
        updateStats();
        enterDiscoveryMode();
        activateSplitScreen();
        document.querySelectorAll("#nav-sessions-list .nav-item, #nav-history-list .nav-item").forEach((el) => el.classList.remove("active"));
        if (nodeId) {
          const targetNode = nodes.find((n) => String(n.id) === String(nodeId));
          if (targetNode) {
            const requestId = ++currentNodeOpenRequestId;
            activeNodeId = targetNode.id;
            if (targetNode.status !== "completed") {
              targetNode.status = "in_progress";
            }
            await fetch(`/api/sessions/${sessId}/nodes/${targetNode.id}/open`, { method: "POST" }).catch(() => {
            });
            if (sidebarNodeTitle) sidebarNodeTitle.textContent = toSentenceCase(targetNode.title);
            if (sidebarNodeStatus) {
              sidebarNodeStatus.textContent = targetNode.status.toUpperCase();
              sidebarNodeStatus.className = `node-badge ${targetNode.status}`;
            }
            if (exitNodeBtn) exitNodeBtn.style.display = "block";
            document.querySelectorAll(".svg-node-group").forEach((el) => el.classList.remove("active"));
            document.getElementById(`node-group-${targetNode.id}`)?.classList.add("active");
            chatHistory.innerHTML = "";
            const chatRes = await fetch(`/api/sessions/${sessId}/nodes/${targetNode.id}/chat`);
            if (requestId !== currentNodeOpenRequestId || activeNodeId !== targetNode.id) return;
            if (chatRes.ok) {
              const historyMsgs = await chatRes.json();
              if (requestId !== currentNodeOpenRequestId || activeNodeId !== targetNode.id) return;
              historyMsgs.forEach((msg) => appendMessage(msg.sender, msg.content, targetNode.id));
              if (historyMsgs.some((m) => m.sender === "assistant")) {
                appendTaskLauncherCard(targetNode);
              }
            }
          }
        } else {
          activeNodeId = null;
          if (sidebarNodeTitle) sidebarNodeTitle.textContent = toSentenceCase(data.session.title || "Learning Session");
          if (sidebarNodeStatus) {
            sidebarNodeStatus.textContent = "DIAGNOSIS";
          }
          if (exitNodeBtn) exitNodeBtn.style.display = "none";
          chatHistory.innerHTML = "";
          if (data.messages && Array.isArray(data.messages)) {
            data.messages.forEach((msg) => {
              appendMessage(msg.sender === "user" ? "user" : "assistant", msg.content);
            });
          }
        }
        loadNavigationHistory();
      } catch (err) {
        console.error("Error loading session from nav:", err);
      }
    }
    loadNavigationHistory();
    function enterDiscoveryMode() {
      welcomeScreen.classList.add("hidden");
      workspaceScreen.classList.remove("hidden");
      workspaceScreen.classList.add("discovery-mode");
      if (headerSplitToggleBtn) headerSplitToggleBtn.style.display = "flex";
    }
    function getBalancedSplitWidth() {
      const navLeft = appLeftNav ? appLeftNav.getBoundingClientRect().width : 0;
      const availableWidth = window.innerWidth - navLeft;
      return Math.max(360, Math.min(Math.round(availableWidth * 0.45), 750));
    }
    function activateSplitScreen() {
      workspaceScreen.classList.remove("discovery-mode");
      if (toggleSidebarBtn) toggleSidebarBtn.classList.remove("hidden");
      chatInput.placeholder = "Type your response...";
      if (headerSplitToggleBtn) headerSplitToggleBtn.style.display = "flex";
      chatSidebar.style.width = `${getBalancedSplitWidth()}px`;
    }
    let currentViewMode = "split";
    let isResizing = false;
    const headerSplitToggleBtn = document.getElementById("header-split-toggle-btn");
    const canvasFullscreenBtn = document.getElementById("canvas-fullscreen-btn");
    if (headerSplitToggleBtn) headerSplitToggleBtn.style.display = "none";
    function setWorkspaceViewMode(mode) {
      currentViewMode = mode;
      chatSidebar.classList.remove("collapsed");
      canvasPanel.classList.remove("collapsed");
      workspaceScreen.classList.remove("chat-only-mode");
      workspaceScreen.classList.remove("canvas-only-mode");
      panelResizer.style.display = "block";
      if (mode === "canvas-only") {
        chatSidebar.classList.add("collapsed");
        workspaceScreen.classList.add("canvas-only-mode");
        panelResizer.style.display = "none";
        if (headerSplitToggleBtn) headerSplitToggleBtn.classList.remove("active");
      } else if (mode === "chat-only") {
        canvasPanel.classList.add("collapsed");
        workspaceScreen.classList.add("chat-only-mode");
        panelResizer.style.display = "none";
        if (headerSplitToggleBtn) headerSplitToggleBtn.classList.remove("active");
      } else {
        if (headerSplitToggleBtn) headerSplitToggleBtn.classList.add("active");
      }
    }
    headerSplitToggleBtn?.addEventListener("click", () => {
      setWorkspaceViewMode(currentViewMode === "chat-only" ? "split" : "chat-only");
    });
    canvasFullscreenBtn?.addEventListener("click", () => {
      setWorkspaceViewMode(currentViewMode === "canvas-only" ? "split" : "canvas-only");
    });
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        if (workspaceScreen.classList.contains("discovery-mode")) return;
        e.preventDefault();
        setWorkspaceViewMode(currentViewMode === "split" ? "canvas-only" : "split");
      }
    });
    panelResizer?.addEventListener("dblclick", (e) => {
      if (e.target.closest(".gutter-toggle-btn")) return;
      chatSidebar.style.width = `${getBalancedSplitWidth()}px`;
      if (currentViewMode === "canvas-only") {
        setWorkspaceViewMode("split");
      }
    });
    let dragStartLeftOffset = 0;
    panelResizer?.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".gutter-toggle-btn")) return;
      isResizing = true;
      try {
        panelResizer.setPointerCapture(e.pointerId);
      } catch (_) {
      }
      const sidebarRect = chatSidebar.getBoundingClientRect();
      dragStartLeftOffset = sidebarRect.left;
      panelResizer.classList.add("resizing");
      chatSidebar.classList.add("resizing");
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    });
    panelResizer?.addEventListener("pointermove", (e) => {
      if (!isResizing) return;
      const mouseWidth = e.clientX - dragStartLeftOffset;
      const snapThreshold = 180;
      const minWidth = 280;
      const availableWidth = window.innerWidth - dragStartLeftOffset;
      const maxWidth = Math.min(availableWidth - 300, availableWidth * 0.75);
      if (mouseWidth < snapThreshold) {
        setWorkspaceViewMode("canvas-only");
      } else {
        if (currentViewMode === "canvas-only") {
          setWorkspaceViewMode("split");
        }
        const clampedWidth = Math.max(minWidth, Math.min(mouseWidth, maxWidth));
        chatSidebar.style.width = `${clampedWidth}px`;
      }
    });
    const stopPointerResizing = (e) => {
      if (isResizing) {
        isResizing = false;
        try {
          panelResizer.releasePointerCapture(e.pointerId);
        } catch (_) {
        }
        panelResizer.classList.remove("resizing");
        chatSidebar.classList.remove("resizing");
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };
    panelResizer?.addEventListener("pointerup", stopPointerResizing);
    panelResizer?.addEventListener("pointercancel", stopPointerResizing);
    function showLoader(text) {
      progressText.textContent = text;
      progressOverlay.classList.remove("hidden");
    }
    function hideLoader() {
      progressOverlay.classList.add("hidden");
    }
    function formatMarkdown(text) {
      if (!text) return "";
      const codeBlocks = [];
      let formatted = text.replace(/```(\w+)?\n?([\s\S]*?)```/g, (_, lang, code) => {
        const escapedCode = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const langLabel = (lang || "code").toUpperCase();
        const blockHtml = `<pre><div class="code-block-header"><span>${langLabel}</span></div><code>${escapedCode}</code></pre>`;
        codeBlocks.push(blockHtml);
        return `___CODE_BLOCK_${codeBlocks.length - 1}___`;
      });
      formatted = formatted.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>").replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\[blur\](.*?)\[\/blur\]/gi, '<span class="active-recall-blur" title="Click or hover to reveal term" role="button" tabindex="0">$1</span>').replace(/\[\[(.*?)\]\]/g, '<span class="active-recall-blur" title="Click or hover to reveal term" role="button" tabindex="0">$1</span>').replace(/\[(\d+)\]/g, '<span class="citation-chip" title="Citation Source [$1]">$1</span>').replace(/\n/g, "<br>");
      codeBlocks.forEach((block, index) => {
        formatted = formatted.replace(`___CODE_BLOCK_${index}___`, block);
      });
      return formatted;
    }
    let activeTypewriter = null;
    function animateTextReveal(bubble, fullText, requestId, targetNodeId) {
      return new Promise((resolve) => {
        if (activeTypewriter) {
          activeTypewriter.finish();
        }
        if (!fullText || !bubble) {
          resolve();
          return;
        }
        let timerId = null;
        let charIndex = 0;
        const totalLength = fullText.length;
        let isCompleted = false;
        const speedMs = 18;
        const targetCharsPerSec = 240;
        const targetTotalMs = Math.min(7e3, Math.max(350, totalLength / targetCharsPerSec * 1e3));
        const totalTicks = Math.max(1, Math.round(targetTotalMs / speedMs));
        const charsPerTick = Math.max(1, Math.ceil(totalLength / totalTicks));
        const finish = () => {
          if (isCompleted) return;
          isCompleted = true;
          if (timerId) clearInterval(timerId);
          renderMessageBubble(bubble, fullText, false);
          if (chatHistory) chatHistory.scrollTop = chatHistory.scrollHeight;
          if (activeTypewriter?.bubble === bubble) {
            activeTypewriter = null;
          }
          resolve();
        };
        const cancel = () => {
          if (isCompleted) return;
          isCompleted = true;
          if (timerId) clearInterval(timerId);
          renderMessageBubble(bubble, fullText, false);
          if (activeTypewriter?.bubble === bubble) {
            activeTypewriter = null;
          }
          resolve();
        };
        activeTypewriter = { bubble, fullText, finish, cancel };
        timerId = setInterval(() => {
          if (requestId !== void 0 && requestId !== currentNodeOpenRequestId) {
            cancel();
            return;
          }
          if (targetNodeId !== void 0 && targetNodeId !== activeNodeId) {
            cancel();
            return;
          }
          charIndex += charsPerTick;
          if (charIndex < totalLength) {
            while (charIndex < totalLength && !/\s|[.,!?;:]/.test(fullText[charIndex])) {
              charIndex++;
            }
          }
          if (charIndex >= totalLength) {
            finish();
          } else {
            const partialText = fullText.slice(0, charIndex);
            renderMessageBubble(bubble, partialText, true);
            if (chatHistory) chatHistory.scrollTop = chatHistory.scrollHeight;
          }
        }, speedMs);
      });
    }
    chatHistory?.addEventListener("click", (e) => {
      const target = e.target;
      if (target && target.classList.contains("active-recall-blur")) {
        target.classList.toggle("revealed");
      }
    });
    function renderMessageBubble(bubble, content, isAnimating = false) {
      const cursorHtml = isAnimating ? '<span class="typing-cursor"></span>' : "";
      if (content.includes("thinking-dots")) {
        bubble.innerHTML = content;
        return;
      }
      if (content.includes("ASSESSMENT QUESTION:") || content.includes("CHECK YOUR UNDERSTANDING:")) {
        const parts = content.split(/(ASSESSMENT QUESTION:|CHECK YOUR UNDERSTANDING:)/i);
        const mainText = parts[0];
        const questionText = parts.slice(1).join("");
        bubble.innerHTML = `<p>${formatMarkdown(mainText)}</p>
        <div class="assessment-card">
          <div class="assessment-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Check Your Understanding
          </div>
          <p>${formatMarkdown(questionText)}${cursorHtml}</p>
        </div>`;
      } else {
        bubble.innerHTML = `<p>${formatMarkdown(content)}${cursorHtml}</p>`;
      }
    }
    function appendMessage(sender, content, nodeId = null) {
      const wrapper = document.createElement("div");
      wrapper.className = `message-wrapper ${sender}`;
      if (nodeId) wrapper.dataset.nodeId = nodeId;
      const bubble = document.createElement("div");
      bubble.className = "message-bubble";
      renderMessageBubble(bubble, content);
      wrapper.appendChild(bubble);
      chatHistory.appendChild(wrapper);
      chatHistory.scrollTop = chatHistory.scrollHeight;
      return wrapper;
    }
    welcomeFileInput?.addEventListener("change", (e) => {
      const files = Array.from(e.target.files || []);
      files.forEach((file) => {
        if (selectedFiles.some((f) => f.name === file.name)) return;
        selectedFiles.push(file);
        const tag = document.createElement("div");
        tag.className = "uploaded-file-tag";
        tag.innerHTML = `\u{1F4C4} ${file.name.substring(0, 20)}${file.name.length > 20 ? "\u2026" : ""} <span class="remove-file-btn" data-name="${file.name}">\xD7</span>`;
        if (welcomeFilesList) welcomeFilesList.appendChild(tag);
      });
      if (welcomeFileInput) welcomeFileInput.value = "";
    });
    welcomeFilesList?.addEventListener("click", (e) => {
      const target = e.target;
      if (target.classList.contains("remove-file-btn")) {
        selectedFiles = selectedFiles.filter((f) => f.name !== target.dataset.name);
        target.parentElement?.remove();
      }
    });
    suggestionChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const prompt2 = chip.dataset.prompt || chip.getAttribute("data-prompt") || chip.textContent?.trim() || "";
        if (prompt2 && welcomeInput) {
          welcomeInput.value = prompt2;
          welcomeInput.style.height = "auto";
          welcomeInput.style.height = `${Math.min(welcomeInput.scrollHeight, 160)}px`;
          startSession();
        }
      });
    });
    welcomeInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        startSession();
      }
    });
    let activeStreamReader = null;
    async function readSseStream(url, options, onEvent) {
      if (activeStreamReader) {
        try {
          activeStreamReader.cancel();
        } catch (_) {
        }
        activeStreamReader = null;
      }
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers || {},
          ...authManager.getAuthHeaders(),
          "Accept": "text/event-stream"
        }
      });
      if (!response.ok) {
        throw new Error(`Stream request failed with status ${response.status}`);
      }
      const reader = response.body?.getReader();
      if (!reader) throw new Error("Response body reader unavailable");
      activeStreamReader = reader;
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const blocks = buffer.split("\n\n");
          buffer = blocks.pop() || "";
          for (const block of blocks) {
            if (!block.trim()) continue;
            let eventName = "message";
            let eventData = "";
            const lines = block.split("\n");
            for (const line of lines) {
              if (line.startsWith("event:")) {
                eventName = line.substring(6).trim();
              } else if (line.startsWith("data:")) {
                eventData += line.substring(5).trim();
              }
            }
            if (eventData) {
              try {
                const parsed = JSON.parse(eventData);
                onEvent(eventName, parsed);
              } catch (_) {
              }
            }
          }
        }
      } finally {
        if (activeStreamReader === reader) {
          activeStreamReader = null;
        }
      }
    }
    welcomeSendBtn?.addEventListener("click", startSession);
    async function startSession() {
      currentNodeOpenRequestId++;
      const prompt2 = welcomeInput.value.trim();
      if (!prompt2) {
        welcomeInput.focus();
        return;
      }
      nodes = [];
      activeNodeId = null;
      canvas.render([]);
      enterDiscoveryMode();
      activateSplitScreen();
      canvas.showThinking("IntentAgent", "Initializing intake & intent classification...");
      appendMessage("user", prompt2);
      const thinkingWrapper = appendMessage("assistant", '<div class="thinking-dots"><span></span><span></span><span></span></div>');
      try {
        const formData = new FormData();
        formData.append("initial_prompt", prompt2);
        selectedFiles.forEach((file) => formData.append("documents", file));
        let finalData = null;
        await readSseStream("/api/sessions/start?stream=true", {
          method: "POST",
          body: formData
        }, (event, data) => {
          if (event === "agent_progress") {
            if (data.status === "error") {
              canvas.showThinkingError(data.agent, data.thought || "Stage delayed \u2014 retrying...");
            } else {
              canvas.showThinking(data.agent, data.thought || "Processing stage...");
            }
            if (data.payload?.nodes) {
              nodes = data.payload.nodes;
              canvas.render(nodes, true);
              updateStats();
            }
          } else if (event === "pipeline_complete") {
            finalData = data;
          }
        });
        if (!finalData) throw new Error("Session creation stream ended unexpectedly.");
        sessionId = finalData.sessionId;
        localStorage.setItem("klaivo_current_session_id", sessionId);
        calibration = finalData.calibration?.level || "intermediate";
        thinkingWrapper.remove();
        if (headerCalibration) headerCalibration.textContent = calibration;
        if (headerStatus) headerStatus.classList.remove("hidden");
        if (canvasSessionTitle) canvasSessionTitle.textContent = prompt2;
        if (finalData.status === "generation_failed") {
          const errMsg = finalData.error || finalData.response || finalData.diagnosticQuestion || "AI service rate limit / API quota exceeded \u2014 please wait a moment or check your API key and try again.";
          canvas.showThinkingError("AI Assistant", errMsg);
          appendMessage("assistant", `\u26A0\uFE0F ${errMsg}`);
          return;
        }
        if (finalData.diagnosticQuestion) {
          const diagQuestWrapper = appendMessage("assistant", "");
          await animateTextReveal(
            diagQuestWrapper.querySelector(".message-bubble"),
            finalData.diagnosticQuestion
          );
        }
        if (finalData.nodes && finalData.nodes.length > 0) {
          nodes = finalData.nodes;
          canvas.render(nodes, true);
          updateStats();
          canvas.hideThinking("\u2713 Curriculum Verified against Domain Rubrics");
          appendMessage("assistant", "\u{1F389} Your personalized learning tree has been built! Click on the first unlocked node on the right to start learning.");
        } else {
          canvas.hideThinking();
        }
        selectedFiles = [];
        welcomeFilesList.innerHTML = "";
        loadNavigationHistory();
      } catch (err) {
        console.error(err);
        thinkingWrapper.remove();
        const rawMsg = err.message || "";
        const cleanMsg = rawMsg.includes("429") || rawMsg.includes("Quota exceeded") || rawMsg.includes("503") ? "AI service rate limit / API quota exceeded \u2014 please wait a moment or check your API key and try again." : `Something went wrong starting your session: ${err.message}`;
        canvas.showThinkingError("AI Assistant", cleanMsg);
        appendMessage("assistant", `\u26A0\uFE0F ${cleanMsg}`);
      }
    }
    onboardingFileInput?.addEventListener("change", (e) => {
      const files = Array.from(e.target.files || []);
      files.forEach((file) => {
        if (selectedFiles.some((f) => f.name === file.name)) return;
        selectedFiles.push(file);
        const tag = document.createElement("div");
        tag.className = "uploaded-file-tag";
        tag.innerHTML = `\u{1F4C4} ${file.name.substring(0, 20)}${file.name.length > 20 ? "\u2026" : ""} <span class="remove-file-btn" data-name="${file.name}">\xD7</span>`;
        if (onboardingFilesList) onboardingFilesList.appendChild(tag);
      });
      if (onboardingFileInput) onboardingFileInput.value = "";
    });
    onboardingFilesList?.addEventListener("click", (e) => {
      const target = e.target;
      if (target.classList.contains("remove-file-btn")) {
        selectedFiles = selectedFiles.filter((f) => f.name !== target.dataset.name);
        target.parentElement?.remove();
      }
    });
    canvas.onNodeClick(async (node) => {
      const requestId = ++currentNodeOpenRequestId;
      document.querySelectorAll(".svg-node-group").forEach((el) => el.classList.remove("active"));
      document.getElementById(`node-group-${node.id}`)?.classList.add("active");
      activeNodeId = node.id;
      if (node.status !== "completed") {
        node.status = "in_progress";
      }
      await fetch(`/api/sessions/${sessionId}/nodes/${node.id}/open`, { method: "POST" }).catch(() => {
      });
      await loadNavigationHistory();
      if (sidebarNodeTitle) sidebarNodeTitle.textContent = node.title;
      if (sidebarNodeStatus) {
        sidebarNodeStatus.textContent = "IN_PROGRESS";
        sidebarNodeStatus.className = `node-badge in_progress`;
      }
      if (exitNodeBtn) exitNodeBtn.style.display = "block";
      chatHistory.innerHTML = "";
      const thinkingWrapper = appendMessage("assistant", '<div class="thinking-dots"><span></span><span></span><span></span></div>', node.id);
      try {
        const chatResponse = await fetch(`/api/sessions/${sessionId}/nodes/${node.id}/chat`);
        if (requestId !== currentNodeOpenRequestId || activeNodeId !== node.id) return;
        if (chatResponse.ok) {
          const history = await chatResponse.json();
          if (requestId !== currentNodeOpenRequestId || activeNodeId !== node.id) return;
          if (history.length > 0) {
            thinkingWrapper.remove();
            history.forEach((msg) => appendMessage(msg.sender, msg.content, node.id));
            if (history.some((m) => m.sender === "assistant")) {
              appendTaskLauncherCard(node);
            }
            return;
          }
        }
        const streamUrl = `/api/sessions/${sessionId}/nodes/${node.id}/teach`;
        const response = await fetch(streamUrl);
        if (requestId !== currentNodeOpenRequestId || activeNodeId !== node.id) return;
        if (!response.ok) throw new Error("Teaching agent failed");
        const reader = response.body?.getReader();
        if (!reader) throw new Error("Response body reader not available");
        const decoder = new TextDecoder("utf-8");
        let currentMsgWrapper = thinkingWrapper;
        let streamedContent = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (requestId !== currentNodeOpenRequestId || activeNodeId !== node.id) {
            try {
              reader.cancel();
            } catch (_) {
            }
            return;
          }
          const chunk = decoder.decode(value, { stream: true });
          streamedContent += chunk;
        }
        if (requestId !== currentNodeOpenRequestId || activeNodeId !== node.id) return;
        await animateTextReveal(
          currentMsgWrapper.querySelector(".message-bubble"),
          streamedContent,
          requestId,
          node.id
        );
        if (requestId !== currentNodeOpenRequestId || activeNodeId !== node.id) return;
        appendTaskLauncherCard(node);
      } catch (err) {
        if (requestId !== currentNodeOpenRequestId || activeNodeId !== node.id) return;
        console.error(err);
        thinkingWrapper.remove();
        appendMessage("assistant", "Failed to load learning content. Please try clicking the node again.");
      }
    });
    function appendTaskLauncherCard(node) {
      const existingCards = chatHistory.querySelectorAll(".task-launcher-card");
      existingCards.forEach((card) => {
        const wrapper = card.closest(".message-wrapper");
        if (wrapper && wrapper.dataset.nodeId === node.id) {
          wrapper.remove();
        }
      });
      const launcherWrapper = document.createElement("div");
      launcherWrapper.className = "message-wrapper assistant";
      launcherWrapper.dataset.nodeId = node.id;
      launcherWrapper.innerHTML = `
      <div class="message-bubble">
        <div class="task-launcher-card" style="padding: 12px; background: rgba(37, 99, 235, 0.12); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; margin-top: 8px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <div>
              <strong style="font-size: 13px; color: #60a5fa;">\u{1F3AF} Practical Task Challenge</strong>
              <div style="font-size: 12px; color: rgba(255,255,255,0.7); margin-top: 2px;">Test your understanding on "${node.title}" with runtime evaluation.</div>
            </div>
            <button id="launch-task-btn-${node.id}" style="padding: 6px 12px; background: #2563eb; color: #fff; border: none; border-radius: 8px; font-weight: 600; font-size: 12px; cursor: pointer;">
              Launch Challenge
            </button>
          </div>
        </div>
      </div>
    `;
      chatHistory.appendChild(launcherWrapper);
      chatHistory.scrollTop = chatHistory.scrollHeight;
      document.getElementById(`launch-task-btn-${node.id}`)?.addEventListener("click", async () => {
        try {
          const res = await fetch(`/api/sessions/${sessionId}/nodes/${node.id}/task-simulation`, { method: "POST" });
          if (!res.ok) return;
          const { task } = await res.json();
          taskSandbox.render(task, async (submission) => {
            const evalRes = await fetch(`/api/sessions/${sessionId}/nodes/${node.id}/evaluate-task`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ submission, taskSpec: task })
            });
            if (evalRes.ok) {
              const data = await evalRes.json();
              taskSandbox.showFeedback(
                data.evaluation.score,
                data.evaluation.passed,
                data.evaluation.feedback,
                data.evaluation.detectedMisconceptions
              );
              if (data.nodes) {
                nodes = data.nodes;
                canvas.render(nodes);
                updateStats();
              }
            }
          });
        } catch (err) {
          console.error("Error launching task simulation:", err);
        }
      });
    }
    exitNodeBtn?.addEventListener("click", () => {
      currentNodeOpenRequestId++;
      activeNodeId = null;
      if (sidebarNodeTitle) sidebarNodeTitle.textContent = "Learning Session";
      if (sidebarNodeStatus) {
        sidebarNodeStatus.textContent = "DIAGNOSIS";
      }
      if (exitNodeBtn) exitNodeBtn.style.display = "none";
      if (chatHistory) chatHistory.innerHTML = "";
      loadGlobalChat();
    });
    async function loadGlobalChat() {
      try {
        const response = await fetch(`/api/sessions/${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.messages && data.messages.length > 0) {
            data.messages.forEach((msg) => {
              if (!msg.node_id) appendMessage(msg.sender, msg.content);
            });
          }
        }
      } catch (err) {
        console.error("Error reloading global chat:", err);
      }
    }
    sendChatBtn?.addEventListener("click", sendMessage);
    chatInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    async function sendMessage() {
      const text = chatInput ? chatInput.value.trim() : "";
      if (!text) return;
      if (chatInput) {
        chatInput.value = "";
        chatInput.style.height = "auto";
      }
      appendMessage("user", text, activeNodeId);
      const thinkingWrapper = appendMessage("assistant", '<div class="thinking-dots"><span></span><span></span><span></span></div>', activeNodeId);
      try {
        if (activeNodeId) {
          if (!sessionId) throw new Error("Session ID is missing");
          const response = await fetch(`/api/sessions/${sessionId}/nodes/${activeNodeId}/message`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ answer: text, text, content: text, message: text })
          });
          if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            throw new Error(errBody.error || errBody.message || "Failed to send node message");
          }
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            thinkingWrapper.remove();
            const replyText = data.feedback || data.response || data.content || "Response received.";
            const replyWrapper = appendMessage("assistant", "", activeNodeId);
            await animateTextReveal(
              replyWrapper.querySelector(".message-bubble"),
              replyText,
              currentNodeOpenRequestId,
              activeNodeId
            );
            if (data.nodesUpdated && data.nodes) {
              nodes = data.nodes;
              canvas.render(nodes);
              updateStats();
            }
            if (data.calibration && headerCalibration) {
              calibration = data.calibration.level || data.calibration;
              headerCalibration.textContent = calibration;
            }
          } else {
            const reader = response.body?.getReader();
            if (!reader) throw new Error("Response body reader not available");
            const decoder = new TextDecoder("utf-8");
            let streamedContent = "";
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              streamedContent += decoder.decode(value, { stream: true });
            }
            thinkingWrapper.remove();
            const streamReplyWrapper = appendMessage("assistant", "", activeNodeId);
            await animateTextReveal(
              streamReplyWrapper.querySelector(".message-bubble"),
              streamedContent,
              currentNodeOpenRequestId,
              activeNodeId
            );
          }
        } else {
          activateSplitScreen();
          if (nodes.length === 0) {
            canvas.showThinking("DiagnosisAgent", "Processing your response...");
          }
          let finalData = null;
          await readSseStream(`/api/sessions/${sessionId}/diagnose?stream=true`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
          }, (event, data) => {
            if (event === "agent_progress") {
              if (data.status === "error") {
                canvas.showThinkingError(data.agent, data.thought || "Stage delayed \u2014 retrying...");
              } else {
                canvas.showThinking(data.agent, data.thought || "Processing stage...");
              }
              if (data.payload?.nodes) {
                nodes = data.payload.nodes;
                canvas.render(nodes, true);
                updateStats();
              }
            } else if (event === "pipeline_complete") {
              finalData = data;
            }
          });
          if (!finalData) throw new Error("Diagnosis stream ended unexpectedly.");
          thinkingWrapper.remove();
          if (finalData.status === "generation_failed") {
            const errMsg = finalData.error || finalData.response || "AI service rate limit / API quota exceeded \u2014 please wait a moment or check your API key and try again.";
            canvas.showThinkingError("AI Assistant", errMsg);
            appendMessage("assistant", `\u26A0\uFE0F ${errMsg}`);
            return;
          }
          if (finalData.response) {
            const diagReplyWrapper = appendMessage("assistant", "");
            await animateTextReveal(
              diagReplyWrapper.querySelector(".message-bubble"),
              finalData.response
            );
          }
          if (finalData.title) {
            if (canvasSessionTitle) canvasSessionTitle.textContent = finalData.title;
            loadNavigationHistory();
          }
          if (finalData.status === "learning" || finalData.nodes && finalData.nodes.length > 0) {
            nodes = finalData.nodes;
            canvas.render(nodes, true);
            updateStats();
            canvas.hideThinking("\u2713 Curriculum Verified against Domain Rubrics");
            appendMessage("assistant", "\u{1F389} Your personalized learning tree has been built! Click on the first unlocked node on the right to start learning.");
          } else {
            canvas.hideThinking();
          }
        }
      } catch (err) {
        console.error(err);
        thinkingWrapper.remove();
        const rawMsg = err.message || "";
        const cleanMsg = rawMsg.includes("429") || rawMsg.includes("Quota exceeded") || rawMsg.includes("503") ? "AI service rate limit / API quota exceeded \u2014 please wait a moment or check your API key and try again." : `Sorry, something went wrong: ${err.message}`;
        canvas.showThinkingError("AI Assistant", cleanMsg);
        appendMessage("assistant", `\u26A0\uFE0F ${cleanMsg}`);
      }
    }
    function updateStats() {
      const completedCount = nodes.filter((n) => n.status === "completed").length;
      if (canvasSessionStats) {
        canvasSessionStats.textContent = `${completedCount} of ${nodes.length} Nodes Completed`;
      }
      const masteryPath = document.getElementById("header-mastery-progress-path");
      const masteryText = document.getElementById("header-mastery-text");
      const masteryWrapper = document.querySelector(".mastery-ring-wrapper");
      if (!nodes || nodes.length === 0) {
        if (masteryPath) masteryPath.setAttribute("stroke-dasharray", "0, 100");
        if (masteryText) masteryText.textContent = "0%";
        return;
      }
      const percent = Math.round(completedCount / nodes.length * 100);
      if (masteryPath) masteryPath.setAttribute("stroke-dasharray", `${percent}, 100`);
      if (masteryText) masteryText.textContent = `${percent}%`;
      if (masteryWrapper) masteryWrapper.setAttribute("aria-label", `Mastery Rate ${percent}%`);
    }
  });
})();
//# sourceMappingURL=app.js.map
