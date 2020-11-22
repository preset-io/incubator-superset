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

import React, { FC, useState } from 'react';
import { t } from '@superset-ui/core';
import {
  Form,
  Radio,
  Typography,
  Space,
  FormInstance,
} from '../../../common/components';
import { Filter, NativeFiltersForm, Scoping } from './types';
import ScopingTree from './ScopingTree';
import { DASHBOARD_ROOT_ID } from '../../util/constants';

type FilterScopeProps = {
  filterId: string;
  filterToEdit?: Filter;
  form: FormInstance<NativeFiltersForm>;
};

const defaultScopeValue = {
  rootPath: [DASHBOARD_ROOT_ID],
  excluded: [],
};

const FilterScope: FC<FilterScopeProps> = ({
  filterId,
  filterToEdit,
  form,
}) => {
  const [advancedScopingOpen, setAdvancedScopingOpen] = useState<Scoping>(
    Scoping.all,
  );

  const { scope = defaultScopeValue } = filterToEdit || {};

  const groupingInitialValue =
    scope &&
    scope.rootPath === defaultScopeValue.rootPath &&
    scope.excluded === defaultScopeValue.excluded
      ? Scoping.all
      : Scoping.specific;

  return (
    <Space direction="vertical">
      <Form.Item
        name={['filters', filterId, 'scope']}
        hidden
        initialValue={scope}
      />
      <Radio.Group
        defaultValue={groupingInitialValue}
        onChange={({ target: { value } }) => {
          setAdvancedScopingOpen(value as Scoping);
        }}
      >
        <Radio value={Scoping.all}>{t('Apply to all panels')}</Radio>
        <Radio value={Scoping.specific}>{t('Apply to specific panels')}</Radio>
      </Radio.Group>
      <Typography.Text type="secondary">
        {advancedScopingOpen === Scoping.specific
          ? t('Only selected panels will be affected by this filter')
          : t('All panels with this column will be affected by this filter')}
      </Typography.Text>
      {advancedScopingOpen === Scoping.specific && (
        <ScopingTree
          form={form}
          filterToEdit={filterToEdit}
          filterId={filterId}
        />
      )}
    </Space>
  );
};

export default FilterScope;
