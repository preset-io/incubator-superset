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
import React, { useState } from 'react';
import shortid from 'shortid';
import { styled, t } from '@superset-ui/core';
import { Form, Icon } from 'src/common/components';
import { StyledModal } from 'src/common/components/Modal';
import Tabs from 'src/common/components/Tabs';
import { useFilterConfigMap, useFilterConfiguration } from './state';
import FilterConfigForm from './FilterConfigForm';
import { FilterConfiguration, NativeFiltersForm } from './types';

const StyledModalBody = styled.div`
  display: flex;
  flex-direction: row;
  .filters-list {
    width 200px;
    overflow: auto;
  }
`;

const RemovedStatus = styled.span<{ removed: boolean }>`
  text-decoration: ${({ removed }) => (removed ? 'line-through' : 'none')};
`;

const StyledForm = styled(Form)`
  max-width: 100%;
`;

function generateFilterId() {
  return `FILTER_V2-${shortid.generate()}`;
}

export interface FilterConfigModalProps {
  isOpen: boolean;
  initialFilterId?: string;
  save: (filterConfig: FilterConfiguration) => Promise<void>;
  onCancel: () => void;
}

export function FilterConfigModal({
  isOpen,
  initialFilterId,
  save,
  onCancel,
}: FilterConfigModalProps) {
  const [form] = Form.useForm<NativeFiltersForm>();

  const filterConfig = useFilterConfiguration();
  const filterConfigMap = useFilterConfigMap();

  // some filter ids may belong to filters that do not exist yet
  const getInitialFilterIds = () => filterConfig.map(filter => filter.id);
  const [filterIds, setFilterIds] = useState(getInitialFilterIds);
  const getInitialCurrentFilterId = () => initialFilterId ?? filterIds[0];
  const [currentFilterId, setCurrentFilterId] = useState(
    getInitialCurrentFilterId,
  );
  const [removedFilters, setRemovedFilters] = useState<Record<string, boolean>>(
    {},
  );

  function resetForm() {
    form.resetFields();
    setFilterIds(getInitialFilterIds());
    setCurrentFilterId(getInitialCurrentFilterId());
    setRemovedFilters({});
  }

  function onTabEdit(filterId: string, action: 'add' | 'remove') {
    if (action === 'remove') {
      setRemovedFilters({
        ...removedFilters,
        // trash can button is actually a toggle
        [filterId]: !removedFilters[filterId],
      });
    } else if (action === 'add') {
      setFilterIds([...filterIds, generateFilterId()]);
    }
  }

  function getFilterTitle(id: string) {
    // TODO use edited name from the form here
    return filterConfigMap[id]?.name ?? 'New Filter';
  }

  async function onOk() {
    try {
      const values = (await form.validateFields()) as NativeFiltersForm;
      const newFilterConfig: FilterConfiguration = filterIds
        .filter(id => !!values.filters[id] && !removedFilters[id])
        .map(id => {
          // create a filter config object from the form inputs
          debugger
          const formInputs = values.filters[id];
          return {
            id,
            name: formInputs.name,
            type: formInputs.type,
            // for now there will only ever be one target
            targets: [
              {
                datasetId: formInputs.dataset.value,
                column: formInputs.column.value,
              },
            ],
            defaultValue: formInputs.defaultValue,
            scope: formInputs.scope,
            isInstant: formInputs.isInstant,
          };
        });
      return
      await save(newFilterConfig);
      resetForm();
    } catch (info) {
      console.log('Filter Configuration Failed:', info);
    }
  }

  return (
    <StyledModal
      visible={isOpen}
      title={t('Filter Configuration and Scoping')}
      onCancel={() => {
        resetForm();
        onCancel();
      }}
      onOk={onOk}
      okText={t('Save')}
      cancelText={t('Cancel')}
    >
      <StyledModalBody>
        <StyledForm>
          <Tabs
            type="editable-card"
            onChange={setCurrentFilterId}
            activeKey={currentFilterId}
            onEdit={onTabEdit}
          >
            {filterIds.map(id => (
              <Tabs.TabPane
                tab={
                  <RemovedStatus removed={!!removedFilters[id]}>
                    {getFilterTitle(id)}
                  </RemovedStatus>
                }
                key={id}
                closeIcon={<Icon name="trash" />}
              >
                <FilterConfigForm
                  form={form}
                  filterId={id}
                  filterToEdit={filterConfigMap[id]}
                />
              </Tabs.TabPane>
            ))}
          </Tabs>
        </StyledForm>
      </StyledModalBody>
    </StyledModal>
  );
}
