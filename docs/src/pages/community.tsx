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
import { css } from '@emotion/core';
import {
  Badge, Card, List, Tooltip,
} from 'antd';
import { GithubOutlined } from '@ant-design/icons';
import { useStaticQuery, graphql } from 'gatsby';
import SEO from '../components/seo';
import Layout from '../components/layout';
import { pmc } from '../resources/data';

const links = [
  [
    'https://apache-superset.slack.com/join/shared_invite/zt-g8lpruog-HeqpgYrwdfrD5OYhlU7hPQ#/',
    'Slack',
    'interact with other Superset users and community members',
  ],
  [
    'https://github.com/apache/incubator-superset',
    'GitHub',
    'create tickets to report issues, report bugs, and suggest new features',
  ],
  [
    'https://lists.apache.org/list.html?dev@superset.apache.org',
    'dev@ Mailing List',
    'participate in conversations with committers and contributors',
  ],
  [
    'https://stackoverflow.com/questions/tagged/superset+apache-superset',
    'Stack Overflow',
    'our growing knowledge base',
  ],
  [
    'https://www.meetup.com/Global-Apache-Superset-Community-Meetup/',
    'Superset Meetup Group',
    'join our monthly virtual meetups and register for any upcoming events',
  ],
  [
    'https://github.com/apache/incubator-superset/blob/master/INTHEWILD.md',
    'Organizations',
    'a list of some of the organizations using Superset in production',
  ],
  [
    'https://github.com/apache-superset/awesome-apache-superset',
    'Contributors Guide',
    'Interested in contributing? Learn how to contribute and best practices',
  ],
];

const contributorsStyle = css`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  margin: 0 auto;
  overflow: auto;
  .communityCard {
    font-size: 12px;
    overflow: hidden;
    margin: 10px 10px;
    .ant-card-meta-title {
      text-overflow: clip;
      white-space: normal;
    }
    .ant-card-body {
      padding: 8px;
      display:inline-block;
      white-space: nowrap;
    }
  }
`;

const getInvolvedContainer = css`
  margin-bottom: 25px;
`;

const ContributorCard = ({
  url, imageUrl, login, name,
}) => (
  <a href={url} target="_blank" rel="noreferrer" key={login}>
    <Card
      className="communityCard"
      hoverable
      style={{ width: '150px' }}
      size="small"
      cover={<img alt="example" src={imageUrl} />}
    >
      <GithubOutlined style={{ paddingRight: 3, paddingTop: 3 }} />
      {name}
    </Card>
  </a>
);
const ContributorCardSmall = ({
  url, imageUrl, login, name,
}) => (
  <Tooltip title={name} key={login}>
    <a href={url} target="_blank" rel="noreferrer">
      <img src={imageUrl} style={{ width: '75px' }} />
    </a>
  </Tooltip>
);

const Community = () => {
  const pmcList = pmc.map((e) => (
    <ContributorCard
      url={e.github}
      imageUrl={e.image}
      name={e.name}
    />
  ));
  const pmcGithub = new Set(pmc.map((u) => u.github.split('/')[3]));
  console.log(pmcGithub);
  const contributors = useStaticQuery(graphql`
    query {
      allGitHubContributor {
        nodes {
          login
          name
          url
          avatarUrl
        }
      }
    }
  `).allGitHubContributor.nodes;
  return (
    <Layout>
      <div className="contentPage">
        <SEO title="Community" />
        <section>
          <h1 className="title">Community</h1>
          Get involved in our welcoming, fast growing community!
        </section>
        <section className="joinCommunity">
          <div css={getInvolvedContainer}>
            <h2>Get involved!</h2>
            <List
              size="small"
              bordered
              dataSource={links}
              renderItem={([href, link, post]) => (
                <List.Item>
                  <a href={href}>{link}</a>
                  {' '}
                  -
                  {' '}
                  {post}
                </List.Item>
              )}
            />
          </div>
        </section>
        <section className="ppmc">
          <h2>
            Apache Committers
            {' '}
            <Badge count={pmcList.length} overflowCount={5000} />
          </h2>
          <div css={contributorsStyle}>{pmcList}</div>
        </section>
        <section>
          <h2>
            GitHub Contributors
            {' '}
            <Badge count={contributors.length} overflowCount={5000} />
          </h2>
          <div css={contributorsStyle}>
            {contributors.filter((u) => !pmcGithub.has(u.login)).map((u) => (
              <ContributorCardSmall
                url={u.url}
                imageUrl={u.avatarUrl}
                name={u.name || u.login}
              />
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Community;
