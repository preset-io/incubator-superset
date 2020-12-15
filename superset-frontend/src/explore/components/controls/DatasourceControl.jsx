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
import React from 'react';
import PropTypes from 'prop-types';
import { t, styled } from '@superset-ui/core';

import { Dropdown, Menu } from 'src/common/components';
import { Tooltip } from 'src/common/components/Tooltip';
import Icon from 'src/components/Icon';
import ChangeDatasourceModal from 'src/datasource/ChangeDatasourceModal';
import DatasourceModal from 'src/datasource/DatasourceModal';
import { postForm } from 'src/explore/exploreUtils';

const propTypes = {
  actions: PropTypes.object.isRequired,
  onChange: PropTypes.func,
  value: PropTypes.string,
  datasource: PropTypes.object.isRequired,
  isEditable: PropTypes.bool,
  onDatasourceSave: PropTypes.func,
};

const defaultProps = {
  onChange: () => {},
  onDatasourceSave: null,
  value: null,
  isEditable: true,
};

const Styles = styled.div`
  .ant-dropdown-trigger {
    margin-left: ${({ theme }) => theme.gridUnit}px;
    box-shadow: none;
    &:active {
      box-shadow: none;
    }
  }

  .btn-group .open .dropdown-toggle {
    box-shadow: none;
    &.button-default {
      background: none;
    }
  }

  i.angle {
    color: ${({ theme }) => theme.colors.primary.base};
  }

  svg.datasource-modal-trigger {
    color: ${({ theme }) => theme.colors.primary.base};
    vertical-align: ${({ theme }) => theme.gridUnit + 2}px;
    cursor: pointer;
  }
  .title-select {
    width: ${({ theme }) => theme.gridUnit * 52}px;
    display: inline-block;
    background-color: #f0f0f0;
    padding: ${({ theme }) => theme.gridUnit * 2}px;
    border-radius: 3px;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  .dataset-svg {
    vertical-align: ${({ theme }) => theme.gridUnit + 2}px;
    margin-right: 10px;
  }
`;

const CHANGE_DATASET = 'change_dataset';
const VIEW_IN_SQL_LAB = 'view_in_sql_lab';
const EDIT_DATASET = 'edit_dataset';

class DatasourceControl extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showEditDatasourceModal: false,
      showChangeDatasourceModal: false,
    };
    this.onDatasourceSave = this.onDatasourceSave.bind(this);
    this.toggleChangeDatasourceModal = this.toggleChangeDatasourceModal.bind(
      this,
    );
    this.toggleEditDatasourceModal = this.toggleEditDatasourceModal.bind(this);
    this.toggleShowDatasource = this.toggleShowDatasource.bind(this);
    this.handleMenuItemClick = this.handleMenuItemClick.bind(this);
  }

  onDatasourceSave(datasource) {
    this.props.actions.setDatasource(datasource);
    if (this.props.onDatasourceSave) {
      this.props.onDatasourceSave(datasource);
    }
  }

  toggleShowDatasource() {
    this.setState(({ showDatasource }) => ({
      showDatasource: !showDatasource,
    }));
  }

  toggleChangeDatasourceModal() {
    this.setState(({ showChangeDatasourceModal }) => ({
      showChangeDatasourceModal: !showChangeDatasourceModal,
    }));
  }

  toggleEditDatasourceModal() {
    this.setState(({ showEditDatasourceModal }) => ({
      showEditDatasourceModal: !showEditDatasourceModal,
    }));
  }

  handleMenuItemClick({ key }) {
    if (key === CHANGE_DATASET) {
      this.toggleChangeDatasourceModal();
    }
    if (key === EDIT_DATASET) {
      this.toggleEditDatasourceModal();
    }
    if (key === VIEW_IN_SQL_LAB) {
      const { datasource } = this.props;
      const payload = {
        datasourceKey: `${datasource.id}__${datasource.type}`,
        sql: datasource.sql,
      };
      postForm('/superset/sqllab', payload);
    }
  }

  render() {
    const { showChangeDatasourceModal, showEditDatasourceModal } = this.state;
    const { datasource, onChange } = this.props;

    const datasourceMenu = (
      <Menu onClick={this.handleMenuItemClick}>
        {this.props.isEditable && (
          <Menu.Item key={EDIT_DATASET} data-test="edit-dataset">
            {t('Edit Dataset')}
          </Menu.Item>
        )}
        <Menu.Item key={CHANGE_DATASET}>{t('Change Dataset')}</Menu.Item>
        <Menu.Item key={VIEW_IN_SQL_LAB}>{t('View in SQL Lab')}</Menu.Item>
      </Menu>
    );

    return (
      <Styles className="DatasourceControl">
        <div className="data-container">
          <Icon name="dataset-physical" className="dataset-svg" />
          <Tooltip title={datasource.name}>
            <span className="title-select">{datasource.name}</span>
          </Tooltip>
          <Dropdown
            overlay={datasourceMenu}
            trigger={['click']}
            data-test="datasource-menu"
          >
            <Tooltip title={t('More dataset related options')}>
              <Icon
                className="datasource-modal-trigger"
                data-test="datasource-menu-trigger"
                name="more-horiz"
              />
            </Tooltip>
          </Dropdown>
        </div>
        {showEditDatasourceModal && (
          <DatasourceModal
            datasource={datasource}
            show={showEditDatasourceModal}
            onDatasourceSave={this.onDatasourceSave}
            onHide={this.toggleEditDatasourceModal}
          />
        )}
        {showChangeDatasourceModal && (
          <ChangeDatasourceModal
            onDatasourceSave={this.onDatasourceSave}
            onHide={this.toggleChangeDatasourceModal}
            show={showChangeDatasourceModal}
            onChange={onChange}
          />
        )}
      </Styles>
    );
  }
}

DatasourceControl.propTypes = propTypes;
DatasourceControl.defaultProps = defaultProps;

export default DatasourceControl;
