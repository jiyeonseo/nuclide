"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createStore;

function _reduxMin() {
  const data = require("redux/dist/redux.min.js");

  _reduxMin = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _reduxObservable() {
  const data = require("../../../../modules/nuclide-commons/redux-observable");

  _reduxObservable = function () {
    return data;
  };

  return data;
}

function Epics() {
  const data = _interopRequireWildcard(require("./Epics"));

  Epics = function () {
    return data;
  };

  return data;
}

function _Reducers() {
  const data = _interopRequireDefault(require("./Reducers"));

  _Reducers = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
function createStore() {
  const epics = Object.keys(Epics()).map(k => Epics()[k]).filter(epic => typeof epic === 'function');

  const rootEpic = (actions, store) => (0, _reduxObservable().combineEpics)(...epics)(actions, store).catch((err, stream) => {
    (0, _log4js().getLogger)('nuclide-file-tree').error(err);
    return stream;
  });

  return (0, _reduxMin().createStore)(_Reducers().default, null, (0, _reduxMin().applyMiddleware)((0, _reduxObservable().createEpicMiddleware)(rootEpic)));
}