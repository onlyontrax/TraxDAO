import { Component, Fragment } from "react";
import { Avatar, Modal } from "antd";
import Link from "next/link";
import {CheckBadgeIcon} from '@heroicons/react/24/solid'
export interface IProps {
  close: () => void;
  isOpen: boolean;
}

class UserListModal<OtherProps> extends Component<IProps & OtherProps> {
  title: string = "Title";

  state: {
    users: {
      id: string;
      name: string;
      username: string;
      avatarPath: string;
      verifiedAccount: boolean;
      isPerformer: boolean;
    }[];
  } = {
    users: [],
  };

  render() {
    return (
      <Modal
        centered
        footer={null}
        onCancel={this.props.close}
        open={this.props.isOpen}
        styles={{
          header: { borderBottom: "1px solid rgb(100,100,100)", paddingBottom: 10, marginBottom: 0 },
          body: { maxHeight: 320, overflowY: "scroll", padding: 0 },
        }}
        title={<div style={{ height: "100%", textAlign: "center", marginTop: 5 }}>{this.title}</div>}
        width={400}
      >
        <div
          style={{
            color: "white",
            display: "flex",
            flexDirection: "column",
            gap: 20,
            paddingTop: 10,
            paddingRight: 15,
            paddingBlock: 10,
            paddingLeft: 15,
          }}
        >
          {this.state.users
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(u => {
              const LR = () => (
                <LikeRow
                  avatarPath={u.avatarPath}
                  name={u.name}
                  verifiedAccount={u.verifiedAccount}
                  username={u.username}
                />
              );
              if (u.isPerformer)
                return (
                  <Link key={u.username} href={`/${u.username}`}>
                    <LR />
                  </Link>
                );
              return (
                <Fragment key={u.username}>
                  <LR />
                </Fragment>
              );
            })}
        </div>
      </Modal>
    );
  }
}

class LikeRow extends Component<{
  avatarPath: string;
  name: string;
  verifiedAccount: boolean;
  username: string;
}> {
  render() {
    return (
      <div style={{ alignItems: "center", display: "flex" }}>
        <Avatar
          className="ant-avatart-image"
          alt={`${this.props.username}'s avatar`}
          src={this.props.avatarPath}
          size={40}
        />
        <div style={{ paddingLeft: 10 }}>{this.props.name}</div>
        {this.props.verifiedAccount && <CheckBadgeIcon className="feed-v-badge" />}
      </div>
    );
  }
}

export default UserListModal;
