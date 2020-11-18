/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import componentTypes from 'src/dashboard/util/componentTypes';

export enum Scoping {
  all,
  specific,
}

type DefaultValue = string[] | number[] | object | string | null;

export type NativeFiltersForm = {
  scoping: Scoping;
  name: string;
  dataset: {
    value: number;
  };
  isInstant: boolean;
  column: {
    value: Column;
  };
  defaultValue: DefaultValue;
};

export interface Column {
  name: string;
  displayName?: string;
}

export interface Scope {
  rootPath: string[];
  excluded: number[];
}

export type AntCallback = (value: string | number) => void;

/** The target of a filter is the datasource/column being filtered */
export interface Target {
  datasetId: number;
  column: Column;

  // maybe someday support this?
  // show values from these columns in the filter options selector
  // clarityColumns?: Column[];
}

export enum FilterType {
  text = 'text',
  timeRange = 'timeRange',
}

/**
 * This is a filter configuration object, stored in the dashboard's json metadata.
 * The values here do not reflect the current state of the filter.
 */
export interface Filter {
  id: string; // randomly generated at filter creation
  name: string;
  type: FilterType;
  // for now there will only ever be one target
  // when multiple targets are supported, change this to Target[]
  targets: [Target];
  defaultValue: DefaultValue;
  scope: Scope;
  isInstant: boolean;
}

/** Current state of the filter, stored in `nativeFilters` in redux */
export type FilterState = {
  id: string; // ties this filter state to the config object
  optionsStatus: 'loading' | 'success' | 'fail';
  options: string[] | null;
  selectedValues: string[] | null;
  /**
   * If the config changes, the current options/values may no longer be valid.
   * isDirty indicates that state.
   */
  isDirty: boolean;
};

/** Chart state of redux */
export type Chart = {
  id: number;
  slice_id: 2107;
  formData: {
    viz_type: string;
  };
};

/** Root state of redux */
export type RootState = {
  charts: { [key: string]: Chart };
  dashboardLayout: { present: { [key: string]: LayoutItem } };
  dashboardFilters: {};
};

/** State of dashboardLayout in redux */
export type Layout = { [key: string]: LayoutItem };

/** State of charts in redux */
export type Charts = { [key: number]: Chart };

type ComponentTypesKeys = keyof typeof componentTypes;
export type ComponentType = typeof componentTypes[ComponentTypesKeys];

/** State of dashboardLayout item in redux */
export type LayoutItem = {
  children: string[];
  parents: string[];
  type: ComponentType;
  id: string;
  meta: {
    chartId: number;
    height: number;
    sliceName?: string;
    text?: string;
    uuid: string;
    width: number;
  };
};

/** UI Ant tree type */
export type TreeItem = {
  children: TreeItem[];
  key: string;
  title: string;
};
