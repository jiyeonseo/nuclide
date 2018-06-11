/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {
  NuclideDebuggerProvider,
  DebuggerConfigurationProvider,
} from 'nuclide-debugger-common/types';

import createPackage from 'nuclide-commons-atom/createPackage';
import {getNativeAutoGenConfig} from 'nuclide-debugger-common/autogen-utils';
import {VsAdapterTypes} from 'nuclide-debugger-common/constants';
import {AutoGenLaunchAttachProvider} from 'nuclide-debugger-common/AutoGenLaunchAttachProvider';
import {resolveConfiguration} from './utils';

class Activation {
  constructor() {}
  dispose() {}

  createDebuggerProvider(): NuclideDebuggerProvider {
    return {
      type: VsAdapterTypes.NATIVE_GDB,
      getLaunchAttachProvider: connection => {
        return new AutoGenLaunchAttachProvider(
          'Native - GDB (C/C++)',
          connection,
          getNativeAutoGenConfig(VsAdapterTypes.NATIVE_GDB),
          async () => {
            // GDB not available on Win32.
            return Promise.resolve(process.platform !== 'win32');
          },
        );
      },
    };
  }

  createDebuggerConfigurator(): DebuggerConfigurationProvider {
    return {
      resolveConfiguration,
      adapterType: VsAdapterTypes.NATIVE_GDB,
    };
  }
}

createPackage(module.exports, Activation);
