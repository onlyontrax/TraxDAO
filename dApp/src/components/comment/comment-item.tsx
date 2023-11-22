/* eslint-disable no-prototype-builtins, import/no-cycle */
import {
  CaretDownOutlined, CaretUpOutlined, HeartFilled, HeartOutlined, MoreOutlined
} from '@ant-design/icons';
import {
  createComment, deleteComment, getComments, moreComment
} from '@redux/comment/actions';
import { reactionService } from '@services/index';
import {
  Dropdown, Image, Menu, message
} from 'antd';
import moment from 'moment';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IComment, IUser } from 'src/interfaces/index';
import { ListComments } from './list-comments';
import { CommentForm } from './comment-form';

interface IProps {
  item: IComment;
  comment: any;
  onDelete?: Function;
  user?: IUser;
  canReply?: boolean;
  getComments: Function;
  moreComment: Function;
  createComment: Function;
  deleteComment: Function;
  commentMapping: any;
  siteName: string;
}

class CommentItemEx extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;

  state = {
    isLiked: false,
    isOpenComment: false,
    isFirstLoadComment: true,
    itemPerPage: 10,
    commentPage: 0,
    isReply: false,
    totalReply: 0,
    totalLike: 0
  };

  componentDidMount() {
    const { item } = this.props;
    if (item) {
      this.setState({
        isLiked: !!item.isLiked,
        totalLike: item.totalLike || 0,
        totalReply: item.totalReply ? item.totalReply : 0
      });
    }
  }

  async handleComment(values) {
    const { createComment: handleCreate } = this.props;
    const { totalReply } = this.state;
    handleCreate(values);
    await this.setState({ isReply: false, isOpenComment: false, totalReply: totalReply + 1 });
    this.onOpenComment();
  }

  async onOpenComment() {
    const { item, getComments: handleGetComment } = this.props;
    const {
      isOpenComment, isFirstLoadComment, itemPerPage, commentPage
    } = this.state;
    this.setState({ isOpenComment: !isOpenComment });
    if (isFirstLoadComment) {
      await this.setState({ isFirstLoadComment: false });
      handleGetComment({
        objectId: item._id,
        objectType: 'comment',
        limit: itemPerPage,
        offset: commentPage
      });
    }
  }

  async onLikeComment(comment) {
    const { isLiked, totalLike } = this.state;
    try {
      if (!isLiked) {
        await reactionService.create({
          objectId: comment._id,
          action: 'like',
          objectType: 'comment'
        });
        this.setState({ isLiked: true, totalLike: totalLike + 1 });
      } else {
        await reactionService.delete({
          objectId: comment._id,
          action: 'like',
          objectType: 'comment'
        });
        this.setState({ isLiked: false, totalLike: totalLike - 1 });
      }
    } catch (e) {
      const error = await e;
      message.error(error.message || 'Error occured, please try again later');
    }
  }

  async moreComment() {
    const { item, moreComment: handleLoadMore } = this.props;
    const { commentPage, itemPerPage } = this.state;
    await this.setState({
      commentPage: commentPage + 1
    });
    handleLoadMore({
      limit: itemPerPage,
      objectType: 'comment',
      offset: (commentPage + 1) * itemPerPage,
      objectId: item._id
    });
  }

  async deleteComment(item) {
    const { deleteComment: handleDelete } = this.props;
    if (!window.confirm('Are you sure to remove this comment?')) return;
    handleDelete(item._id);
  }

  render() {
    const {
      item, user, canReply, onDelete, commentMapping, comment, siteName
    } = this.props;
    const { requesting: commenting } = comment;
    const fetchingComment = commentMapping.hasOwnProperty(item._id) ? commentMapping[item._id].requesting : false;
    const comments = commentMapping.hasOwnProperty(item._id) ? commentMapping[item._id].items : [];
    const totalComments = commentMapping.hasOwnProperty(item._id) ? commentMapping[item._id].total : 0;
    const {
      isLiked, isOpenComment, isReply, totalReply, totalLike
    } = this.state;
    const CaretUpOutlinedProps: any = { rotationSlider: !isOpenComment ? 180 : 0 };

    return (
      <div>
        <div className="cmt-item" key={item._id}>
          <Image alt="creator-avt" src={item?.creator?.avatar || '/static/no-avatar.png'} />
          <div className="cmt-content">
            <div className="cmt-user-wrapper">
              <div className="cmt-user">
                <span>
                  <span className="cmt-username">{item?.creator?.username || 'N/A'}</span>

                  <p className="cmt-text">{item.content}</p>
                </span>
                <div className="cmt-stats">
                  <span className="cmt-time">{moment(item.createdAt).fromNow()}</span>
                  <span className={totalLike > 0 ? 'cmt-like-total' : 'cmt-like-total-hidden'}>
                    {totalLike > 0 && totalLike}
                    {' '}
                    {totalLike > 1 ? 'likes' : 'like'}
                  </span>
                  <span className="cmt-action">
                    {canReply && (
                      <a
                        aria-hidden
                        className={!isReply ? 'cmt-reply' : 'cmt-reply active'}
                        onClick={() => this.setState({ isReply: !isReply })}
                      >
                        Reply
                      </a>
                    )}
                  </span>
                  {user._id === item.createdBy && (
                    <Dropdown
                      className="cmt-option"
                      overlay={(
                        <Menu key={`menu_cmt_${item._id}`}>
                          <Menu.Item key={`delete_cmt_${item._id}`} onClick={() => onDelete(item)}>
                            <a>Delete</a>
                          </Menu.Item>
                        </Menu>
                      )}
                    >
                      <a aria-hidden className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
                        <MoreOutlined style={{ transform: 'rotate(90deg)' }} />
                      </a>
                    </Dropdown>
                  )}
                </div>
              </div>
              <a
                aria-hidden
                className={isLiked ? 'cmt-like active' : 'cmt-like'}
                onClick={this.onLikeComment.bind(this, item)}
              >
                {isLiked ? <HeartFilled /> : <HeartOutlined />}
                {' '}
              </a>
            </div>
            <div className={isReply ? 'reply-bl-form active' : 'reply-bl-form'}>
              <div className="feed-comment">
                <CommentForm
                  creator={user}
                  onSubmit={this.handleComment.bind(this)}
                  objectId={item._id}
                  objectType="comment"
                  requesting={commenting}
                  isReply
                  siteName={siteName}
                />
              </div>
            </div>
            {canReply && totalReply > 0 && (
              <div className={isOpenComment ? 'view-cmt' : 'hide-cmt'}>
                <a aria-hidden onClick={this.onOpenComment.bind(this)}>
                  {' '}
                  {isOpenComment ? (
                    <CaretUpOutlined {...CaretUpOutlinedProps} />
                  ) : (
                    <CaretDownOutlined {...CaretUpOutlinedProps} />
                  )}
                  {' '}
                  <span className="view-hide-cmt">{!isOpenComment ? 'View' : 'Hide'}</span>
                  {' '}
                  {totalReply > 1 ? 'replies ' : 'reply '}
                  {` (${totalReply})`}
                </a>
              </div>
            )}
          </div>
        </div>
        {isOpenComment && (
          <div className="reply-bl-list">
            <div>
              <ListComments
                key={`list_comments_${item._id}_${comments.length}`}
                requesting={fetchingComment}
                comments={comments}
                total={totalComments}
                onDelete={this.deleteComment.bind(this)}
                user={user}
                canReply={false}
              />
              {comments.length < totalComments && (
                <p className="text-center">
                  <a aria-hidden onClick={this.moreComment.bind(this)}>
                    more...
                  </a>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}

CommentItemEx.defaultProps = {
  onDelete: () => {},
  user: {} as IUser,
  canReply: false
} as Partial<IProps>;

const mapStates = (state: any) => {
  const { commentMapping, comment } = state.comment;
  return {
    commentMapping,
    comment,
    siteName: state.ui.siteName
  };
};

const mapDispatch = {
  getComments,
  moreComment,
  createComment,
  deleteComment
};

export const CommentItem = connect(mapStates, mapDispatch)(CommentItemEx);
