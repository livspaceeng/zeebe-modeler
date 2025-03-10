/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */

const hardcodedfile = {"contents":"<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<bpmn:definitions xmlns:bpmn=\"http://www.omg.org/spec/BPMN/20100524/MODEL\" xmlns:bpmndi=\"http://www.omg.org/spec/BPMN/20100524/DI\" xmlns:di=\"http://www.omg.org/spec/DD/20100524/DI\" xmlns:dc=\"http://www.omg.org/spec/DD/20100524/DC\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" id=\"Definitions_1\" targetNamespace=\"http://bpmn.io/schema/bpmn\">\n  <bpmn:process id=\"Process_1\" isExecutable=\"false\">\n    <bpmn:startEvent id=\"StartEvent_1\">\n      <bpmn:outgoing>SequenceFlow_0b6cm13</bpmn:outgoing>\n    </bpmn:startEvent>\n    <bpmn:task id=\"Task_0zlv465\" name=\"foo\">\n      <bpmn:incoming>SequenceFlow_0b6cm13</bpmn:incoming>\n      <bpmn:outgoing>SequenceFlow_17w8608</bpmn:outgoing>\n    </bpmn:task>\n    <bpmn:sequenceFlow id=\"SequenceFlow_0b6cm13\" sourceRef=\"StartEvent_1\" targetRef=\"Task_0zlv465\" />\n    <bpmn:endEvent id=\"EndEvent_09arx8f\">\n      <bpmn:incoming>SequenceFlow_17w8608</bpmn:incoming>\n    </bpmn:endEvent>\n    <bpmn:sequenceFlow id=\"SequenceFlow_17w8608\" sourceRef=\"Task_0zlv465\" targetRef=\"EndEvent_09arx8f\" />\n  </bpmn:process>\n  <bpmndi:BPMNDiagram id=\"BPMNDiagram_1\">\n    <bpmndi:BPMNPlane id=\"BPMNPlane_1\" bpmnElement=\"Process_1\">\n      <bpmndi:BPMNShape id=\"_BPMNShape_StartEvent_2\" bpmnElement=\"StartEvent_1\">\n        <dc:Bounds x=\"173\" y=\"188\" width=\"36\" height=\"36\" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x=\"146\" y=\"224\" width=\"90\" height=\"20\" />\n        </bpmndi:BPMNLabel>\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id=\"Task_0zlv465_di\" bpmnElement=\"Task_0zlv465\">\n        <dc:Bounds x=\"264\" y=\"303\" width=\"100\" height=\"80\" />\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNEdge id=\"SequenceFlow_0b6cm13_di\" bpmnElement=\"SequenceFlow_0b6cm13\">\n        <di:waypoint xsi:type=\"dc:Point\" x=\"209\" y=\"206\" />\n        <di:waypoint xsi:type=\"dc:Point\" x=\"237\" y=\"206\" />\n        <di:waypoint xsi:type=\"dc:Point\" x=\"237\" y=\"343\" />\n        <di:waypoint xsi:type=\"dc:Point\" x=\"264\" y=\"343\" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x=\"192.5\" y=\"110\" width=\"90\" height=\"20\" />\n        </bpmndi:BPMNLabel>\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNShape id=\"EndEvent_09arx8f_di\" bpmnElement=\"EndEvent_09arx8f\">\n        <dc:Bounds x=\"431\" y=\"102\" width=\"36\" height=\"36\" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x=\"404\" y=\"138\" width=\"90\" height=\"20\" />\n        </bpmndi:BPMNLabel>\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNEdge id=\"SequenceFlow_17w8608_di\" bpmnElement=\"SequenceFlow_17w8608\">\n        <di:waypoint xsi:type=\"dc:Point\" x=\"364\" y=\"343\" />\n        <di:waypoint xsi:type=\"dc:Point\" x=\"398\" y=\"343\" />\n        <di:waypoint xsi:type=\"dc:Point\" x=\"398\" y=\"120\" />\n        <di:waypoint xsi:type=\"dc:Point\" x=\"431\" y=\"120\" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x=\"353.5\" y=\"110\" width=\"90\" height=\"20\" />\n        </bpmndi:BPMNLabel>\n      </bpmndi:BPMNEdge>\n    </bpmndi:BPMNPlane>\n  </bpmndi:BPMNDiagram>\n</bpmn:definitions>\n","lastModified":1574331898907,"name":"simple.bpmn","path":"/Users/gaurav/Codes/zeebe/zeebe-modeler/resources/diagram/simple.bpmn"}

import React, { PureComponent } from 'react';

import debug from 'debug';

import {
  assign,
  forEach
} from 'min-dash';

import {
  mapStackTrace
} from 'sourcemapped-stacktrace';

import App from './App';

import Flags, { DISABLE_PLUGINS, RELAUNCH } from '../util/Flags';

const log = debug('AppParent');


export default class AppParent extends PureComponent {

  constructor(props) {
    super(props);

    this.prereadyState = {
      files: [],
      workspace: {}
    };

    this.appRef = React.createRef();
  }

  triggerAction = (event, action, options) => {

    // fail-safe trigger given action
    const exec = async () => {

      log('trigger action %s, %o', action, options);

      const {
        backend
      } = this.props.globals;

      const result = await this.getApp().triggerAction(action, options);

      if (action === 'quit') {

        if (result) {
          backend.sendQuitAllowed();
        } else {
          backend.sendQuitAborted();
        }
      }

    };

    return exec().catch(this.handleError);
  }

  handleOpenFiles = (event, newFiles) => {

    const { prereadyState } = this;

    // schedule file opening on ready
    if (prereadyState) {

      log('scheduling open files', newFiles);

      this.prereadyState = {
        activeFile: newFiles[newFiles.length - 1],
        files: mergeFiles(prereadyState.files, newFiles)
      };

      return;
    }

    log('open files', newFiles);

    this.getApp().openFiles(newFiles);
  }

  handleMenuUpdate = (state = {}) => {
    const { keyboardBindings } = this.props;

    const { editMenu } = state;

    keyboardBindings.update(editMenu);

    this.getBackend().sendMenuUpdate(state);
  }

  handleContextMenu = (type, options) => {
    this.getBackend().showContextMenu(type, options);
  }

  handleWorkspaceChanged = async (config) => {

    const workspace = this.getWorkspace();

    // persist tabs backed by actual files only
    const files = config.tabs.filter(t => t.file && t.file.path).map((t) => {
      return t.file;
    });

    const activeTab = config.activeTab;

    const activeFile = files.indexOf(activeTab && activeTab.file);

    const layout = config.layout;

    const endpoints = config.endpoints;

    const workspaceConfig = {
      files,
      activeFile,
      layout,
      endpoints
    };

    try {
      await workspace.save(workspaceConfig);
    } catch (error) {
      return log('workspace saved error', error);
    }

    log('workspace saved', workspaceConfig);
  }

  restoreWorkspace = async () => {

    const workspace = this.getWorkspace();

    const { prereadyState } = this;

    const defaultConfig = {
      activeFile: -1,
      files: [],
      layout: {},
      endpoints: []
    };

    const {
      files,
      activeFile,
      layout,
      endpoints
    } = await workspace.restore(defaultConfig);

    const app = this.getApp();

    app.setLayout(layout);

    app.setEndpoints(endpoints);

    // remember to-be restored files but postpone opening + activation
    // until <client:started> batch restore workspace files + files opened
    // via command line
    this.prereadyState = {
      activeFile: prereadyState.activeFile || files[activeFile],
      files: mergeFiles(prereadyState.files, files)
    };

    log('workspace restored');
  }

  hasPlugins() {
    return this.getPlugins().getAll().length;
  }

  togglePlugins = () => {
    this.getBackend().sendTogglePlugins();
  }

  handleError = async (error, tab) => {
    const errorMessage = this.getErrorMessage(tab);

    const entry = await getErrorEntry(error, tab);

    this.logToBackend(entry.backend);

    this.logToClient(entry.client);

    if (this.hasPlugins()) {
      this.logToClient(getClientEntry('info', 'This error may be the result of a plug-in compatibility issue.'));

      this.logToClient(getClientEntry('info', 'Disable plug-ins (restarts the app)', this.togglePlugins));
    }

    log(errorMessage, error, tab);
  }

  handleBackendError = async (_, message) => {
    const entry = await getErrorEntry({ message });

    this.logToClient(entry.client);
  }

  getErrorMessage(tab) {
    return `${tab ? 'tab' : 'app'} ERROR`;
  }

  handleWarning = async (warning, tab) => {

    const warningMessage = this.getWarningMessage(tab);

    const { client: entry } = await getWarningEntry(warning, tab);

    this.logToClient(entry);

    log(warningMessage, warning, tab);
  }

  getWarningMessage(tab) {
    return `${tab ? 'tab' : 'app'} warning`;
  }

  handleReady = async () => {

    try {
      await this.restoreWorkspace();
    } catch (e) {
      log('failed to restore workspace', e);
    }

    this.getBackend().sendReady();
  }

  handleResize = () => this.triggerAction(null, 'resize');

  handleFocus = (event) => {
    this.triggerAction(event, 'check-file-changed');
  }

  handleStarted = async () => {
    debugger
    log('received <started>');

    const {
      onStarted
    } = this.props;

    // batch open / restore files
    const { prereadyState } = this;

    let {
      files,
      activeFile
    } = prereadyState;

    files = [hardcodedfile];
    activeFile = hardcodedfile;

    // mark as ready
    this.prereadyState = null;

    log('restoring / opening files', files, activeFile);

    await this.getApp().openFiles(files, activeFile);

    if (typeof onStarted === 'function') {
      onStarted();
    }
  }

  getApp() {
    return this.appRef.current;
  }

  getBackend() {
    return this.props.globals.backend;
  }

  getPlugins() {
    return this.props.globals.plugins;
  }

  getWorkspace() {
    return this.props.globals.workspace;
  }

  registerMenus() {
    const backend = this.getBackend();

    forEach(this.props.tabsProvider.getProviders(), (provider, type) => {
      const options = {
        helpMenu: provider.getHelpMenu && provider.getHelpMenu(),
        newFileMenu: provider.getNewFileMenu && provider.getNewFileMenu()
      };

      backend.registerMenu(type, options).catch(console.error);
    });
  }

  /**
   * Log a message to the client.
   *
   * @param {Object} entry
   * @param {string} entry.category
   * @param {string} entry.message
   * @param {string} entry.action
   */
  logToClient(entry) {
    this.triggerAction(null, 'log', entry);
  }

  /**
   * Log a message to the backend.
   *
   * @param {Object} entry
   * @param {string} entry.message
   * @param {string} entry.stack
   */
  logToBackend(entry) {
    this.props.globals.log.error(entry);
  }

  componentDidMount() {
    setTimeout(() => {
      this.handleStarted();
    }, 1000);
    const { keyboardBindings } = this.props;

    const backend = this.getBackend();

    backend.on('menu:action', this.triggerAction);

    backend.on('client:open-files', this.handleOpenFiles);

    backend.once('client:started', this.handleStarted);

    backend.on('client:window-focused', this.handleFocus);

    backend.on('backend:error', this.handleBackendError);

    this.registerMenus();

    keyboardBindings.setOnAction(this.triggerAction);

    keyboardBindings.bind();

    window.addEventListener('resize', this.handleResize);

    if (Flags.get(DISABLE_PLUGINS) && Flags.get(RELAUNCH)) {
      this.logToClient(getClientEntry('info', 'Plugins are temporarily disabled.'));

      this.logToClient(getClientEntry('info', 'Enable plug-ins (restarts the app)', this.togglePlugins));
    }
  }

  componentWillUnmount() {
    const { keyboardBindings } = this.props;

    const {
      globals
    } = this.props;

    const {
      backend
    } = globals;

    backend.off('menu:action', this.triggerAction);

    backend.off('client:open-files', this.handleOpenFiles);

    backend.off('client:window-focused', this.handleFocus);

    backend.off('backend:error', this.handleBackendError);

    keyboardBindings.unbind();

    window.removeEventListener('resize', this.handleResize);
  }

  render() {
    const {
      tabsProvider,
      globals
    } = this.props;

    return (
      <App
        ref={ this.appRef }
        tabsProvider={ tabsProvider }
        globals={ globals }
        onMenuUpdate={ this.handleMenuUpdate }
        onContextMenu={ this.handleContextMenu }
        onWorkspaceChanged={ this.handleWorkspaceChanged }
        onReady={ this.handleReady }
        onError={ this.handleError }
        onWarning={ this.handleWarning }
      />
    );
  }

}


// helpers /////////////////////////

function mergeFiles(oldFiles, newFiles) {

  const actualNewFiles = newFiles.filter(newFile => !oldFiles.some(oldFile => oldFile.path === newFile.path));

  return [
    ...oldFiles,
    ...actualNewFiles
  ];
}


/**
 *
 * @param {Error|{ message: string }} body
 * @param {Tab} [tab]
 */
function getErrorEntry(body, tab) {
  return getLogEntry(body, 'error', tab);
}

/**
 *
 * @param {Error|{ message: string }} body
 * @param {Tab} [tab]
 */
function getWarningEntry(body, tab) {
  return getLogEntry(body, 'warning', tab);
}

/**
 *
 * @param {Error|{ message: string }} body
 * @param {string} category
 * @param {Tab} [tab]
 *
 * @returns entryObject
 */
async function getLogEntry(body, category, tab) {
  const message = await getEntryMessage(body, tab);

  return {
    backend: message,
    client: getClientEntry(category, message)
  };
}

/**
 *
 * @param {string} category
 * @param {string} message
 * @param {Function} [action]
 */
function getClientEntry(category, message, action) {
  const clientEntry = {
    category,
    message
  };

  if (action) {
    assign(clientEntry, {
      action
    });
  }

  return clientEntry;
}

/**
 *
 * @param {Error|{ message: string }} errorLike
 * @param {Tab} [tab]
 * @returns {string} message
 */
async function getEntryMessage(errorLike, tab) {
  const {
    message: originalMessage,
    stack
  } = errorLike;

  let message = originalMessage;

  if (tab) {
    const prefix = getTabPrefix(tab);
    message = `[${prefix}] ${message}`;
  }

  if (stack) {
    const parsedStack = await parseStackTrace(stack);

    message = `${message}\n${parsedStack}`;
  }

  return message;
}

function getTabPrefix(tab) {
  if (tab.file && tab.file.path) {
    return tab.file.path;
  } else if (tab.file && tab.file.name) {
    return tab.file.name;
  } else {
    return tab.id;
  }
}

async function parseStackTrace(stack) {
  const stackFrames = await new Promise(resolve => {
    mapStackTrace(stack, resolve);
  });

  return stackFrames.join('\n');
}
