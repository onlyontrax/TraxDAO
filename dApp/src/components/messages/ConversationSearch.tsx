import React from 'react';
import { SearchOutlined } from '@ant-design/icons';
import styles from './ConversationSearch.module.scss';

interface IProps {
  onSearch: any;
}

export default function ConversationSearch({ onSearch }: IProps) {
  return (
    <div className={styles.componentsMessagesConversationSearchModule}>
      <div className="conversation-search">
        <SearchOutlined />
        <input
          onChange={onSearch}
          type="search"
          className="conversation-search-input"
          placeholder="Search contact..."
        />
      </div>
    </div>
  );
}
