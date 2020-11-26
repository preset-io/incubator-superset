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
import {
  SELECT_FILTER_OPTION,
  AnyFilterAction,
  SET_FILTER_CONFIG_COMPLETE,
  RESET_ALL_FILTERS,
} from '../actions/nativeFilters';
import {
  FilterConfiguration,
  FilterState,
  NativeFiltersState,
} from '../components/nativeFilters/types';

export function getInitialFilterState(
  id: string,
  defaultValue: any,
): FilterState {
  return {
    id,
    optionsStatus: 'loading',
    isDirty: false, // TODO set this to true when appropriate
    options: null,
    selectedValues: defaultValue,
  };
}

export function getInitialState(
  filterConfig: FilterConfiguration,
): NativeFiltersState {
  const filters = {};
  const filtersState = {};
  const state = { filters, filtersState };
  filterConfig.forEach(filter => {
    const { id } = filter;
    filters[id] = filter;
    filtersState[id] = getInitialFilterState(id, filter.defaultValue);
  });
  return state;
}

export const resetFiltersState = (state: NativeFiltersState) =>
  Object.entries(state.filters).reduce(
    (acc, [filterId, filterData]) => ({
      ...acc,
      [filterId]: {
        ...state.filtersState[filterId],
        selectedValues: filterData.defaultValue,
      },
    }),
    {},
  );

export default function nativeFilterReducer(
  state: NativeFiltersState = { filters: {}, filtersState: {} },
  action: AnyFilterAction,
) {
  const { filters, filtersState } = state;
  switch (action.type) {
    case SELECT_FILTER_OPTION:
      return {
        filters,
        filtersState: {
          ...filtersState,
          [action.filterId]: {
            ...filtersState[action.filterId],
            selectedValues: action.selectedValues,
          },
        },
      };

    case SET_FILTER_CONFIG_COMPLETE:
      return getInitialState(action.filterConfig);

    case RESET_ALL_FILTERS:
      return {
        ...state,
        filtersState: resetFiltersState(state),
      };

    // TODO handle SET_FILTER_CONFIG_FAIL action
    default:
      return state;
  }
}
