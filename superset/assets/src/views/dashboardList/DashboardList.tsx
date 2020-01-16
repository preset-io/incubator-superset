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
import { SupersetClient } from '@superset-ui/connection';
import { t } from '@superset-ui/translation';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
// @ts-ignore
import { Button, Modal, Panel } from 'react-bootstrap';
import ListView from 'src/components/ListView/ListView';
import { FilterTypeMap } from 'src/components/ListView/types';
import { FetchDataConfig } from 'src/components/ListView/types';
import withToasts from 'src/messageToasts/enhancers/withToasts';
import ConfirmStatusChange from 'src/components/ConfirmStatusChange';

import './DashboardList.less';

const PAGE_SIZE = 25;

interface Props {
  addDangerToast: (msg: string) => void;
}

interface State {
  dashboards: any[];
  dashboardCount: number;
  loading: boolean;
  filterTypes: FilterTypeMap;
  permissions: string[];
  labelColumns: { [key: string]: string };
}

type Dashboard = {
  id: number,
  changed_by: string,
  changed_by_name: string,
  changed_by_url: string,
  changed_on: string,
  dashboard_title: string
  published: boolean,
  url: string,
}

class DashboardList extends React.PureComponent<Props, State> {

  get canEdit() {
    return this.hasPerm('can_edit');
  }

  get canDelete() {
    return this.hasPerm('can_delete');
  }

  get canExport() {
    return this.hasPerm('can_mulexport')
  }

  public static propTypes = {
    addDangerToast: PropTypes.func.isRequired,
  };

  public state: State = {
    dashboardCount: 0,
    dashboards: [],
    filterTypes: {},
    labelColumns: {},
    loading: false,
    permissions: [],
  };

  public columns: any = [];

  public initialSort = [{ id: 'changed_on', desc: true }];

  constructor(props: Props) {
    super(props);
    this.setColumns();
  }

  public setColumns = () => {
    this.columns = [
      {
        Cell: ({
          row: {
            original: { url, dashboard_title },
          },
        }: any) => <a href={url}>{dashboard_title}</a>,
        Header: this.state.labelColumns.dashboard_title || '',
        accessor: 'dashboard_title',
        filterable: true,
        sortable: true,
      },
      {
        Cell: ({
          row: {
            original: { changed_by_name, changed_by_url },
          },
        }: any) => <a href={changed_by_url}>{changed_by_name}</a>,
        Header: this.state.labelColumns.changed_by_name || '',
        accessor: 'changed_by_fk',
        sortable: true,
      },
      {
        Cell: ({
          row: {
            original: { published },
          },
        }: any) => (
            <span className='no-wrap'>{published ? <i className='fa fa-check' /> : ''}</span>
          ),
        Header: this.state.labelColumns.published || '',
        accessor: 'published',
        sortable: true,
      },
      {
        Cell: ({
          row: {
            original: { changed_on },
          },
        }: any) => (
            <span className='no-wrap'>{moment(changed_on).fromNow()}</span>
          ),
        Header: this.state.labelColumns.changed_on || '',
        accessor: 'changed_on',
        sortable: true,
      },
      {
        Cell: ({ row: { state, original } }: any) => {
          const handleEdit = () => this.handleDashboardEdit(original);
          const handleExport = () => this.handleBulkDashboardExport([original])
          if (!this.canEdit && !this.canDelete && !this.canExport) {
            return null;
          }

          return (
            <ConfirmStatusChange title={t('Please Confirm')} description={`${t('Are you sure you want to delete')} ${original.dashboard_title}?`}>
              {confirmDelete => (
                <span className={`actions ${state && state.hover ? '' : 'invisible'}`}>
                  {this.canDelete && (
                    <span
                      role='button'
                      className='action-button'
                      onClick={confirmDelete(() => this.handleDashboardDelete(original))}
                    >
                      <i className='fa fa-trash' />
                    </span>
                  )}
                  {this.canExport && (
                    <span
                      role='button'
                      className='action-button'
                      onClick={handleExport}
                    >
                      <i className='fa fa-database' />
                    </span>
                  )}
                  {this.canEdit && (
                    <span
                      role='button'
                      className='action-button'
                      onClick={handleEdit}
                    >
                      <i className='fa fa-pencil' />
                    </span>
                  )}
                </span>
              )}
            </ConfirmStatusChange>
          );
        },
        Header: t('Actions'),
        id: 'actions',
      },
    ];
  }

  public hasPerm = (perm: string) => {
    if (!this.state.permissions.length) {
      return false;
    }

    return Boolean(this.state.permissions.find((p) => p === perm));
  }

  public handleDashboardEdit = ({ id }: { id: number }) => {
    window.location.assign(`/dashboard/edit/${id}`);
  }

  public handleDashboardDelete = ({ id, dashboard_title }: Dashboard) => {
    return SupersetClient.delete({
      endpoint: `/api/v1/dashboard/${id}`,
    }).then(
      () => {
        const dashboards = this.state.dashboards.filter((d) => d.id !== id);
        this.setState({
          dashboards
        });
      },
      (err: any) => {
        console.error(err);
        this.props.addDangerToast(t('There was an issue deleting') + `${dashboard_title}`);
      },
    );
  }

  public handleBulkDashboardDelete = (dashboards: Dashboard[]) => {
    Promise.all(dashboards.map(this.handleDashboardDelete))
  }

  public handleBulkDashboardExport = (dashboards: Dashboard[]) => {
    return window.location.href = `/api/v1/dashboard/export/?q=!(${dashboards.map(({ id }) => id).join(',')})`
  }

  public fetchData = ({
    pageIndex,
    pageSize,
    sortBy,
    filters,
  }: FetchDataConfig) => {
    this.setState({ loading: true });
    const filterExps = filters.map(({ id, filterId, value }) => ({
      col: id,
      opr: filterId,
      value,
    }));

    const queryParams = JSON.stringify({
      order_column: sortBy[0].id,
      order_direction: sortBy[0].desc ? 'desc' : 'asc',
      page: pageIndex,
      page_size: pageSize,
      ...(filterExps.length ? { filters: filterExps } : {}),
    });

    return SupersetClient.get({
      endpoint: `/api/v1/dashboard/?q=${queryParams}`,
    })
      .then(({ json = {} }) => {
        this.setState({ dashboards: json.result, dashboardCount: json.count, labelColumns: json.label_columns });
      })
      .catch(() => {
        this.props.addDangerToast(
          t('An error occurred while fetching Dashboards'),
        );
      })
      .finally(() => {
        this.setColumns();
        this.setState({ loading: false });
      });
  }

  public componentDidMount() {
    SupersetClient.get({
      endpoint: `/api/v1/dashboard/_info`,
    })
      .then(({ json = {} }) => {
        this.setState({ filterTypes: json.filters, permissions: json.permissions });
      });
  }

  public render() {
    const { dashboards, dashboardCount, loading, filterTypes } = this.state;
    return (
      <div className='container welcome'>
        <Panel>
          <ConfirmStatusChange title={t('Please Confirm')} description={t('Are you sure you want to delete the selected dashboards?')}>
            {confirmDelete => {
              let bulkActions = [];
              if (this.canDelete) {
                bulkActions.push({
                  key: 'delete',
                  name: <><i className="fa fa-trash" /> Delete</>,
                  onSelect: confirmDelete(this.handleBulkDashboardDelete)
                })
              }
              if (this.canExport) {
                bulkActions.push({
                  key: 'export',
                  name: <><i className="fa fa-database" /> Export</>,
                  onSelect: this.handleBulkDashboardExport
                })
              }
              return (
                <ListView
                  className='dashboard-list-view'
                  title={'Dashboards'}
                  columns={this.columns}
                  data={dashboards}
                  count={dashboardCount}
                  pageSize={PAGE_SIZE}
                  fetchData={this.fetchData}
                  loading={loading}
                  initialSort={this.initialSort}
                  filterTypes={filterTypes}
                  bulkActions={bulkActions}
                />
              )
            }}
          </ConfirmStatusChange>
        </Panel>
      </div>
    );
  }
}

export default withToasts(DashboardList);
