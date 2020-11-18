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
import { t } from '@superset-ui/core';
import { ButtonProps } from 'antd/lib/button';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import shortid from 'shortid';
import { Button, Form } from 'src/common/components';
import { StyledModal } from 'src/common/components/Modal';
import { createFilter } from 'src/dashboard/actions/nativeFilters';
import { DASHBOARD_ROOT_ID } from 'src/dashboard/util/constants';
import { Filter, FilterType } from './types';
import FilterConfigForm from './FilterConfigForm';
import FiltersList from './FiltersList';

/** Special purpose AsyncSelect that selects a column from a dataset */

interface FilterCreateModalProps {
  isOpen: boolean;
  filterType: FilterType;
  setFilterType: Function;
  save: (values: Record<string, any>) => Promise<void>;
  onCancel: () => void;
}

type FiltersToEdit = Filter;

function FilterCreateModal({
  isOpen,
  save,
  filterType,
  setFilterType,
  onCancel,
}: FilterCreateModalProps) {
  const [form] = Form.useForm();

  // antd form manages the dataset value,
  // but we track it here so that we can pass it to the column select
  const [dataset, setDataset] = useState<DatasetSelectValue | null>(null);
  const [edit, showEdit] = useState(false);
  const [filterToEdit, setFilterToEdit] = useState<FiltersToEdit>({});

  function resetForm() {
    form.resetFields();
    setDataset(null);
  }
  console.log('state', edit, filterToEdit);
  return (
    <StyledModal
      visible={isOpen}
      title={t('Filter Configuration and Scoping')}
      onCancel={() => {
        resetForm();
        onCancel();
      }}
      onOk={async () => {
        let values = {};
        try {
          values = await form.validateFields();
        } catch (info) {
          console.log('Validate Failed:', info);
        }
        await save(values);
        resetForm();
      }}
      okText={t('Save')}
      cancelText={t('Cancel')}
    >
      <FiltersList
        setEditFilter={setFilterToEdit}
        showEdit={showEdit}
        setDataset={setDataset}
      />
      <FilterConfigForm
        dataset={dataset}
        filterType={filterType}
        setFilterType={setFilterType}
        setDataset={setDataset}
        key={filterToEdit?.id}
        form={form}
        filterToEdit={filterToEdit}
        edit={edit}
      />
    </StyledModal>
  );
}

function generateFilterId() {
  return `FILTER_V2-${shortid.generate()}`;
}

const CreateFilterButton: React.FC<ButtonProps> = ({
  children,
  ...buttonProps
}) => {
  const [filterType, setFilterType] = useState<FilterType>(FilterType.text);
  const [isOpen, setOpen] = useState(false);
  const dispatch = useDispatch();

  function close() {
    setOpen(false);
  }

  async function submit(values: Record<string, any>) {
    dispatch(
      createFilter({
        id: generateFilterId(),
        name: values.name,
        type: filterType,
        // for now there will only ever be one target
        targets: [
          {
            datasetId: values.dataset.value,
            column: values.column.value,
          },
        ],
        defaultValue: values.defaultValue,
        scope: {
          rootPath: [DASHBOARD_ROOT_ID],
          excluded: [],
        },
        isInstant: values.isInstant,
      }),
    );
    close();
  }

  return (
    <>
      <Button {...buttonProps} onClick={() => setOpen(true)}>
        {children}
      </Button>
      <FilterCreateModal
        isOpen={isOpen}
        save={submit}
        setFilterType={setFilterType}
        filterType={filterType}
        onCancel={close}
      />
    </>
  );
};

export default CreateFilterButton;
