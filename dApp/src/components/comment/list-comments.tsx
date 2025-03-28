/* eslint-disable import/no-cycle, react/no-unused-prop-types */
import { CommentItem } from '@components/comment/comment-item';
import { Spin } from 'antd';
import { PureComponent } from 'react';
import { IComment, IUser } from 'src/interfaces/index';

interface IProps {
  comments: IComment[];
  total?: number;
  requesting: boolean;
  onDelete?: Function;
  user?: IUser;
  canReply?: boolean
}

export class ListComments extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;

  render() {
    const {
      comments, requesting, user, onDelete, canReply
    } = this.props;

    return (
      <div className="cmt-list">
        {comments.map((comment: IComment) => <CommentItem canReply={canReply} key={comment._id} item={comment} user={user} onDelete={onDelete} />)}
        {requesting && <div className="text-center"><img src="/static/trax_loading_optimize.gif" alt="Loading..." className='w-28 m-auto'/></div>}
        {!requesting && !comments.length && <div className="first-to-comment">Be the first to comment</div>}
      </div>
    );
  }
}

ListComments.defaultProps = {
  total: 0,
  onDelete: () => {},
  user: {} as IUser,
  canReply: false
} as Partial<IProps>;
