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
} from '../actions/nativeFilters';
import {
  FilterConfiguration,
  FilterState,
} from '../components/nativeFilters/types';

export type State = {
  [filterId: string]: FilterState;
};

export function getInitialFilterState(id: string): FilterState {
  return {
    id,
    optionsStatus: 'loading',
    isDirty: false, // TODO set this to true when appropriate
    options: null,
    selectedValues: null,
  };
}

export function getInitialState(filterConfig: FilterConfiguration): State {
  const filters = {};
  filterConfig.forEach(filter => {
    filters[filter.id] = getInitialFilterState(filter.id);
  });
  return filters;
}

export default function nativeFilterReducer(
  filters: State = {},
  action: AnyFilterAction,
) {
  switch (action.type) {
    case SELECT_FILTER_OPTION:
      return {
        ...filters,
        [action.filterId]: {
          ...filters[action.filterId],
          selectedValues: action.selectedValues,
        },
      };

    case SET_FILTER_CONFIG_COMPLETE:
      return getInitialState(action.filterConfig);
    // TODO handle SET_FILTER_CONFIG_FAIL action
    default:
      return filters;
  }
}
