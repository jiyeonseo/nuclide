/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type DebuggerModel from './DebuggerModel';
import type {
  WatchExpressionListStore,
} from './WatchExpressionListStore';
import type {
  ControlButtonSpecification,
  DebuggerModeType,
} from './types';

import {CompositeDisposable} from 'atom';
import {
  React,
} from 'react-for-atom';
import {Section} from '../../nuclide-ui/Section';
import {bindObservableAsProps} from '../../nuclide-ui/bindObservableAsProps';
import {WatchExpressionComponent} from './WatchExpressionComponent';
import {ScopesComponent} from './ScopesComponent';
import {BreakpointListComponent} from './BreakpointListComponent';
import {DebuggerSteppingComponent} from './DebuggerSteppingComponent';
import {DebuggerCallstackComponent} from './DebuggerCallstackComponent';
import {DebuggerThreadsComponent} from './DebuggerThreadsComponent';

type Props = {
  model: DebuggerModel,
  watchExpressionListStore: WatchExpressionListStore,
};

export class NewDebuggerView extends React.Component {
  props: Props;
  state: {
    allowSingleThreadStepping: boolean,
    togglePauseOnException: boolean,
    togglePauseOnCaughtException: boolean,
    enableSingleThreadStepping: boolean,
    debuggerMode: DebuggerModeType,
    showThreadsWindow: boolean,
    customControlButtons: Array<ControlButtonSpecification>,
  };
  _watchExpressionComponentWrapped: ReactClass<any>;
  _scopesComponentWrapped: ReactClass<any>;
  _disposables: CompositeDisposable;

  constructor(props: Props) {
    super(props);
    this._watchExpressionComponentWrapped = bindObservableAsProps(
      props.model.getWatchExpressionListStore().getWatchExpressions().map(
        watchExpressions => ({watchExpressions}),
      ),
      WatchExpressionComponent,
    );
    this._scopesComponentWrapped = bindObservableAsProps(
      props.model.getScopesStore().getScopes().map(
        scopes => ({scopes}),
      ),
      ScopesComponent,
    );
    this._disposables = new CompositeDisposable();
    const debuggerStore = props.model.getStore();
    this.state = {
      allowSingleThreadStepping: Boolean(debuggerStore.getSettings().get('SingleThreadStepping')),
      debuggerMode: debuggerStore.getDebuggerMode(),
      togglePauseOnException: debuggerStore.getTogglePauseOnException(),
      togglePauseOnCaughtException: debuggerStore.getTogglePauseOnCaughtException(),
      enableSingleThreadStepping: debuggerStore.getEnableSingleThreadStepping(),
      showThreadsWindow: Boolean(debuggerStore.getSettings().get('SupportThreadsWindow')),
      customControlButtons: debuggerStore.getCustomControlButtons(),
    };
  }

  componentDidMount(): void {
    const debuggerStore = this.props.model.getStore();
    this._disposables.add(
      debuggerStore.onChange(() => {
        this.setState({
          // We need to refetch some values that we already got in the constructor
          // since these values weren't necessarily properly intialized until now.
          allowSingleThreadStepping: Boolean(debuggerStore.getSettings()
            .get('SingleThreadStepping')),
          debuggerMode: debuggerStore.getDebuggerMode(),
          togglePauseOnException: debuggerStore.getTogglePauseOnException(),
          togglePauseOnCaughtException: debuggerStore.getTogglePauseOnCaughtException(),
          enableSingleThreadStepping: debuggerStore.getEnableSingleThreadStepping(),
          showThreadsWindow: Boolean(debuggerStore.getSettings()
            .get('SupportThreadsWindow')),
          customControlButtons: debuggerStore.getCustomControlButtons(),
        });
      }),
    );
  }

  componentWillUnmount(): void {
    this._dispose();
  }

  render(): React.Element<any> {
    const {
      model,
    } = this.props;
    const actions = model.getActions();
    const WatchExpressionComponentWrapped = this._watchExpressionComponentWrapped;
    const ScopesComponentWrapped = this._scopesComponentWrapped;
    const threadsSection = this.state.showThreadsWindow
      ? <Section collapsable={true} headline="Threads"
                 className="nuclide-debugger-section-header">
          <div className="nuclide-debugger-section-content">
            <DebuggerThreadsComponent
              bridge={this.props.model.getBridge()}
              threadStore={model.getThreadStore()}
            />
          </div>
        </Section>
      : null;
    return (
      <div className="nuclide-debugger-container-new">
        <Section collapsable={true} headline="Debugger Controls"
                 className="nuclide-debugger-section-header">
          <div className="nuclide-debugger-section-content">
            <DebuggerSteppingComponent
              actions={actions}
              debuggerMode={this.state.debuggerMode}
              pauseOnException={this.state.togglePauseOnException}
              pauseOnCaughtException={this.state.togglePauseOnCaughtException}
              allowSingleThreadStepping={this.state.allowSingleThreadStepping}
              singleThreadStepping={this.state.enableSingleThreadStepping}
              customControlButtons={this.state.customControlButtons}
            />
          </div>
        </Section>
        {threadsSection}
        <Section collapsable={true} headline="Call Stack"
                 className="nuclide-debugger-section-header">
          <div className="nuclide-debugger-section-content">
            <DebuggerCallstackComponent
              actions={actions}
              bridge={model.getBridge()}
              callstackStore={model.getCallstackStore()}
            />
          </div>
        </Section>
        <Section collapsable={true} headline="Breakpoints"
                 className="nuclide-debugger-section-header">
          <div className="nuclide-debugger-section-content">
            <BreakpointListComponent
              actions={actions}
              breakpointStore={model.getBreakpointStore()}
            />
          </div>
        </Section>
        <Section collapsable={true} headline="Scopes"
                 className="nuclide-debugger-section-header">
          <div className="nuclide-debugger-section-content">
            <ScopesComponentWrapped
              watchExpressionStore={model.getWatchExpressionStore()}
            />
          </div>
        </Section>
        <Section collapsable={true} headline="Watch Expressions"
                 className="nuclide-debugger-section-header">
          <div className="nuclide-debugger-section-content">
            <WatchExpressionComponentWrapped
              onAddWatchExpression={actions.addWatchExpression.bind(model)}
              onRemoveWatchExpression={actions.removeWatchExpression.bind(model)}
              onUpdateWatchExpression={actions.updateWatchExpression.bind(model)}
              watchExpressionStore={model.getWatchExpressionStore()}
            />
          </div>
        </Section>
      </div>
    );
  }

  _dispose(): void {
    this._disposables.dispose();
  }
}
