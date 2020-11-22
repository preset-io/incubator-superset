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
import { styled, SuperChart, t } from '@superset-ui/core';
import React, { useState } from 'react';
import cx from 'classnames';
import { Form, Dropdown, Menu } from 'src/common/components';
import Button from 'src/components/Button';
import Icon from 'src/components/Icon';
import FilterConfigurationLink from './FilterConfigurationLink';
// import FilterScopeModal from 'src/dashboard/components/filterscope/FilterScopeModal';

import {
  useFilterConfiguration,
  useFilterSetter,
} from './state';
import { Filter, FilterConfiguration } from './types';
import { getChartDataRequest } from '../../../chart/chartAction';

const Bar = styled.div`
  display: none;
  flex-direction: column;
  width: 250px; // arbitrary...
  flex-grow: 1;
  background: ${({ theme }) => theme.colors.grayscale.light5};
  border-right: 1px solid ${({ theme }) => theme.colors.grayscale.light2};
  &.open {
    display: flex;
  }
`;

const CollapsedBar = styled.div`
  width: ${({ theme }) => theme.gridUnit * 6}px;
  padding-top: ${({ theme }) => theme.gridUnit * 2}px;
  background: ${({ theme }) => theme.colors.grayscale.light4};
  /* border-right: 1px solid ${({ theme }) => theme.colors.grayscale.light2}; */
  display: none;
  text-align: center;
  &.open {
    display: block;
    
  }
  svg {
    width: ${({ theme }) => theme.gridUnit * 4}px;
    height: ${({ theme }) => theme.gridUnit * 4}px;
  }
`;

const TitleArea = styled.h4`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 0;
  padding: ${({ theme }) => theme.gridUnit * 4}px;
  & > span {
    flex-grow: 1;
  }
  & :not(:first-child) {
    margin-left: ${({ theme }) => theme.gridUnit}px;
    &:hover {
      cursor: pointer;
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  padding: ${({ theme }) => theme.gridUnit * 4}px;
  padding-top: 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grayscale.light2};
  .btn {
    flex: 1 1 50%;
  }
`;

const FilterControls = styled.div`
  padding: ${({ theme }) => theme.gridUnit * 4}px;
`;

interface FilterProps {
  filter: Filter;
  filters: FilterConfiguration;
}

interface FiltersMenuProps {
  toggleSideBar: () => void;
  closeDropdown: () => void;
}

interface FiltersBarProps {
  filtersOpen: boolean;
  toggleFiltersBar: any;
}

const FilterValue: React.FC<FilterProps> = ({ filter, filters }) => {
  // THIS ONE IS BUILT TO THROW AWAY
  // this is a temporary POC implementation just to get state hooked up.
  // Please don't send this component to prod.
  const setSelectedValues = useFilterSetter(filter.id);
  const [state, setState] = useState({ data: undefined });
  const { targets } = filter;
  const [target] = targets;
  const { datasetId = 18, column = {} } = target;
  const { name: groupby } = column;
  const setter = (values: string[]): void => {
    return setSelectedValues(values, filter, filters);
  };

  const formData = {
    adhoc_filters: [],
    datasource: `${datasetId}__table`,
    extra_filters: [],
    granularity_sqla: 'ds',
    groupby: [groupby],
    label_colors: {},
    metrics: ['count'],
    multiSelect: true,
    row_limit: 10000,
    setSelectedValues: setter,
    showSearch: true,
    time_range: 'No filter',
    time_range_endpoints: ['inclusive', 'exclusive'],
    url_params: {},
    viz_type: 'filter_select',
  };

  if (!state.data)
    getChartDataRequest({
      formData,
      force: false,
      requestParams: { dashboardId: 0 },
    }).then(response => {
      setState({ data: response.result[0].data });
    });

  return (
    <Form
      onFinish={values => {
        setSelectedValues(values.value, undefined, undefined);
      }}
    >
      <Form.Item name="value">
        <SuperChart
          height={20}
          width={220}
          formData={formData}
          queryData={state}
          chartType="filter_select"
        />
      </Form.Item>
      <Button buttonSize="sm" buttonStyle="tertiary" type="submit">
        {t('Apply')}
      </Button>
    </Form>
  );
};

const FilterControl: React.FC<FilterProps> = ({ filter, filters }) => {
  const { name = '<undefined>' } = filter;
  return (
    <div>
      <h3>{name}</h3>
      <FilterValue filter={filter} filters={filters} />
    </div>
  );
};

const MenuItems: React.FC<FiltersMenuProps> = ({
  toggleSideBar,
  closeDropdown,
}) => {
  return (
    <Menu onClick={closeDropdown}>
      <Menu.Item>Configure Filters</Menu.Item>
      <Menu.Item>
        <FilterConfigurationLink createNewOnOpen>
          {t('New Filter')}
        </FilterConfigurationLink>
      </Menu.Item>
      {/* <Menu.Item>
          <FilterScopeModal
            triggerNode={t('Bulk Scoping')}
          />
        </Menu.Item> */}
      <Menu.Item>
        <div onClick={toggleSideBar}>Collapse</div>
      </Menu.Item>
    </Menu>
  );
};

const FilterBar: React.FC<FiltersBarProps> = ({
  filtersOpen,
  toggleFiltersBar,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const filterConfigs = useFilterConfiguration();
  console.log(filterConfigs);

  const handleVisibleChange = (flag: boolean) => {
    setDropdownOpen(flag);
    // this.setState({ visible: flag });
  };

  return (
    <>
      <CollapsedBar
        className={cx({ open: !filtersOpen })}
        onClick={toggleFiltersBar}
      >
        <Icon name="filter" />
        <Icon name="collapse" />
      </CollapsedBar>
      <Bar className={cx({ open: filtersOpen })}>
        <TitleArea>
          <span>
            {t('Filters')} ({filterConfigs.length})
          </span>
          {/* <Dropdown
            overlay={
              <MenuItems
                toggleSideBar={toggleFiltersBar}
                closeDropdown={() => setDropdownOpen(false)}
              />
            }
            trigger={['click']}
            visible={dropdownOpen}
            onVisibleChange={handleVisibleChange}
          >
            <Icon name="more-horiz" />
          </Dropdown> */}
          <FilterConfigurationLink createNewOnOpen>
            <Icon name="plus-large" title={t('new filter')} />
          </FilterConfigurationLink>
          <Icon name="expand" onClick={toggleFiltersBar} />
        </TitleArea>
        <ActionButtons>
          <Button buttonStyle="primary" type="submit" buttonSize="sm">
            {t('Apply')}
          </Button>
          <Button buttonStyle="secondary" buttonSize="sm">
            {t('Reset All')}
          </Button>
        </ActionButtons>
        <FilterControls>
          {filterConfigs.map(filter => (
            <FilterControl
              key={filter.id}
              filter={filter}
              filters={filterConfigs}
            />
          ))}
        </FilterControls>
      </Bar>
    </>
  );
};

export default FilterBar;
