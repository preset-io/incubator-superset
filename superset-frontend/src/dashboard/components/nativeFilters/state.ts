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
import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectFilterOption } from 'src/dashboard/actions/nativeFilters';
import { getInitialFilterState } from 'src/dashboard/reducers/nativeFilters';
import { t } from '@superset-ui/core';
import { Filter, FilterState, TreeItem } from './types';
import { DASHBOARD_ROOT_ID } from '../../util/constants';
import { DASHBOARD_ROOT_TYPE } from '../../util/componentTypes';
import { buildTree } from './utils';
import { Charts, Layout, RootState } from '../../reducers/types';

export function useFilterConfigurations() {
  return useSelector<any, Filter[]>(
    state => state.dashboardInfo.metadata.filter_configuration || [],
  );
}

export function useFilterState(id: string) {
  return useSelector<any, FilterState>(
    state => state.nativeFilters[id] || getInitialFilterState(id),
  );
}

export function useFilterSetter(id: string) {
  const dispatch = useDispatch();
  return useCallback(
    (values: string | string[] | null) =>
      dispatch(selectFilterOption(id, values)),
    [id, dispatch],
  );
}

const tree = {
  children: [],
  key: DASHBOARD_ROOT_ID,
  type: DASHBOARD_ROOT_TYPE,
  title: t('All Panels'),
};

export function useFilterScopeTree(): {
  treeData: [TreeItem];
  layout: Layout;
} {
  const layout = useSelector<RootState, Layout>(
    ({ dashboardLayout: { present } }) => present,
  );

  const charts = useSelector<RootState, Charts>(({ charts }) => charts);

  useMemo(() => {
    buildTree(layout[DASHBOARD_ROOT_ID], tree, layout, charts);
  }, [charts, layout]);
  return { treeData: [tree], layout };
}
